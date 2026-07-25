package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.InvestmentCompanyRequestDTO;
import com.myManagementSystem.Financial.dto.InvestmentCompanyResponseDTO;
import com.myManagementSystem.Financial.service.InvestmentCompanyService;
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
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class InvestmentCompanyController {

  private final InvestmentCompanyService companyService;

  @PostMapping
  public ResponseEntity<InvestmentCompanyResponseDTO> createCompany(@Valid @RequestBody InvestmentCompanyRequestDTO requestDTO) {
    log.info("REST request to create Investment Company");
    InvestmentCompanyResponseDTO response = companyService.createCompany(requestDTO);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @GetMapping
  public ResponseEntity<List<InvestmentCompanyResponseDTO>> getAllCompanies() {
    log.info("REST request to get all Investment Companies");
    return ResponseEntity.ok(companyService.getAllCompanies());
  }

  @GetMapping("/{id}")
  public ResponseEntity<InvestmentCompanyResponseDTO> getCompanyById(@PathVariable Long id) {
    log.info("REST request to get Investment Company : {}", id);
    return ResponseEntity.ok(companyService.getCompanyById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<InvestmentCompanyResponseDTO> updateCompany(
      @PathVariable Long id,
      @Valid @RequestBody InvestmentCompanyRequestDTO requestDTO) {

    log.info("REST request to fully update Investment Company : {}", id);

    return ResponseEntity.ok(companyService.updateCompany(id, requestDTO));
  }

  // Using PATCH because we are only partially updating the entity (just the price)
  @PatchMapping("/{id}/price")
  public ResponseEntity<InvestmentCompanyResponseDTO> updateCompanyPrice(
      @PathVariable Long id,
      @RequestBody Map<String, BigDecimal> payload) {

    log.info("REST request to update price for Investment Company : {}", id);

    BigDecimal newPrice = payload.get("newPrice");
    BigDecimal accountIdDecimal = payload.get("accountId");

    // 1. Add null check for both fields
    if (newPrice == null || accountIdDecimal == null) {
      throw new IllegalArgumentException("Payload must contain both 'newPrice' and 'accountId' fields");
    }

    // 2. Convert the BigDecimal to a Long for the service method
    Long accountId = accountIdDecimal.longValue();

    return ResponseEntity.ok(companyService.updateCompanyPrice(id, newPrice, accountId));
  }
}