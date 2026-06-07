package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.AccountRequestDTO;
import com.myManagementSystem.Financial.dto.AccountResponseDTO;
import com.myManagementSystem.Financial.dto.AccountSnapshotResponseDTO;
import com.myManagementSystem.Financial.entity.Account;
import com.myManagementSystem.Financial.entity.AccountSnapshot;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AccountRepository;
import com.myManagementSystem.Financial.repository.AccountSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {

  private final AccountRepository accountRepository;
  private final AccountSnapshotRepository accountSnapshotRepository;

  // CREATE
  public AccountResponseDTO createAccount(AccountRequestDTO accountRequestDTO) {
    log.info("Attempting to create new Account {}", accountRequestDTO.name());

    BigDecimal startingBalance = accountRequestDTO.currentBalance() != null
        ? accountRequestDTO.currentBalance()
        : BigDecimal.ZERO;

    Account account = Account.builder()
        .name(accountRequestDTO.name())
        .type(accountRequestDTO.type())
        .currentBalance(startingBalance)
        .build();

    Account savedAccount = accountRepository.save(account);
    log.info("Successfully saved Account with ID {}", savedAccount.getId());
    return mapToDTO(savedAccount);
  }

  // READ ALL
  public List<AccountResponseDTO> getAllAccounts() {
    log.info("Attempting to get all Accounts from database");

    List<AccountResponseDTO> accounts = accountRepository.findByIsActiveTrue()
        .stream()
        .map(this::mapToDTO)
        .toList();

    log.debug("Successfully retrieved {} Accounts", accounts.size());
    return accounts;
  }

  // READ ONE
  public AccountResponseDTO getAccountById(Long id) {
    log.info("Attempting to get Account by ID {}", id);
    Account account = accountRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Account with ID {} not found", id);
          return new ResourceNotFoundException("Account with ID " + id + " not found");
        });
    return mapToDTO(account);
  }

  // UPDATE
  public AccountResponseDTO updateAccountById(Long id,  AccountRequestDTO accountRequestDTO) {
    log.info("Attempting to update Account by ID {}", id);
    Account existingAccount = accountRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Update failed. Account not found with ID: {}", id);
          return new ResourceNotFoundException("Account with ID " + id + " not found");
        });

    log.debug("Updating Account {}.", existingAccount.getName());

    existingAccount.setName(accountRequestDTO.name());
    existingAccount.setType(accountRequestDTO.type());
    existingAccount.setCurrentBalance(accountRequestDTO.currentBalance());

    Account updatedAccount = accountRepository.save(existingAccount);
    log.info("Successfully updated Account with ID: {}", id);

    return mapToDTO(updatedAccount);
  }

  @Transactional
  public void deleteAccountById(Long id) {
    log.info("Attempting to delete Account by ID {}", id);

    Account account = accountRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Account with ID " + id + " not found"));

    // ZERO-OUT RULE: Check if the account has any money left
    if (account.getCurrentBalance().compareTo(BigDecimal.ZERO) > 0) {
      log.warn("Deletion failed. Account {} still has a balance.", account.getName());
      throw new IllegalStateException("Cannot delete this Account. Please transfer the remaining balance out first.");
    }

    // Safe to delete. Hibernate will cascade delete all SubCategories and Buckets,
    // and the @PreRemove will detach the transactions!
    accountRepository.delete(account);
    log.info("Successfully deleted Account with ID: {}", id);
  }

  // Helper Method
  private AccountResponseDTO mapToDTO(Account account) {
    return new AccountResponseDTO(
        account.getId(),
        account.getName(),
        account.getType(),
        account.getCurrentBalance(),
        account.getIsActive()
    );
  }

  public List<AccountSnapshotResponseDTO> getSnapshots(Long accoundId) {
    log.info("Attempting to get Snapshots of Account by ID {}", accoundId);

    List<AccountSnapshot> accountSnapshots = accountSnapshotRepository.findByAccountId(accoundId);

    return accountSnapshots.stream()
        .map(snapshot -> new AccountSnapshotResponseDTO(
            snapshot.getId(),
            snapshot.getAccountId(),
            snapshot.getBalance(),
            snapshot.getSnapshotDate()
        ))
        .toList();
  }
}
