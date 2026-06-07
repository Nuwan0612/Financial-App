package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.AssetRequestDTO;
import com.myManagementSystem.Financial.dto.AssetResponseDTO;
import com.myManagementSystem.Financial.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/assets")
public class AssetController {
  
  private final AssetService assetService;

  @PostMapping
  public ResponseEntity<AssetResponseDTO> createAsset(@Valid @RequestBody AssetRequestDTO assetRequestDTO) {
    return new ResponseEntity<>(assetService.createAsset(assetRequestDTO), HttpStatus.CREATED);
  }

  @GetMapping
  public ResponseEntity<List<AssetResponseDTO>> getAllAssets() {
    return ResponseEntity.ok(assetService.getAllAssets());
  }

  @GetMapping("/{id}")
  public ResponseEntity<AssetResponseDTO> getAssetById(@PathVariable Long id) {
    return ResponseEntity.ok(assetService.getAssetById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<AssetResponseDTO> updateAsset(@PathVariable Long id, @Valid @RequestBody AssetRequestDTO assetRequestDTO) {
    return ResponseEntity.ok(assetService.updateAssetById(id, assetRequestDTO));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
    assetService.deleteAssetById(id);
    return ResponseEntity.noContent().build();
  }
}
