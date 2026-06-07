package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.AssetRequestDTO;
import com.myManagementSystem.Financial.dto.AssetResponseDTO;
import com.myManagementSystem.Financial.entity.Asset;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssetService {
  
  private final AssetRepository assetRepository;

  // CREATE
  public AssetResponseDTO createAsset(AssetRequestDTO assetRequestDTO) {
    log.info("Attempting to create new Asset {}", assetRequestDTO.name());

    Asset asset = Asset.builder()
        .name(assetRequestDTO.name())
        .purchasePrice(assetRequestDTO.purchasePrice())
        .currentMarketValue(assetRequestDTO.currentMarketValue())
        .accrueDate(assetRequestDTO.accrueDate())
        .build();

    Asset savedAsset = assetRepository.save(asset);
    log.info("Successfully saved Asset with ID {}", savedAsset.getId());
    return mapToDTO(savedAsset);
  }

  // READ ALL
  public List<AssetResponseDTO> getAllAssets() {
    log.info("Attempting to get all Assets from database");

    List<AssetResponseDTO> assets = assetRepository.findAll()
        .stream()
        .map(this::mapToDTO)
        .toList();

    log.debug("Successfully retrieved {} Assets", assets.size());
    return assets;
  }

  // READ ONE
  public AssetResponseDTO getAssetById(Long id) {
    log.info("Attempting to get Asset by ID {}", id);
    Asset asset = assetRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Asset with ID {} not found", id);
          return new ResourceNotFoundException("Asset with ID " + id + " not found");
        });
    return mapToDTO(asset);
  }

  // UPDATE
  public AssetResponseDTO updateAssetById(Long id,  AssetRequestDTO assetRequestDTO) {
    log.info("Attempting to update Asset by ID {}", id);
    Asset existingAsset = assetRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Update failed. Asset not found with ID: {}", id);
          return new ResourceNotFoundException("Asset with ID " + id + " not found");
        });

    log.debug("Updating Asset '{}'. Changing amount from {} to {}",
        existingAsset.getName(), existingAsset.getCurrentMarketValue(), assetRequestDTO.currentMarketValue());

    existingAsset.setName(assetRequestDTO.name());
    existingAsset.setPurchasePrice(assetRequestDTO.purchasePrice());
    existingAsset.setCurrentMarketValue(assetRequestDTO.currentMarketValue());
    existingAsset.setAccrueDate(assetRequestDTO.accrueDate());

    Asset updatedAsset = assetRepository.save(existingAsset);
    log.info("Successfully updated Asset with ID: {}", id);

    return mapToDTO(updatedAsset);
  }

  // DELETE
  public void deleteAssetById(Long id) {
    log.info("Attempting to delete Asset by ID {}", id);
    if (!assetRepository.existsById(id)) {
      log.warn("Deletion failed. Asset with ID {} not found", id);
      throw new ResourceNotFoundException("Asset with ID " + id + " not found");
    }

    assetRepository.deleteById(id);
    log.info("Successfully deleted Asset with ID: {}", id);
  }

  // Helper Method
  private AssetResponseDTO mapToDTO(Asset asset) {
    return new AssetResponseDTO(
        asset.getId(),
        asset.getName(),
        asset.getPurchasePrice(),
        asset.getCurrentMarketValue(),
        asset.getAccrueDate()
    );
  }
}
