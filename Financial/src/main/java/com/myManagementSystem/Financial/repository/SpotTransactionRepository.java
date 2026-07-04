package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.SpotTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpotTransactionRepository extends JpaRepository<SpotTransaction, Long> {
    List<SpotTransaction> findBySpotAssetIdOrderByTransactionDateDesc(Long spotAssetId);
}