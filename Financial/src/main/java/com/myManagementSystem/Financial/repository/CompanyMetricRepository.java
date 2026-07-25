package com.myManagementSystem.Financial.repository;

import org.springframework.stereotype.Repository;

import com.myManagementSystem.Financial.entity.CompanyMetric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

@Repository
public interface CompanyMetricRepository extends JpaRepository<CompanyMetric, Long> {
  // We can fetch via the InvestmentCompany's ID
  Optional<CompanyMetric> findByCompanyId(Long companyId);
}
