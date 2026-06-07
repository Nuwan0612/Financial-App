package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.DailyLogRequestDTO;
import com.myManagementSystem.Financial.dto.DailyLogResponseDTO;
import com.myManagementSystem.Financial.dto.DailyLogUpdateRequestDTO;
import com.myManagementSystem.Financial.service.DailyLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/daily-logs")
public class DailyLogController {

  private final DailyLogService dailyLogService;

  @PostMapping
  public ResponseEntity<DailyLogResponseDTO> createDailyLog(@Valid @RequestBody DailyLogRequestDTO dto) {
    return new ResponseEntity<>(dailyLogService.createDailyLog(dto), HttpStatus.CREATED);
  }

  @PostMapping("/bulk")
  public ResponseEntity<List<DailyLogResponseDTO>> createDailyLogs(@Valid @RequestBody List<DailyLogRequestDTO> dtos) {
    return new ResponseEntity<>(dailyLogService.createDailyLogs(dtos), HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  public ResponseEntity<DailyLogResponseDTO> updateDailyLog(@PathVariable Long id, @Valid @RequestBody DailyLogRequestDTO dto) {
    return ResponseEntity.ok(dailyLogService.updateDailyLog(id, dto));
  }

  @PutMapping("/bulk")
  public ResponseEntity<List<DailyLogResponseDTO>> updateDailyLogs(@Valid @RequestBody List<DailyLogUpdateRequestDTO> dtos) {
    return ResponseEntity.ok(dailyLogService.updateDailyLogs(dtos));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteDailyLog(@PathVariable Long id) {
    dailyLogService.deleteDailyLog(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping
  public ResponseEntity<List<DailyLogResponseDTO>> getAllDailyLogs() {
    return ResponseEntity.ok(dailyLogService.getLogs());
  }
}
