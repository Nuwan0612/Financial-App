package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.MainCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MainCategoryRepository extends JpaRepository<MainCategory, Long> {
  List<MainCategory> findByIsActiveTrue();
}
