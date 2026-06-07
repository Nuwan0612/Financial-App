package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
  List<SubCategory> findByIsActiveTrue();
}
