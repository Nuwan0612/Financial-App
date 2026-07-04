package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.TradeTransactionRequestDTO;
import com.myManagementSystem.Financial.dto.TradeTransactionResponseDTO;
import com.myManagementSystem.Financial.entity.Account;
import com.myManagementSystem.Financial.entity.Bucket;
import com.myManagementSystem.Financial.entity.InvestmentCompany;
import com.myManagementSystem.Financial.entity.TradeTransaction;
import com.myManagementSystem.Financial.enums.StockTransactionSide;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AccountRepository;
import com.myManagementSystem.Financial.repository.BucketRepository;
import com.myManagementSystem.Financial.repository.InvestmentCompanyRepository;
import com.myManagementSystem.Financial.repository.TradeTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TradeTransactionService {

  private final TradeTransactionRepository tradeRepository;
  private final InvestmentCompanyRepository companyRepository;

  // Injecting your Account and Bucket repositories directly
  private final AccountRepository accountRepository;
  private final BucketRepository bucketRepository;

  @Transactional
  public TradeTransactionResponseDTO createTrade(TradeTransactionRequestDTO request) {
    log.info("Executing {} order for Company ID: {}", request.type(), request.companyId());

    // 1. Fetch Entities
    InvestmentCompany company = companyRepository.findById(request.companyId())
        .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.companyId()));

    Account account = accountRepository.findById(request.accountId())
        .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.accountId()));

    Bucket bucket = bucketRepository.findById(request.bucketId())
        .orElseThrow(() -> new ResourceNotFoundException("Bucket not found: " + request.bucketId()));

    // 2. Calculate Total Trade Value securely on the backend
    BigDecimal investmentAmount = request.quantity().multiply(request.executionPrice());

    // 3. Handle Cash Logic (BUY vs SELL)
    if (request.type() == StockTransactionSide.BUY) {
      // Check if you have enough buying power!
      if (bucket.getCurrentAmount().compareTo(investmentAmount) < 0) {
        throw new IllegalStateException("Insufficient funds in Bucket to execute BUY order.");
      }
      // Deduct cash for a BUY
      account.setCurrentBalance(account.getCurrentBalance().subtract(investmentAmount));
      bucket.setCurrentAmount(bucket.getCurrentAmount().subtract(investmentAmount));

    } else if (request.type() == StockTransactionSide.SELL) {
      // Add cash for a SELL
      account.setCurrentBalance(account.getCurrentBalance().add(investmentAmount));
      bucket.setCurrentAmount(bucket.getCurrentAmount().add(investmentAmount));

      // Note: For SELL, cumulativeAmount might also need adjusting depending on your business logic.
    }

    // Save updated cash balances
    accountRepository.save(account);
    bucketRepository.save(bucket);

    // 4. Build and save the Trade Ledger Entry
    TradeTransaction trade = TradeTransaction.builder()
        .type(request.type())
        .quantity(request.quantity())
        .executionPrice(request.executionPrice())
        .investmentAmount(investmentAmount)
        .transactionDate(LocalDateTime.now())
        .company(company)
        .build();

    TradeTransaction savedTrade = tradeRepository.save(trade);

    log.info("Successfully executed trade and updated Account/Bucket balances.");
    return mapToDTO(savedTrade);
  }

  // READ ALL
  public List<TradeTransactionResponseDTO> getAllTrades() {
    return tradeRepository.findAll().stream()
        .map(this::mapToDTO)
        .toList();
  }

  // READ BY COMPANY
  public List<TradeTransactionResponseDTO> getTradesByCompanyId(Long companyId) {
    return tradeRepository.findByCompanyIdOrderByTransactionDateDesc(companyId).stream()
        .map(this::mapToDTO)
        .toList();
  }

  // Helper Method
  private TradeTransactionResponseDTO mapToDTO(TradeTransaction trade) {
    return new TradeTransactionResponseDTO(
        trade.getId(),
        trade.getCompany().getId(),
        trade.getCompany().getSymbol(),
        trade.getType(),
        trade.getQuantity(),
        trade.getExecutionPrice(),
        trade.getInvestmentAmount(),
        trade.getTransactionDate()
    );
  }
}