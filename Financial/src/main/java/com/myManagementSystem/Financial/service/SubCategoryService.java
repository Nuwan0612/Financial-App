package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.conflicts.ConflictBucketDTO;
import com.myManagementSystem.Financial.dto.conflicts.ConflictResolutionPayloadDTO;
import com.myManagementSystem.Financial.dto.SubCategoryRequestDTO;
import com.myManagementSystem.Financial.dto.SubCategoryResponseDTO;
import com.myManagementSystem.Financial.dto.SubCategoryUpdateRequestDTO;
import com.myManagementSystem.Financial.dto.conflicts.DestinationAccountDTO;
import com.myManagementSystem.Financial.dto.conflicts.DestinationBucketDTO;
import com.myManagementSystem.Financial.entity.Account;
import com.myManagementSystem.Financial.entity.MainCategory;
import com.myManagementSystem.Financial.entity.SubCategory;
import com.myManagementSystem.Financial.exception.CategoryNotEmptyException;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AccountRepository;
import com.myManagementSystem.Financial.repository.MainCategoryRepository;
import com.myManagementSystem.Financial.repository.SubCategoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubCategoryService {

  private final SubCategoryRepository subCategoryRepository;
  private final MainCategoryRepository mainCategoryRepository;
  private final AccountRepository accountRepository;
  private final BucketService bucketService;

  // CREATE
  @Transactional
  public SubCategoryResponseDTO createSubCategory(SubCategoryRequestDTO subCategoryRequestDTO) {
    log.info("Attempting to create new SubCategory {}", subCategoryRequestDTO.name());

    MainCategory mainCategory = mainCategoryRepository.findById(subCategoryRequestDTO.mainCategoryId())
        .orElseThrow(() -> new ResourceNotFoundException("Main Category not found with ID: " + subCategoryRequestDTO.mainCategoryId()));

    Account account = accountRepository.findById(subCategoryRequestDTO.accountId())
        .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + subCategoryRequestDTO.accountId()));

    SubCategory subCategory = SubCategory.builder()
        .name(subCategoryRequestDTO.name())
        .percentage(subCategoryRequestDTO.percentage())
        .mainCategory(mainCategory)
        .account(account)
        .build();

    SubCategory savedSubCategory = subCategoryRepository.save(subCategory);
    log.info("Successfully saved SubCategory with ID {}", savedSubCategory.getId());

    bucketService.createBucketForSubCategory(savedSubCategory, account);

    // 5. Return the flattened DTO to React
    return mapToDTO(savedSubCategory);
  }

  // BULK CREATE
  @Transactional
  public List<SubCategoryResponseDTO> createSubCategories(List<SubCategoryRequestDTO> dtos) {
    log.info("Attempting to bulk create {} SubCategories", dtos.size());

    // Loop through the list, call your single creation method for each one,
    // and collect the results into a new List to send back to React.
    return dtos.stream()
        .map(this::createSubCategory) // Re-uses your exact single-save logic!
        .toList();
  }

  // GET ALL
  public List<SubCategoryResponseDTO> getAllSubCategories() {
    log.info("Fetching all SubCategories");
    return subCategoryRepository.findByIsActiveTrue()
        .stream()
        .map(this::mapToDTO) // Reusing your helper method!
        .toList();
  }

  // GET ONE
  public SubCategoryResponseDTO getSubCategoryById(Long id) {
    log.info("Fetching SubCategory with ID {}", id);
    SubCategory subCategory = subCategoryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("SubCategory not found with ID: " + id));

    return mapToDTO(subCategory);
  }

  // UPDATE
  @Transactional
  public SubCategoryResponseDTO updateSubCategory(Long id, SubCategoryRequestDTO dto) {
    log.info("Attempting to update SubCategory with ID {}", id);

    SubCategory existingSubCategory = subCategoryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("SubCategory not found with ID: " + id));

    existingSubCategory.setName(dto.name());
    existingSubCategory.setPercentage(dto.percentage());

    // 3. Did they change the Main Category?
    if (!existingSubCategory.getMainCategory().getId().equals(dto.mainCategoryId())) {
      MainCategory newMainCategory = mainCategoryRepository.findById(dto.mainCategoryId())
          .orElseThrow(() -> new ResourceNotFoundException("New Main Category not found"));
      existingSubCategory.setMainCategory(newMainCategory);
    }

    // 4. Did they change the Account?
    if (!existingSubCategory.getAccount().getId().equals(dto.accountId())) {
      Account newAccount = accountRepository.findById(dto.accountId())
          .orElseThrow(() -> new ResourceNotFoundException("New Account not found"));
      existingSubCategory.setAccount(newAccount);
    }

    // 5. Save and return
    SubCategory updatedSubCategory = subCategoryRepository.save(existingSubCategory);
    log.info("Successfully updated SubCategory with ID {}", id);

    return mapToDTO(updatedSubCategory);
  }

  // BULK UPDATE
  @Transactional
  public List<SubCategoryResponseDTO> updateSubCategories(List<SubCategoryUpdateRequestDTO> dtos) {
    log.info("Attempting to bulk update {} SubCategories", dtos.size());

    return dtos.stream().map(dto -> {
      // We temporarily map the Update DTO back to your standard Request DTO
      // so we can reuse your exact single-update logic!
      SubCategoryRequestDTO requestData = new SubCategoryRequestDTO(
          dto.name(), dto.percentage(), dto.mainCategoryId(), dto.accountId()
      );
      return updateSubCategory(dto.id(), requestData);
    }).toList();
  }

  // BULK DELETE
  @Transactional
  public void deleteSubCategories(List<Long> ids) {
    log.info("Attempting to bulk delete {} SubCategories", ids.size());

    // Loop through the list of IDs and call your single delete method for each one
    ids.forEach(this::deleteSubCategory);
  }

  @Transactional
  public void deleteSubCategory(Long id) {
    log.info("Attempting to delete SubCategory with ID {}", id);

    SubCategory subCategory = subCategoryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("SubCategory not found"));

    // 1. Find the conflicting buckets
    List<ConflictBucketDTO> fundedBuckets = subCategory.getBuckets().stream()
        .filter(bucket -> bucket.getCurrentAmount().compareTo(BigDecimal.ZERO) > 0)
        .map(bucket -> new ConflictBucketDTO(bucket.getId(), bucket.getName(), bucket.getCurrentAmount()))
        .toList();

    // 2. If we have conflicts, build the resolution payload
    if (!fundedBuckets.isEmpty()) {

      // Fetch all accounts so the user has destinations to pick from
      List<DestinationAccountDTO> availableDestinations = accountRepository.findAll().stream()
          .map(account -> new DestinationAccountDTO(
              account.getId(),
              account.getName(),
              account.getBuckets().stream()
                  .filter(b -> !b.getSubCategory().getId().equals(id))
                  .map(b -> new DestinationBucketDTO(b.getId(), b.getName(), b.getSubCategory().getName()))
                  .toList()
          )).toList();

      // Build the master payload with the Account Info included!
      ConflictResolutionPayloadDTO payload = new ConflictResolutionPayloadDTO(
          subCategory.getAccount().getId(),         // <-- ADDED: Source Account ID
          subCategory.getAccount().getName(),       // <-- ADDED: Source Account Name
          subCategory.getMainCategory().getId(),
          subCategory.getMainCategory().getCategory(),
          subCategory.getId(),
          subCategory.getName(),
          fundedBuckets,
          availableDestinations
      );

      log.warn("Deletion blocked for SubCategory {}. Sending resolution payload.", subCategory.getName());
      throw new CategoryNotEmptyException("Cannot delete. Please empty these buckets first.", payload);
    }

    // 3. Safe to delete
    subCategoryRepository.delete(subCategory);
    log.info("Successfully deleted SubCategory with ID {}", id);
  }


  private SubCategoryResponseDTO mapToDTO(SubCategory entity) {
    return new SubCategoryResponseDTO(
        entity.getId(),
        entity.getName(),
        entity.getPercentage(),
        entity.getMainCategory().getId(),
        entity.getMainCategory().getCategory(),
        entity.getAccount().getId(),
        entity.getAccount().getName(),
        entity.getIsActive()
    );
  }
}
