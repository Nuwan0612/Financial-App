package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.LiabilityPaymentRequestDTO;
import com.myManagementSystem.Financial.dto.LiabilityRequestDTO;
import com.myManagementSystem.Financial.dto.LiabilityResponseDTO;
import com.myManagementSystem.Financial.service.LiabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/liabilities")
@RequiredArgsConstructor
public class LiabilityController {
  
  private final LiabilityService liabilityService;

  @PostMapping
  public ResponseEntity<LiabilityResponseDTO> createLiability(@Valid @RequestBody LiabilityRequestDTO liabilityRequestDTO) {
    return new ResponseEntity<>(liabilityService.createLiability(liabilityRequestDTO), HttpStatus.CREATED);
  }

  @GetMapping
  public ResponseEntity<List<LiabilityResponseDTO>> getAllLiabilities() {
    return ResponseEntity.ok(liabilityService.getAllLiabilities());
  }

  @PostMapping("/{liabilityId}/payments")
  public ResponseEntity<LiabilityResponseDTO> addPayment(@PathVariable Long liabilityId, @Valid @RequestBody LiabilityPaymentRequestDTO paymentDTO) {
    LiabilityResponseDTO updatedLiability = liabilityService.addPaymentToLiability(liabilityId, paymentDTO);
    return ResponseEntity.status(HttpStatus.CREATED).body(updatedLiability);
  }

  @DeleteMapping("/{liabilityId}/payments/{paymentId}")
  public ResponseEntity<LiabilityResponseDTO> deletePayment(@PathVariable Long liabilityId, @PathVariable Long paymentId) {
    LiabilityResponseDTO updatedLiability = liabilityService.deletePaymentFromLiability(liabilityId, paymentId);
    return ResponseEntity.ok(updatedLiability);
  }

  @GetMapping("/{id}")
  public ResponseEntity<LiabilityResponseDTO> getLiabilityById(@PathVariable Long id) {
    return ResponseEntity.ok(liabilityService.getLiabilityById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<LiabilityResponseDTO> updateLiability(@PathVariable Long id, @Valid @RequestBody LiabilityRequestDTO liabilityRequestDTO) {
    return ResponseEntity.ok(liabilityService.updateLiabilityById(id, liabilityRequestDTO));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteLiability(@PathVariable Long id) {
    liabilityService.deleteLiabilityById(id);
    return ResponseEntity.noContent().build();
  }
}
