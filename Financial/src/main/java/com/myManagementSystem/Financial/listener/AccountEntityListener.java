package com.myManagementSystem.Financial.listener;

import com.myManagementSystem.Financial.entity.Account;
import com.myManagementSystem.Financial.entity.AccountSnapshot;
import com.myManagementSystem.Financial.repository.AccountSnapshotRepository;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostUpdate;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AccountEntityListener {
  private final AccountSnapshotRepository snapshotRepository;

  public AccountEntityListener(@Lazy AccountSnapshotRepository snapshotRepository) {
    this.snapshotRepository = snapshotRepository;
  }

  @PostPersist
  @PostUpdate
  public void takeSnapshot(Account account) {
    AccountSnapshot snapshot = AccountSnapshot.builder()
        .accountId(account.getId())
        .balance(account.getCurrentBalance())
        .snapshotDate(LocalDateTime.now())
        .build();

    snapshotRepository.save(snapshot);
  }

}
