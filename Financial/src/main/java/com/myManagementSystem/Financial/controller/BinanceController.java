package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.*;
import com.myManagementSystem.Financial.service.FuturesTradingService;
import com.myManagementSystem.Financial.service.SpotTradingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/binance")
@RequiredArgsConstructor
public class BinanceController {

    private final SpotTradingService spotTradingService;
    private final FuturesTradingService futuresTradingService;

    @GetMapping("/spot/assets/{accountId}")
    public ResponseEntity<List<SpotTransactionResponseDTO>> getSpotAssets(@PathVariable Long accountId) {
        return ResponseEntity.ok(spotTradingService.getSpotAssetsByAccount(accountId));
    }

    // --- SPOT ENDPOINTS ---
    @PostMapping("/spot/trade")
    public ResponseEntity<SpotTransactionResponseDTO> executeSpotTrade(@Valid @RequestBody SpotTransactionRequestDTO request) {
        SpotTransactionResponseDTO response = spotTradingService.executeSpotTrade(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/account/transfer")
    public ResponseEntity<BinanceFundTransferResponseDTO> transferAmount(@Valid @RequestBody BinanceFundTransferRequestDTO request) {
        BinanceFundTransferResponseDTO response = spotTradingService.transferFundWithinAccounts(request);
        return ResponseEntity.ok(response);
    }

    // --- FUTURES ENDPOINTS ---
    @PostMapping("/futures/journal")
    public ResponseEntity<FuturesJournalResponseDTO> futuresJournal(@Valid @RequestBody FuturesJournalRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(futuresTradingService.futuresJournal(request));
    }

    @GetMapping("/futures/journal/{accountId}")
    public ResponseEntity<List<FuturesJournalResponseDTO>> getFuturesJournal(@PathVariable Long accountId) {
        return ResponseEntity.ok(futuresTradingService.getFuturesJournal(accountId));
    }
}