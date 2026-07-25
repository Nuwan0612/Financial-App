package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.CompanyMetricRequestDTO;
import com.myManagementSystem.Financial.dto.CompanyMetricResponseDTO;
import com.myManagementSystem.Financial.service.CompanyMetricService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/metrics")
@RequiredArgsConstructor
public class CompanyMetricController {

  private final CompanyMetricService metricService;

  @GetMapping("/company/{companyId}")
  public ResponseEntity<CompanyMetricResponseDTO> getMetricByCompany(@PathVariable Long companyId) {
    return ResponseEntity.ok(metricService.getMetricByCompanyId(companyId));
  }

  @PutMapping("/company/{companyId}")
  public ResponseEntity<CompanyMetricResponseDTO> saveOrUpdateMetric(
      @PathVariable Long companyId,
      @Valid @RequestBody CompanyMetricRequestDTO requestDTO) {
    return ResponseEntity.ok(metricService.saveOrUpdateMetric(companyId, requestDTO));
  }
}
