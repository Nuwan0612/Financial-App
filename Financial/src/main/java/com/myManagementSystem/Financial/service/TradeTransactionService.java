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

  @Transactional // Make sure you have this annotation so the DB saves safely!
  public TradeTransactionResponseDTO createTrade(TradeTransactionRequestDTO request) {
    log.info("Executing {} order for Company ID: {}", request.type(), request.companyId());

    // 1. Fetch Entities
    InvestmentCompany company = companyRepository.findById(request.companyId())
        .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.companyId()));

    // You actually don't even need to fetch the Account anymore if you aren't updating it!
    // But if your TradeTransaction entity requires linking the account, leave this fetch here.
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
      // Deduct cash ONLY from Buying Power
      bucket.setCurrentAmount(bucket.getCurrentAmount().subtract(investmentAmount));

    } else if (request.type() == StockTransactionSide.SELL) {
      // Add cash BACK to Buying Power
      bucket.setCurrentAmount(bucket.getCurrentAmount().add(investmentAmount));
    }

    // Save updated cash balance
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

    log.info("Successfully executed trade and updated Bucket balance.");
    return mapToDTO(savedTrade);
  }

  @Transactional
  public void deleteTradeById(Long tradeId, Long bucketId) {
    log.info("Processing deletion for trade ID: {}", tradeId);

    // 1. Fetch Entities
    TradeTransaction trade = tradeRepository.findById(tradeId)
        .orElseThrow(() -> new ResourceNotFoundException("Trade not found with ID: " + tradeId));

    Bucket bucket = bucketRepository.findById(bucketId)
        .orElseThrow(() -> new ResourceNotFoundException("Bucket not found with ID: " + bucketId));

    InvestmentCompany company = trade.getCompany();
    BigDecimal tradeAmount = trade.getInvestmentAmount();

    // 2. Revert the Buying Power (Bucket) based on original Trade Type
    if (trade.getType() == StockTransactionSide.BUY) {
      // Undoing a BUY: Return the cash back to available buying power
      bucket.setCurrentAmount(bucket.getCurrentAmount().add(tradeAmount));

    } else if (trade.getType() == StockTransactionSide.SELL) {
      // Undoing a SELL: Deduct the erroneously released cash from buying power
      if (bucket.getCurrentAmount().compareTo(tradeAmount) < 0) {
        throw new IllegalStateException("Cannot delete SELL trade. Insufficient funds in Bucket to reverse the cash release.");
      }
      bucket.setCurrentAmount(bucket.getCurrentAmount().subtract(tradeAmount));
    }

    // 3. Save updated bucket balance
    bucketRepository.save(bucket);

    // 4. Calculate Remaining Shares to maintain 'isActive' status
    BigDecimal remainingShares = BigDecimal.ZERO;
    if (company.getTransactions() != null) {
      for (TradeTransaction t : company.getTransactions()) {
        // Exclude the trade we are currently deleting from the math
        if (!t.getId().equals(tradeId)) {
          if (t.getType() == StockTransactionSide.BUY) {
            remainingShares = remainingShares.add(t.getQuantity());
          } else if (t.getType() == StockTransactionSide.SELL) {
            remainingShares = remainingShares.subtract(t.getQuantity());
          }
        }
      }
    }

    // 5. Toggle the Company's active status based on remaining shares
    if (remainingShares.compareTo(BigDecimal.ZERO) <= 0 && Boolean.TRUE.equals(company.getIsActive())) {
      company.setIsActive(false);
      companyRepository.save(company);
      log.info("Marked company {} as inactive due to 0 remaining shares.", company.getSymbol());

    } else if (remainingShares.compareTo(BigDecimal.ZERO) > 0 && Boolean.FALSE.equals(company.getIsActive())) {
      company.setIsActive(true);
      companyRepository.save(company);
      log.info("Restored company {} to active status.", company.getSymbol());
    }

    // 6. Delete the trade ledger record
    tradeRepository.delete(trade);

    log.info("Successfully deleted trade ID: {} and restored balances.", tradeId);
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