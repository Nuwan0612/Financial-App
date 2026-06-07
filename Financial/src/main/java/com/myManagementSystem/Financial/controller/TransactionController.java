package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.*;
import com.myManagementSystem.Financial.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/transactions")
public class TransactionController {

  private final TransactionService transactionService;

  // From calculator — bulk pending transactions
  @PostMapping("/bulk")
  public ResponseEntity<List<TransactionResponseDTO>> createBulk(@RequestBody List<TransactionRequestDTO> dtos) {
    return ResponseEntity.ok(transactionService.createTransactions(dtos));
  }

  // Mark one as success
  @PutMapping("/{id}/success")
  public ResponseEntity<String> markAsSuccess(@PathVariable Long id) {
    transactionService.markAsSuccess(id);
    return ResponseEntity.ok("Transaction successfully processed.");
  }

  @PostMapping("/bulk-transfer")
  public ResponseEntity<List<TransactionResponseDTO>> bulkTransfer(
      @RequestBody List<TransactionRequestDTO> dtos) {
    return ResponseEntity.ok(transactionService.bulkTransfer(dtos));
  }

  // Instant transfer — used when deleting sub category
  @PostMapping("/transfer")
  public ResponseEntity<TransactionResponseDTO> transfer(@RequestBody TransactionRequestDTO dto) {
    return ResponseEntity.ok(transactionService.transfer(dto));
  }

  // Get all
  @GetMapping
  public ResponseEntity<List<TransactionResponseDTO>> getAll() {
    return ResponseEntity.ok(transactionService.getAll());
  }
}
