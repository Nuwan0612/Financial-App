package com.myManagementSystem.Financial.repository;


import com.myManagementSystem.Financial.entity.Bucket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BucketRepository extends JpaRepository<Bucket, Long> {
  List<Bucket> findAllByMainAccountId(Long accountId);
  List<Bucket> findAllByMainAccountIdAndIsActiveTrue(Long accountId);
  List<Bucket> findByIsActiveTrue();
}
