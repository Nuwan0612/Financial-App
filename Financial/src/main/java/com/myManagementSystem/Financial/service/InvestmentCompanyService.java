package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.InvestmentCompanyRequestDTO;
import com.myManagementSystem.Financial.dto.InvestmentCompanyResponseDTO;
import com.myManagementSystem.Financial.entity.Account;
import com.myManagementSystem.Financial.entity.InvestmentCompany;
import com.myManagementSystem.Financial.entity.Sector;
import com.myManagementSystem.Financial.entity.TradeTransaction;
import com.myManagementSystem.Financial.enums.StockTransactionSide;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AccountRepository;
import com.myManagementSystem.Financial.repository.InvestmentCompanyRepository;
import com.myManagementSystem.Financial.repository.SectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvestmentCompanyService {

  private final InvestmentCompanyRepository companyRepository;
  private final SectorRepository sectorRepository;
  private final AccountRepository accountRepository;

  @Transactional
  public InvestmentCompanyResponseDTO createCompany(InvestmentCompanyRequestDTO dto) {
    log.info("Creating new Investment Company: {}", dto.symbol());

    if (companyRepository.existsBySymbol(dto.symbol())) {
      throw new IllegalArgumentException("Company with symbol " + dto.symbol() + " already exists.");
    }

    Sector sector = sectorRepository.findById(dto.sectorId())
        .orElseThrow(() -> new ResourceNotFoundException("Sector not found with ID: " + dto.sectorId()));

    InvestmentCompany company = InvestmentCompany.builder()
        .symbol(dto.symbol())
        .name(dto.name())
        .currentPrice(dto.currentPrice() != null ? dto.currentPrice() : BigDecimal.ZERO)
        .isSp20(dto.isSp20())
        .sector(sector)
        .isActive(true)
        .build();

    InvestmentCompany savedCompany = companyRepository.save(company);
    return mapToDTO(savedCompany);
  }

  public List<InvestmentCompanyResponseDTO> getAllCompanies() {
    log.info("Fetching all investment companies");
    return companyRepository.findByIsActiveTrue().stream()
        .map(this::mapToDTO)
        .toList();
  }

  public InvestmentCompanyResponseDTO getCompanyById(Long id) {
    log.info("Fetching company with ID: {}", id);
    InvestmentCompany company = companyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));
    return mapToDTO(company);
  }

  @Transactional
  public InvestmentCompanyResponseDTO updateCompanyPrice(Long companyId, BigDecimal newPrice, Long accountId) {
    log.info("Updating price for company ID: {} to {}", companyId, newPrice);

    InvestmentCompany company = companyRepository.findById(companyId)
        .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));

    Account account = accountRepository.findById(accountId)
        .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));

    BigDecimal oldPrice = company.getCurrentPrice() != null ? company.getCurrentPrice() : BigDecimal.ZERO;
    BigDecimal priceDifference = newPrice.subtract(oldPrice);

    // 1. Calculate Active Shares
    BigDecimal totalActiveShares = BigDecimal.ZERO;
    if (company.getTransactions() != null) {
      for (TradeTransaction trade : company.getTransactions()) {
        if (trade.getType() == StockTransactionSide.BUY) {
          totalActiveShares = totalActiveShares.add(trade.getQuantity());
        } else if (trade.getType() == StockTransactionSide.SELL) {
          totalActiveShares = totalActiveShares.subtract(trade.getQuantity());
        }
      }
    }

    // 2. Apply the Delta to the Account (Only if you own shares)
    if (totalActiveShares.compareTo(BigDecimal.ZERO) > 0) {
      BigDecimal valueChange = priceDifference.multiply(totalActiveShares);
      account.setCurrentBalance(account.getCurrentBalance().add(valueChange));
      accountRepository.save(account);
      log.info("Adjusted Account {} balance by {} due to price change.", accountId, valueChange);
    }

    // 3. Save the new price
    company.setCurrentPrice(newPrice);
    return mapToDTO(companyRepository.save(company));
  }

  @Transactional
  public InvestmentCompanyResponseDTO updateCompany(Long id, InvestmentCompanyRequestDTO dto) {
    log.info("Updating entire Investment Company ID: {}", id);

    InvestmentCompany company = companyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));

    // Safety check: If the symbol is being changed, ensure the new symbol isn't already taken
    if (!company.getSymbol().equalsIgnoreCase(dto.symbol()) && companyRepository.existsBySymbol(dto.symbol())) {
      throw new IllegalArgumentException("Another company with symbol " + dto.symbol() + " already exists.");
    }

    Sector sector = sectorRepository.findById(dto.sectorId())
        .orElseThrow(() -> new ResourceNotFoundException("Sector not found with ID: " + dto.sectorId()));

    // Update all fields
    company.setSymbol(dto.symbol());
    company.setName(dto.name());
    company.setCurrentPrice(dto.currentPrice() != null ? dto.currentPrice() : BigDecimal.ZERO);
    company.setIsSp20(dto.isSp20());
    company.setSector(sector);

    return mapToDTO(companyRepository.save(company));
  }

  // ── Helper Method: The Financial Calculator ───────────────────────────────
  private InvestmentCompanyResponseDTO mapToDTO(InvestmentCompany company) {
    BigDecimal totalActiveShares = BigDecimal.ZERO;
    BigDecimal totalCostOfBuys = BigDecimal.ZERO;
    BigDecimal totalSharesBought = BigDecimal.ZERO;

    // 1. Parse the ledger to find average cost and active shares
    if (company.getTransactions() != null) {
      for (TradeTransaction trade : company.getTransactions()) {
        if (trade.getType() == StockTransactionSide.BUY) {
          totalActiveShares = totalActiveShares.add(trade.getQuantity());
          totalSharesBought = totalSharesBought.add(trade.getQuantity());
          totalCostOfBuys = totalCostOfBuys.add(trade.getInvestmentAmount());
        } else if (trade.getType() == StockTransactionSide.SELL) {
          totalActiveShares = totalActiveShares.subtract(trade.getQuantity());
        }
      }
    }

    // Prevent negative shares due to bad data
    if (totalActiveShares.compareTo(BigDecimal.ZERO) < 0) {
      totalActiveShares = BigDecimal.ZERO;
    }

    // 2. Calculate Average Cost per share
    BigDecimal averageCostPerShare = BigDecimal.ZERO;
    if (totalSharesBought.compareTo(BigDecimal.ZERO) > 0) {
      averageCostPerShare = totalCostOfBuys.divide(totalSharesBought, 4, RoundingMode.HALF_UP);
    }

    // 3. Calculate Final Metrics
    BigDecimal currentPrice = company.getCurrentPrice() != null ? company.getCurrentPrice() : BigDecimal.ZERO;

    BigDecimal totalInvestedAmount = averageCostPerShare.multiply(totalActiveShares);
    BigDecimal currentTotalValue = currentPrice.multiply(totalActiveShares);
    BigDecimal totalProfit = currentTotalValue.subtract(totalInvestedAmount);

    String sectorName = company.getSector() != null ? company.getSector().getName() : "Uncategorized";

    return new InvestmentCompanyResponseDTO(
        company.getId(),
        company.getSymbol(),
        company.getName(),
        currentPrice,
        sectorName,
        company.getIsSp20(),
        company.getIsActive(),
        totalActiveShares,
        totalInvestedAmount,
        currentTotalValue,
        totalProfit
    );
  }
}