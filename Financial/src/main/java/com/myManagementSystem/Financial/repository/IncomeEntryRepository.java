package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.IncomeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncomeEntryRepository extends JpaRepository<IncomeEntry, Long> {
  List<IncomeEntry> findByIncomeId(Long incomeId);
}
