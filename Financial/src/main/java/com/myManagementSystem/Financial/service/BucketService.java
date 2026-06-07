package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.BucketResponseDTO;
import com.myManagementSystem.Financial.entity.Account;
import com.myManagementSystem.Financial.entity.Bucket;
import com.myManagementSystem.Financial.entity.SubCategory;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.BucketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BucketService {

  private final BucketRepository bucketRepository;

  // This method is called behind the scenes!
  public void createBucketForSubCategory(SubCategory subCategory, Account account) {
    log.info("Automatically generating Bucket for new SubCategory: {}", subCategory.getName());

    Bucket newBucket = Bucket.builder()
        .name(subCategory.getName()) // Inherit the name from the rule
        .currentAmount(BigDecimal.ZERO)
        .cumulativeAmount(BigDecimal.ZERO)
        .subCategory(subCategory) // Link the rule
        .mainAccount(account)     // Link the account
        .build();

    bucketRepository.save(newBucket);
    log.info("Successfully created Bucket: {}", newBucket.getName());
  }

  @Transactional
  public void deleteBucketById(Long id) {
    log.info("Attempting to delete Bucket with ID {}", id);

    Bucket bucket = bucketRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Bucket not found with ID: " + id));

    // ZERO-OUT RULE
    if (bucket.getCurrentAmount().compareTo(BigDecimal.ZERO) > 0) {
      log.warn("Deletion failed. Bucket {} still has funds.", bucket.getName());
      throw new IllegalStateException("Cannot delete this Bucket. Please transfer the remaining balance out first.");
    }

    bucketRepository.delete(bucket);
    log.info("Successfully deleted Bucket with ID {}", id);
  }

  public List<BucketResponseDTO> getBuketsByAccount(Long accountId) {
    log.info("Attempting to get Buckets for Account {}", accountId);

    // 1. Fetch the list of buckets (Returns an empty list if none are found, which is safe!)
    List<Bucket> buckets = bucketRepository.findAllByMainAccountIdAndIsActiveTrue(accountId);

    // 2. Convert the List of Entities into a List of DTOs
    return buckets.stream()
        .map(bucket -> new BucketResponseDTO(
            bucket.getId(),
            bucket.getName(),
            bucket.getCurrentAmount(),
            bucket.getCumulativeAmount(),
            bucket.getSubCategory().getId(),
            bucket.getSubCategory().getName(),
            bucket.getMainAccount().getId(),
            bucket.getMainAccount().getName(),
            bucket.getIsActive()
        ))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<BucketResponseDTO> getAllActiveBuckets() {
    log.info("Attempting to get all ACTIVE Buckets from database");

    // 1. Fetch all active buckets
    List<Bucket> buckets = bucketRepository.findByIsActiveTrue();

    // 2. Convert entities to DTOs using your exact record structure
    List<BucketResponseDTO> activeBuckets = buckets.stream()
        .map(bucket -> new BucketResponseDTO(
            bucket.getId(),
            bucket.getName(),
            bucket.getCurrentAmount(),
            bucket.getCumulativeAmount(),
            bucket.getSubCategory().getId(),
            bucket.getSubCategory().getName(),
            bucket.getMainAccount().getId(),
            bucket.getMainAccount().getName(),
            bucket.getIsActive()
        ))
        .toList();

    log.debug("Successfully retrieved {} active Buckets", activeBuckets.size());
    return activeBuckets;
  }

}
