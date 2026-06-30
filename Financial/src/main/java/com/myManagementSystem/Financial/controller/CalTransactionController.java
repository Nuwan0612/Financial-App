package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.CalTransactionRequestDTO;
import com.myManagementSystem.Financial.dto.CalTransactionResponseDTO;
import com.myManagementSystem.Financial.service.CalTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/cal-transactions")
@RequiredArgsConstructor
public class CalTransactionController {

    private final CalTransactionService transactionService;

    @PostMapping
    public ResponseEntity<CalTransactionResponseDTO> createTransaction(@Valid @RequestBody CalTransactionRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.createTransaction(requestDTO));
    }

    @GetMapping("/fund/{fundId}")
    public ResponseEntity<List<CalTransactionResponseDTO>> getTransactionsByFund(@PathVariable Long fundId) {
        return ResponseEntity.ok(transactionService.getTransactionsByFundId(fundId));
    }
}