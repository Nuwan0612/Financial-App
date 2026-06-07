package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.IncomeRequestDTO;
import com.myManagementSystem.Financial.dto.IncomeResponseDTO;
import com.myManagementSystem.Financial.service.IncomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/incomes")
public class IncomeController {
  
  private final IncomeService incomeService;

  @PostMapping
  public ResponseEntity<IncomeResponseDTO> createIncome(@Valid @RequestBody IncomeRequestDTO incomeRequestDTO) {
    return new ResponseEntity<>(incomeService.createIncome(incomeRequestDTO), HttpStatus.CREATED);
  }

  @GetMapping
  public ResponseEntity<List<IncomeResponseDTO>> getAllIncomes() {
    return ResponseEntity.ok(incomeService.getAllIncomes());
  }

  @GetMapping("/{id}")
  public ResponseEntity<IncomeResponseDTO> getIncomeById(@PathVariable Long id) {
    return ResponseEntity.ok(incomeService.getIncomeById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<IncomeResponseDTO> updateIncome(@PathVariable Long id, @Valid @RequestBody IncomeRequestDTO incomeRequestDTO) {
    return ResponseEntity.ok(incomeService.updateIncomeById(id, incomeRequestDTO));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
    incomeService.deleteIncomeById(id);
    return ResponseEntity.noContent().build(); // Returns 204 No Content
  }
}
