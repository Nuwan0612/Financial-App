package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.*;
import com.myManagementSystem.Financial.service.FuturesTradingService;
import com.myManagementSystem.Financial.service.SpotTradingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/binance")
@RequiredArgsConstructor
public class BinanceController {

    private final SpotTradingService spotTradingService;
    private final FuturesTradingService futuresTradingService;

    // --- SPOT ENDPOINTS ---
    @PostMapping("/spot/trade")
    public ResponseEntity<SpotTransactionResponseDTO> executeSpotTrade(@Valid @RequestBody SpotTransactionRequestDTO request) {
        SpotTransactionResponseDTO response = spotTradingService.executeSpotTrade(request);
        return ResponseEntity.ok(response);
    }

    // --- FUTURES ENDPOINTS ---
    @PostMapping("/futures/open")
    public ResponseEntity<FuturesPositionResponseDTO> openFuturesPosition(@Valid @RequestBody FuturesOpenRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(futuresTradingService.openPosition(request));
    }

    @PostMapping("/futures/{id}/close")
    public ResponseEntity<FuturesPositionResponseDTO> closeFuturesPosition(
            @PathVariable Long id,
            @Valid @RequestBody FuturesCloseRequestDTO request) {
        return ResponseEntity.ok(futuresTradingService.closePosition(id, request));
    }
}