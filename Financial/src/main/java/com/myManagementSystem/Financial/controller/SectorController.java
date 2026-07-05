package com.myManagementSystem.Financial.controller;

import com.myManagementSystem.Financial.dto.SectorRequestDTO;
import com.myManagementSystem.Financial.dto.SectorResponseDTO;
import com.myManagementSystem.Financial.service.SectorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/sectors")
@RequiredArgsConstructor
public class SectorController {

  private final SectorService sectorService;

  @PostMapping
  public ResponseEntity<SectorResponseDTO> createSector(@Valid @RequestBody SectorRequestDTO requestDTO) {
    log.info("REST request to create Sector");
    SectorResponseDTO response = sectorService.createSector(requestDTO);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @GetMapping
  public ResponseEntity<List<SectorResponseDTO>> getAllSectors() {
    log.info("REST request to get all Sectors");
    return ResponseEntity.ok(sectorService.getAllSectors());
  }

  @GetMapping("/{id}")
  public ResponseEntity<SectorResponseDTO> getSectorById(@PathVariable Long id) {
    log.info("REST request to get Sector : {}", id);
    return ResponseEntity.ok(sectorService.getSectorById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<SectorResponseDTO> updateSector(
      @PathVariable Long id,
      @Valid @RequestBody SectorRequestDTO requestDTO) {
    log.info("REST request to update Sector : {}", id);
    return ResponseEntity.ok(sectorService.updateSectorById(id, requestDTO));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteSector(@PathVariable Long id) {
    log.info("REST request to delete Sector : {}", id);
    sectorService.deleteSectorById(id);
    return ResponseEntity.noContent().build();
  }
}