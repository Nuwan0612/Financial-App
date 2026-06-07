package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.LiabilityPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LiabilityPaymentsRepository extends JpaRepository<LiabilityPayment, Long> {
}
