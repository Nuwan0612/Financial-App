package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.TradeTransactionRequestDTO;
import com.myManagementSystem.Financial.dto.TradeTransactionResponseDTO;
import com.myManagementSystem.Financial.service.TradeTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/trades")
@RequiredArgsConstructor
public class TradeTransactionController {

  private final TradeTransactionService tradeService;

  @PostMapping
  public ResponseEntity<TradeTransactionResponseDTO> createTrade(@Valid @RequestBody TradeTransactionRequestDTO requestDTO) {
    log.info("REST request to execute a new trade");
    TradeTransactionResponseDTO response = tradeService.createTrade(requestDTO);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @GetMapping
  public ResponseEntity<List<TradeTransactionResponseDTO>> getAllTrades() {
    log.info("REST request to get all trades");
    return ResponseEntity.ok(tradeService.getAllTrades());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteTradeById(@PathVariable Long id, @RequestParam Long bucketId) {
    log.info("REST request to delete trade ID: {} for Bucket ID: {}", id, bucketId);
    tradeService.deleteTradeById(id, bucketId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/company/{companyId}")
  public ResponseEntity<List<TradeTransactionResponseDTO>> getTradesByCompany(@PathVariable Long companyId) {
    log.info("REST request to get trades for company: {}", companyId);
    return ResponseEntity.ok(tradeService.getTradesByCompanyId(companyId));
  }
}