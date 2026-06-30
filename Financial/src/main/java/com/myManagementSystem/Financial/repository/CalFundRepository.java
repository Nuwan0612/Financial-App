package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.CalFund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalFundRepository extends JpaRepository<CalFund, Long> {
    List<CalFund> findByIsActiveTrue();
}