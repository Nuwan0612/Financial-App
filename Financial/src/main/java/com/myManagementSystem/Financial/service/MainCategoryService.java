package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.MainCategoryRequestDTO;
import com.myManagementSystem.Financial.dto.MainCategoryResponseDTO;
import com.myManagementSystem.Financial.dto.conflicts.DestinationAccountDTO;
import com.myManagementSystem.Financial.dto.conflicts.DestinationBucketDTO;
import com.myManagementSystem.Financial.dto.conflicts.MainCategoryConflictBucketDTO;
import com.myManagementSystem.Financial.dto.conflicts.MainCategoryConflictResolutionPayloadDTO;
import com.myManagementSystem.Financial.entity.MainCategory;
import com.myManagementSystem.Financial.entity.SubCategory;
import com.myManagementSystem.Financial.exception.MainCategoryNotEmptyException;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AccountRepository;
import com.myManagementSystem.Financial.repository.MainCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MainCategoryService {
  
  private final MainCategoryRepository mainCategoryRepository;
  private final AccountRepository  accountRepository;

  // CREATE
  public MainCategoryResponseDTO createMainCategory(MainCategoryRequestDTO mainCategoryRequestDTO) {
    log.info("Attempting to create new MainCategory {}", mainCategoryRequestDTO.name());

    MainCategory mainCategory = MainCategory.builder()
        .category(mainCategoryRequestDTO.name())
        .build();

    MainCategory savedMainCategory = mainCategoryRepository.save(mainCategory);
    log.info("Successfully saved MainCategory with ID {}", savedMainCategory.getId());
    return mapToDTO(savedMainCategory);
  }

  // READ ALL
  public List<MainCategoryResponseDTO> getAllMainCategories() {
    log.info("Attempting to get all MainCategories from database");

    List<MainCategoryResponseDTO> mainCategories = mainCategoryRepository.findByIsActiveTrue()
        .stream()
        .map(this::mapToDTO)
        .toList();

    log.debug("Successfully retrieved {} MainCategories", mainCategories.size());
    return mainCategories;
  }

  // READ ONE
  public MainCategoryResponseDTO getMainCategoryById(Long id) {
    log.info("Attempting to get MainCategory by ID {}", id);
    MainCategory mainCategory = mainCategoryRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("MainCategory with ID {} not found", id);
          return new ResourceNotFoundException("MainCategory with ID " + id + " not found");
        });
    return mapToDTO(mainCategory);
  }

  // UPDATE
  public MainCategoryResponseDTO updateMainCategoryById(Long id, MainCategoryRequestDTO mainCategoryRequestDTO) {
    log.info("Attempting to update MainCategory by ID {}", id);
    MainCategory existingMainCategory = mainCategoryRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Update failed. MainCategory not found with ID: {}", id);
          return new ResourceNotFoundException("MainCategory with ID " + id + " not found");
        });

    log.debug("Updating MainCategory {}.", existingMainCategory.getCategory());

    existingMainCategory.setCategory(mainCategoryRequestDTO.name());

    MainCategory updatedMainCategory = mainCategoryRepository.save(existingMainCategory);
    log.info("Successfully updated MainCategory with ID: {}", id);

    return mapToDTO(updatedMainCategory);
  }

  @Transactional
  public void deleteMainCategoryById(Long id) {
    log.info("Attempting to delete MainCategory by ID {}", id);

    MainCategory mainCategory = mainCategoryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("MainCategory with ID " + id + " not found"));

    // 1. Find ALL funded buckets across all sub categories
    List<MainCategoryConflictBucketDTO> fundedBuckets = mainCategory.getSubCategories().stream()
        .flatMap(subCategory -> subCategory.getBuckets().stream()
            .filter(bucket -> bucket.getCurrentAmount().compareTo(BigDecimal.ZERO) > 0)
            .map(bucket -> new MainCategoryConflictBucketDTO(
                bucket.getId(),
                bucket.getName(),
                bucket.getCurrentAmount(),
                subCategory.getId(),
                subCategory.getName(),
                subCategory.getAccount().getId(),
                subCategory.getAccount().getName()
            ))
        )
        .toList();

    // 2. If conflict — build resolution payload
    if (!fundedBuckets.isEmpty()) {

      // Collect all sub category IDs under this main category
      List<Long> subCategoryIds = mainCategory.getSubCategories().stream()
          .map(SubCategory::getId)
          .toList();

      // Available destinations — exclude buckets belonging to this main category
      List<DestinationAccountDTO> availableDestinations = accountRepository.findAll().stream()
          .map(account -> new DestinationAccountDTO(
              account.getId(),
              account.getName(),
              account.getBuckets().stream()
                  .filter(b -> !subCategoryIds.contains(b.getSubCategory().getId()))
                  .map(b -> new DestinationBucketDTO(
                      b.getId(),
                      b.getName(),
                      b.getSubCategory().getName()
                  ))
                  .toList()
          ))
          .toList();

      MainCategoryConflictResolutionPayloadDTO payload = new MainCategoryConflictResolutionPayloadDTO(
          mainCategory.getId(),
          mainCategory.getCategory(),
          fundedBuckets,
          availableDestinations
      );

      log.warn("Deletion blocked for MainCategory {}.", mainCategory.getCategory());
      throw new MainCategoryNotEmptyException(
          "Cannot delete. Please empty all nested buckets first.",
          payload
      );
    }

    // 3. Safe to delete
    mainCategoryRepository.delete(mainCategory);
    log.info("Successfully deleted MainCategory with ID: {}", id);
  }

  // Helper Method
  private MainCategoryResponseDTO mapToDTO(MainCategory mainCategory) {
    return new MainCategoryResponseDTO(
        mainCategory.getId(),
        mainCategory.getCategory(),
        mainCategory.getIsActive()
    );
  }
}
