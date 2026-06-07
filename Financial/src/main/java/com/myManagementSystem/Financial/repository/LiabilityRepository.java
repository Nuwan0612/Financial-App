package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.Liability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LiabilityRepository extends JpaRepository<Liability, Long> {
}
