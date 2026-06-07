package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.*;
import com.myManagementSystem.Financial.entity.*;
import com.myManagementSystem.Financial.enums.TransactionType;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AccountRepository;
import com.myManagementSystem.Financial.repository.BucketRepository;
import com.myManagementSystem.Financial.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

  private final TransactionRepository transactionRepository;
  private final AccountRepository accountRepository;
  private final BucketRepository bucketRepository;

  // ── Create single transaction ───────────────────────────────
  @Transactional
  public TransactionResponseDTO createTransaction(TransactionRequestDTO dto) {

    Account toAccount = accountRepository.findById(dto.toAccountId())
        .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + dto.toAccountId()));

    Bucket toBucket = bucketRepository.findById(dto.toBucketId())
        .orElseThrow(() -> new ResourceNotFoundException("Bucket not found: " + dto.toBucketId()));

    String fromAccountName = null;
    String fromBucketName = null;

    if (dto.fromAccountId() != null) {
      fromAccountName = accountRepository.findById(dto.fromAccountId())
          .map(Account::getName)
          .orElse("Unknown");
    }

    if (dto.fromBucketId() != null) {
      fromBucketName = bucketRepository.findById(dto.fromBucketId())
          .map(Bucket::getName)
          .orElse("Unknown");
    }

    Transaction tx = Transaction.builder()
        .description(dto.description())
        .amount(dto.amount())
        .status(false)
        .openingDate(dto.openingDate())
        .toAccountId(dto.fromAccountId())
        .fromAccountName(fromAccountName)
        .fromBucketId(dto.fromBucketId())
        .fromBucketName(fromBucketName)
        .toAccountId(toAccount.getId())
        .toAccountName(toAccount.getName())
        .toBucketId(toBucket.getId())
        .toBucketName(toBucket.getName())
        .build();

    return mapToDTO(transactionRepository.save(tx));
  }

  // ── Bulk create (from calculator) ──────────────────────────
  @Transactional
  public List<TransactionResponseDTO> createTransactions(List<TransactionRequestDTO> dtos) {
    return dtos.stream().map(this::createTransaction).toList();
  }

  @Transactional
  public void markAsSuccess(Long transactionId) {
    Transaction tx = transactionRepository.findById(transactionId)
        .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

    if (Boolean.TRUE.equals(tx.getStatus())) {
      throw new IllegalStateException("Transaction already processed.");
    }

    BigDecimal amount = tx.getAmount();

    // Update account balance
    accountRepository.findById(tx.getToAccountId()).ifPresent(account -> {
      account.setCurrentBalance(account.getCurrentBalance().add(amount));
      accountRepository.save(account);
    });

    // Update bucket balance
    bucketRepository.findById(tx.getToBucketId()).ifPresent(bucket -> {
      bucket.setCurrentAmount(bucket.getCurrentAmount().add(amount));
      bucket.setCumulativeAmount(bucket.getCumulativeAmount().add(amount));
      bucketRepository.save(bucket);
    });

    tx.setStatus(true);
    tx.setClosingDate(LocalDate.now());
    transactionRepository.save(tx);
  }

  @Transactional
  public List<TransactionResponseDTO> bulkTransfer(List<TransactionRequestDTO> dtos) {
    return dtos.stream().map(this::transfer).toList();
  }


  @Transactional
  public TransactionResponseDTO transfer(TransactionRequestDTO dto) {

    Account fromAccount = accountRepository.findById(dto.fromAccountId())
        .orElseThrow(() -> new ResourceNotFoundException("From account not found"));
    Bucket fromBucket = bucketRepository.findById(dto.fromBucketId())
        .orElseThrow(() -> new ResourceNotFoundException("From bucket not found"));
    Account toAccount = accountRepository.findById(dto.toAccountId())
        .orElseThrow(() -> new ResourceNotFoundException("To account not found"));
    Bucket toBucket = bucketRepository.findById(dto.toBucketId())
        .orElseThrow(() -> new ResourceNotFoundException("To bucket not found"));

    if (fromBucket.getCurrentAmount().compareTo(dto.amount()) < 0) {
      throw new IllegalStateException("Insufficient funds in source bucket.");
    }

    fromBucket.setCurrentAmount(fromBucket.getCurrentAmount().subtract(dto.amount()));
    fromAccount.setCurrentBalance(fromAccount.getCurrentBalance().subtract(dto.amount()));
    toBucket.setCurrentAmount(toBucket.getCurrentAmount().add(dto.amount()));
    toAccount.setCurrentBalance(toAccount.getCurrentBalance().add(dto.amount()));

    bucketRepository.saveAll(List.of(fromBucket, toBucket));
    accountRepository.saveAll(List.of(fromAccount, toAccount));

    Transaction tx = Transaction.builder()
        .description(dto.description() != null ? dto.description() : "Internal Transfer")
        .amount(dto.amount())
        .status(false)
        .openingDate(LocalDate.now())
        .closingDate(null)
        .fromAccountId(fromAccount.getId())
        .fromAccountName(fromAccount.getName())
        .fromBucketId(fromBucket.getId())
        .fromBucketName(fromBucket.getName())
        .toAccountId(toAccount.getId())
        .toAccountName(toAccount.getName())
        .toBucketId(toBucket.getId())
        .toBucketName(toBucket.getName())
        .build();

    return mapToDTO(transactionRepository.save(tx));
  }

  // ── Get all ────────────────────────────────────────────────
  public List<TransactionResponseDTO> getAll() {
    return transactionRepository.findAll().stream().map(this::mapToDTO).toList();
  }

  private TransactionResponseDTO mapToDTO(Transaction tx) {
    return new TransactionResponseDTO(
        tx.getId(),
        tx.getDescription(),
        tx.getAmount(),
        tx.getStatus(),
        tx.getOpeningDate(),
        tx.getClosingDate(),
        tx.getFromAccountId(),
        tx.getFromAccountName(),
        tx.getFromBucketId(),
        tx.getFromBucketName(),
        tx.getToAccountId(),
        tx.getToAccountName(),
        tx.getToBucketId(),
        tx.getToBucketName()
    );
  }
}
