package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.BucketResponseDTO;
import com.myManagementSystem.Financial.service.BucketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/buckets")
public class BucketController {

  private final BucketService bucketService;

  @GetMapping("/account/{accountId}")
  public ResponseEntity<List<BucketResponseDTO>> getBucketByAccountId(@PathVariable Long accountId) {
    return ResponseEntity.ok(bucketService.getBuketsByAccount(accountId));
  }

  @GetMapping
  public ResponseEntity<List<BucketResponseDTO>> getAllActiveBuckets() {
    List<BucketResponseDTO> buckets = bucketService.getAllActiveBuckets();
    return ResponseEntity.ok(buckets);
  }
}
