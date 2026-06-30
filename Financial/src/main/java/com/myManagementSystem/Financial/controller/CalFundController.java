package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.CalFundRequestDTO;
import com.myManagementSystem.Financial.dto.CalFundResponseDTO;
import com.myManagementSystem.Financial.service.CalFundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/cal-funds")
@RequiredArgsConstructor
public class CalFundController {

    private final CalFundService calFundService;

    @PostMapping
    public ResponseEntity<CalFundResponseDTO> createFund(@Valid @RequestBody CalFundRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(calFundService.createFund(requestDTO));
    }

    @GetMapping
    public ResponseEntity<List<CalFundResponseDTO>> getActiveFunds() {
        return ResponseEntity.ok(calFundService.getActiveFunds());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalFundResponseDTO> getFundById(@PathVariable Long id) {
        return ResponseEntity.ok(calFundService.getFundById(id));
    }

    @PatchMapping("/{id}/value")
    public ResponseEntity<CalFundResponseDTO> updateFundEarnings(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> payload) {

        BigDecimal newValue = payload.get("newValue");
        if (newValue == null) {
            throw new IllegalArgumentException("Payload must contain 'newValue'");
        }

        return ResponseEntity.ok(calFundService.updateFundEarnings(id, newValue));
    }
}