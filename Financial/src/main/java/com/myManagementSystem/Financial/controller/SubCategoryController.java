package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.SubCategoryRequestDTO;
import com.myManagementSystem.Financial.dto.SubCategoryResponseDTO;
import com.myManagementSystem.Financial.dto.SubCategoryUpdateRequestDTO;
import com.myManagementSystem.Financial.service.SubCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/subCategories")
public class SubCategoryController {

  private final SubCategoryService subCategoryService;

  @PostMapping
  public ResponseEntity<SubCategoryResponseDTO> createSubCategory(@Valid @RequestBody SubCategoryRequestDTO subCategoryRequestDTO) {
    return new ResponseEntity<>(subCategoryService.createSubCategory(subCategoryRequestDTO), HttpStatus.CREATED);
  }

  @PostMapping("/bulk")
  public ResponseEntity<List<SubCategoryResponseDTO>> createSubCategories(
      @Valid @RequestBody List<SubCategoryRequestDTO> dtos) {

    return new ResponseEntity<>(subCategoryService.createSubCategories(dtos), HttpStatus.CREATED);
  }

  // BULK UPDATE
  @PutMapping("/bulk")
  public ResponseEntity<List<SubCategoryResponseDTO>> updateSubCategories(
      @Valid @RequestBody List<SubCategoryUpdateRequestDTO> dtos) {

    return ResponseEntity.ok(subCategoryService.updateSubCategories(dtos));
  }

  // BULK DELETE
  @DeleteMapping("/bulk")
  public ResponseEntity<Void> deleteSubCategories(@RequestBody List<Long> ids) {

    subCategoryService.deleteSubCategories(ids);
    return ResponseEntity.noContent().build();
  }

  @GetMapping
  public ResponseEntity<List<SubCategoryResponseDTO>> getAllSubCategories() {
    return ResponseEntity.ok(subCategoryService.getAllSubCategories());
  }

  @GetMapping("/{id}")
  public ResponseEntity<SubCategoryResponseDTO> getSubCategoryById(@PathVariable Long id) {
    return ResponseEntity.ok(subCategoryService.getSubCategoryById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<SubCategoryResponseDTO> updateSubCategory(@PathVariable Long id, @Valid @RequestBody SubCategoryRequestDTO subCategoryRequestDTO) {
    return ResponseEntity.ok(subCategoryService.updateSubCategory(id, subCategoryRequestDTO));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteSubCategory(@PathVariable Long id) {
    subCategoryService.deleteSubCategory(id);
    return ResponseEntity.noContent().build();
  }
}
