package com.myManagementSystem.Financial.repository;

import com.myManagementSystem.Financial.entity.SpotAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpotAssetRepository extends JpaRepository<SpotAsset, Long> {
    Optional<SpotAsset> findByCoin(String coin);
    List<SpotAsset> findByAccountId(Long accountId);
}
