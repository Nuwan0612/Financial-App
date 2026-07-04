package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.InvestmentCompany;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvestmentCompanyRepository extends JpaRepository<InvestmentCompany, Long> {

  // Automatically fetches the Sector and Metrics in the same SQL query
  @EntityGraph(attributePaths = {"sector", "metric"})
  List<InvestmentCompany> findAll();

  @EntityGraph(attributePaths = {"sector", "metric", "transactions"})
  Optional<InvestmentCompany> findById(Long id);

  boolean existsBySymbol(String symbol);
}