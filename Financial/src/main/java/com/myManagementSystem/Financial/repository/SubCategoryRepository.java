package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
  @Query("SELECT s FROM SubCategory s WHERE s.isActive = true AND s.percentage > 0")
  List<SubCategory> findByIsActiveTrueAndPercentageGreaterThanZero();
  Optional<SubCategory> findByAccount_Id(Long accountId);
}
