package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.FuturesPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FuturesPositionRepository extends JpaRepository<FuturesPosition, Long> {
  List<FuturesPosition> findByAccountId(Long accountId);
}