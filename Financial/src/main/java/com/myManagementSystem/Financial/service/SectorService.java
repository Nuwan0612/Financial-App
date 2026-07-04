package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.SectorRequestDTO;
import com.myManagementSystem.Financial.dto.SectorResponseDTO;
import com.myManagementSystem.Financial.entity.Sector;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.SectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SectorService {

  private final SectorRepository sectorRepository;

  // CREATE
  public SectorResponseDTO createSector(SectorRequestDTO requestDTO) {
    log.info("Attempting to create new Sector: {}", requestDTO.name());

    // Note: You might want to add a check here to ensure a sector with this name doesn't already exist,
    // since your Entity specifies @Column(unique = true) for the name.

    Sector sector = Sector.builder()
        .name(requestDTO.name())
        .build();

    Sector savedSector = sectorRepository.save(sector);
    log.info("Successfully saved Sector with ID {}", savedSector.getId());

    return mapToDTO(savedSector);
  }

  // READ ALL
  public List<SectorResponseDTO> getAllSectors() {
    log.info("Attempting to get all Sectors from database");

    List<SectorResponseDTO> sectors = sectorRepository.findAll()
        .stream()
        .map(this::mapToDTO)
        .toList();

    log.debug("Successfully retrieved {} Sectors", sectors.size());
    return sectors;
  }

  // READ ONE
  public SectorResponseDTO getSectorById(Long id) {
    log.info("Attempting to get Sector by ID {}", id);

    Sector sector = sectorRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Sector with ID {} not found", id);
          return new ResourceNotFoundException("Sector with ID " + id + " not found");
        });

    return mapToDTO(sector);
  }

  // UPDATE
  public SectorResponseDTO updateSectorById(Long id, SectorRequestDTO requestDTO) {
    log.info("Attempting to update Sector by ID {}", id);

    Sector existingSector = sectorRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Update failed. Sector not found with ID: {}", id);
          return new ResourceNotFoundException("Sector with ID " + id + " not found");
        });

    log.debug("Updating Sector ID {}.", existingSector.getId());

    existingSector.setName(requestDTO.name());

    Sector updatedSector = sectorRepository.save(existingSector);
    log.info("Successfully updated Sector with ID: {}", id);

    return mapToDTO(updatedSector);
  }

  // DELETE
  public void deleteSectorById(Long id) {
    log.info("Attempting to delete Sector by ID {}", id);

    Sector sector = sectorRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Sector with ID " + id + " not found"));

    sectorRepository.delete(sector);
    log.info("Successfully deleted Sector with ID: {}", id);
  }

  // Helper Method
  private SectorResponseDTO mapToDTO(Sector sector) {
    return new SectorResponseDTO(
        sector.getId(),
        sector.getName()
    );
  }
}