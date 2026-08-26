package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
  List<SubCategory> findByIsActiveTrue();
  Optional<SubCategory> findByAccount_Id(Long accountId);
}
