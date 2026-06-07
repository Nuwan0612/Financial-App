package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.ExpenseRequestDTO;
import com.myManagementSystem.Financial.dto.ExpenseResponseDTO;
import com.myManagementSystem.Financial.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/expenses")
public class ExpenseController {

  private final ExpenseService expenseService;

  @PostMapping
  public ResponseEntity<ExpenseResponseDTO> createExpense(@Valid @RequestBody ExpenseRequestDTO expenseRequestDTO) {
    return new ResponseEntity<>(expenseService.createExpense(expenseRequestDTO), HttpStatus.CREATED);
  }

  @GetMapping
  public ResponseEntity<List<ExpenseResponseDTO>> getAllExpenses() {
    return ResponseEntity.ok(expenseService.getAllExpenses());
  }

  @GetMapping("/{id}")
  public ResponseEntity<ExpenseResponseDTO> getExpenseById(@PathVariable Long id) {
    return ResponseEntity.ok(expenseService.getExpenseById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ExpenseResponseDTO> updateExpense(@PathVariable Long id, @Valid @RequestBody ExpenseRequestDTO expenseRequestDTO) {
    return ResponseEntity.ok(expenseService.updateExpenseById(id, expenseRequestDTO));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
    expenseService.deleteExpenseById(id);
    return ResponseEntity.noContent().build(); // Returns 204 No Content
  }

}
