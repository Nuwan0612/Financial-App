package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.MainCategoryRequestDTO;
import com.myManagementSystem.Financial.dto.MainCategoryResponseDTO;
import com.myManagementSystem.Financial.service.MainCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mainCategories")
public class MainCategoryController {

  private final MainCategoryService MainCategoryService;

  @PostMapping
  public ResponseEntity<MainCategoryResponseDTO> createMainCategory(@Valid @RequestBody MainCategoryRequestDTO mainCategoryRequestDTO) {
    return new ResponseEntity<>(MainCategoryService.createMainCategory(mainCategoryRequestDTO), HttpStatus.CREATED);
  }

  @GetMapping
  public ResponseEntity<List<MainCategoryResponseDTO>> getAllMainCategories() {
    return ResponseEntity.ok(MainCategoryService.getAllMainCategories());
  }

  @GetMapping("/{id}")
  public ResponseEntity<MainCategoryResponseDTO> getMainCategoryById(@PathVariable Long id) {
    return ResponseEntity.ok(MainCategoryService.getMainCategoryById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<MainCategoryResponseDTO> updateMainCategory(@PathVariable Long id, @Valid @RequestBody MainCategoryRequestDTO mainCategoryRequestDTO) {
    return ResponseEntity.ok(MainCategoryService.updateMainCategoryById(id, mainCategoryRequestDTO));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteMainCategory(@PathVariable Long id) {
    MainCategoryService.deleteMainCategoryById(id);
    return ResponseEntity.noContent().build();
  }
}
