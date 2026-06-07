package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.DailyLogRequestDTO;
import com.myManagementSystem.Financial.dto.DailyLogResponseDTO;
import com.myManagementSystem.Financial.dto.DailyLogUpdateRequestDTO;
import com.myManagementSystem.Financial.entity.Account;
import com.myManagementSystem.Financial.entity.Bucket;
import com.myManagementSystem.Financial.entity.DailyLog;
import com.myManagementSystem.Financial.enums.LogType;
import com.myManagementSystem.Financial.enums.TransactionType;
import com.myManagementSystem.Financial.exception.InsufficientFundsException;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AccountRepository;
import com.myManagementSystem.Financial.repository.BucketRepository;
import com.myManagementSystem.Financial.repository.DailyLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyLogService {
  private final DailyLogRepository dailyLogRepository;
  private final AccountRepository accountRepository;
  private final BucketRepository bucketRepository;

  // CREATE
  @Transactional
  public DailyLogResponseDTO createDailyLog(DailyLogRequestDTO dto) {

    Account account = getAccount(dto.accountId());
    Bucket bucket = dto.bucketId() != null ? getBucket(dto.bucketId()) : null;

    // --- NEW: Defensive Balance Check ---
    // If it is an EXPENSE, and we have a bucket, ensure the bucket has enough money.
    if (dto.type() == LogType.EXPENSE && bucket != null) {
      // .compareTo returns -1 if the first value is less than the second
      if (bucket.getCurrentAmount().compareTo(dto.amount()) < 0) {
        throw new InsufficientFundsException(
            "Warning: Not enough funds in Bucket '" + bucket.getName() +
                "'. Current balance: " + bucket.getCurrentAmount() +
                ", Attempted expense: " + dto.amount()
        );
      }
    }

    // Optional: Do you want to check if the main Account has enough money too?
    if (dto.type() == LogType.EXPENSE && account.getCurrentBalance().compareTo(dto.amount()) < 0) {
      throw new InsufficientFundsException("Warning: Not enough funds in Account '" + account.getName() + "'.");
    }
    // ------------------------------------

    DailyLog dailyLog = DailyLog.builder()
        .date(dto.date())
        .description(dto.description())
        .amount(dto.amount())
        .type(dto.type())
        .account(account)
        .bucket(bucket)
        .build();

    // 1. Apply the math to the balances (Will only run if the checks above pass!)
    applyMath(dailyLog);

    DailyLog savedLog = dailyLogRepository.save(dailyLog);
    return mapToDTO(savedLog);
  }

  // BULK CREATE
  @Transactional
  public List<DailyLogResponseDTO> createDailyLogs(List<DailyLogRequestDTO> dtos) {
    log.info("Attempting to bulk create {} DailyLogs", dtos.size());

    // Loops through the array and feeds them one-by-one into your existing math engine!
    return dtos.stream()
        .map(this::createDailyLog)
        .toList();
  }

  // UPDATE
  @Transactional
  public DailyLogResponseDTO updateDailyLog(Long id, DailyLogRequestDTO dto) {
    DailyLog existingLog = dailyLogRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Log not found"));

    // 1. REVERT the old math using the old values
    revertMath(existingLog);

    // 2. Update the entity with the new data
    existingLog.setDate(dto.date());
    existingLog.setDescription(dto.description());
    existingLog.setAmount(dto.amount());
    existingLog.setType(dto.type());

    // Check if Account changed
    if (!existingLog.getAccount().getId().equals(dto.accountId())) {
      existingLog.setAccount(getAccount(dto.accountId()));
    }

    // Check if Bucket changed
    Long oldBucketId = existingLog.getBucket() != null ? existingLog.getBucket().getId() : null;
    if (dto.bucketId() == null) {
      existingLog.setBucket(null);
    } else if (!dto.bucketId().equals(oldBucketId)) {
      existingLog.setBucket(getBucket(dto.bucketId()));
    }

    // 3. APPLY the new math using the new values
    applyMath(existingLog);

    DailyLog updatedLog = dailyLogRepository.save(existingLog);
    return mapToDTO(updatedLog);
  }

  // BULK UPDATE
  @Transactional
  public List<DailyLogResponseDTO> updateDailyLogs(List<DailyLogUpdateRequestDTO> dtos) {
    log.info("Attempting to bulk update {} DailyLogs", dtos.size());

    return dtos.stream().map(dto -> {
      // Convert the Update DTO back into a Request DTO to feed your existing logic
      DailyLogRequestDTO requestData = new DailyLogRequestDTO(
          dto.date(),
          dto.description(),
          dto.amount(),
          dto.type(),
          dto.accountId(),
          dto.bucketId()
      );

      // Calls your existing Revert-and-Apply math engine!
      return updateDailyLog(dto.id(), requestData);
    }).toList();
  }

  // DELETE
  @Transactional
  public void deleteDailyLog(Long id) {
    DailyLog existingLog = dailyLogRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Log not found"));

    revertMath(existingLog);

    dailyLogRepository.delete(existingLog);
  }

  public List<DailyLogResponseDTO> getLogs() {
    log.info("Attempting to fetch all daily logs from database");

    List<DailyLogResponseDTO> logs = dailyLogRepository.findAll()
        .stream()
        .map(this::mapToDTO)
        .toList();

    log.debug("Successfully retrieved {} daily logs", logs.size());
    return logs;
  }


  private void applyMath(DailyLog log) {
    if (log.getType() == LogType.EXPENSE) {
      log.getAccount().setCurrentBalance(
          log.getAccount().getCurrentBalance().subtract(log.getAmount()));

      if (log.getBucket() != null) {
        log.getBucket().setCurrentAmount(
            log.getBucket().getCurrentAmount().subtract(log.getAmount()));
      }

    } else if (log.getType() == LogType.INCOME) {
      log.getAccount().setCurrentBalance(
          log.getAccount().getCurrentBalance().add(log.getAmount()));

      if (log.getBucket() != null) {
        log.getBucket().setCurrentAmount(
            log.getBucket().getCurrentAmount().add(log.getAmount()));
        log.getBucket().setCumulativeAmount(
            log.getBucket().getCumulativeAmount().add(log.getAmount()));
      }
    }
  }

  private void revertMath(DailyLog log) {
    if (log.getType() == LogType.EXPENSE) {
      log.getAccount().setCurrentBalance(
          log.getAccount().getCurrentBalance().add(log.getAmount()));

      if (log.getBucket() != null) {
        log.getBucket().setCurrentAmount(
            log.getBucket().getCurrentAmount().add(log.getAmount()));
      }

    } else if (log.getType() == LogType.INCOME) {
      log.getAccount().setCurrentBalance(
          log.getAccount().getCurrentBalance().subtract(log.getAmount()));

      if (log.getBucket() != null) {
        log.getBucket().setCurrentAmount(
            log.getBucket().getCurrentAmount().subtract(log.getAmount()));
        log.getBucket().setCumulativeAmount(
            log.getBucket().getCumulativeAmount().subtract(log.getAmount()));
      }
    }
  }

  private Account getAccount(Long id) {
    return accountRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Account not found"));
  }

  private Bucket getBucket(Long id) {
    return bucketRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Bucket not found"));
  }

  private DailyLogResponseDTO mapToDTO(DailyLog log) {
    return new DailyLogResponseDTO(
        log.getId(),
        log.getDate(),
        log.getDescription(),
        log.getAmount(),
        log.getType(),
        log.getAccount().getId(),
        log.getAccount().getName(),
        log.getBucket() != null ? log.getBucket().getId() : null,
        log.getBucket() != null ? log.getBucket().getName() : null
    );
  }


}
