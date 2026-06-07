package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.DailyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {
}
