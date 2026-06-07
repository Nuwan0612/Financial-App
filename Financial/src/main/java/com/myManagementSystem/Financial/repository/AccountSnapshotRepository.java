package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.AccountSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountSnapshotRepository extends JpaRepository<AccountSnapshot, Long> {
  List<AccountSnapshot> findByAccountId(Long accountId);
}
