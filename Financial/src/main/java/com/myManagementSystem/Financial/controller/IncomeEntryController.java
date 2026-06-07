package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.IncomeEntryRequestDTO;
import com.myManagementSystem.Financial.dto.IncomeEntryResponseDTO;
import com.myManagementSystem.Financial.service.IncomeEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/income-entries")
public class IncomeEntryController {

  private final IncomeEntryService incomeEntryService;

  @PostMapping
  public ResponseEntity<IncomeEntryResponseDTO> createEntry(@Valid @RequestBody IncomeEntryRequestDTO dto) {
    return new ResponseEntity<>(incomeEntryService.createEntry(dto), HttpStatus.CREATED);
  }

  @GetMapping
  public ResponseEntity<List<IncomeEntryResponseDTO>> getAllEntries() {
    return ResponseEntity.ok(incomeEntryService.getAllEntries());
  }

  @GetMapping("/{incomeId}")
  public ResponseEntity<List<IncomeEntryResponseDTO>> getEntriesByIncome(@PathVariable Long incomeId) {
    return ResponseEntity.ok(incomeEntryService.getEntriesByIncomeId(incomeId));
  }

  @PutMapping("/{id}")
  public ResponseEntity<IncomeEntryResponseDTO> updateEntry(@PathVariable Long id, @Valid @RequestBody IncomeEntryRequestDTO dto) {
    return ResponseEntity.ok(incomeEntryService.updateEntryById(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
    incomeEntryService.deleteEntryById(id);
    return ResponseEntity.noContent().build();
  }


}
