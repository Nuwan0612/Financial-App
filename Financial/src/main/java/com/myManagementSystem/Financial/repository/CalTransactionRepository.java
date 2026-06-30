package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.CalTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalTransactionRepository extends JpaRepository<CalTransaction, Long> {
    List<CalTransaction> findByCalFundIdOrderByTransactionDateDesc(Long calFundId);
}