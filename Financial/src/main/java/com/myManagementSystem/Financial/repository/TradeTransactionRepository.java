package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.TradeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeTransactionRepository extends JpaRepository<TradeTransaction, Long> {

  // Custom query to fetch all historical trades for a specific stock
  List<TradeTransaction> findByCompanyIdOrderByTransactionDateDesc(Long companyId);
}