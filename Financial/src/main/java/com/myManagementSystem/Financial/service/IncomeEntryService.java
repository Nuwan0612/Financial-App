package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.IncomeEntryRequestDTO;
import com.myManagementSystem.Financial.dto.IncomeEntryResponseDTO;
import com.myManagementSystem.Financial.entity.Income;
import com.myManagementSystem.Financial.entity.IncomeEntry;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.IncomeEntryRepository;
import com.myManagementSystem.Financial.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncomeEntryService {

  private final IncomeEntryRepository incomeEntryRepository;
  private final IncomeRepository incomeRepository;

  public IncomeEntryResponseDTO createEntry(IncomeEntryRequestDTO dto) {
    log.info("Creating income entry for incomeId {}", dto.incomeId());

    Income income = incomeRepository.findById(dto.incomeId())
        .orElseThrow(() -> new ResourceNotFoundException("Income source not found with ID: " + dto.incomeId()));

    IncomeEntry entry = IncomeEntry.builder()
        .income(income)
        .date(dto.date())
        .amount(dto.amount())
        .note(dto.note())
        .build();

    IncomeEntry saved = incomeEntryRepository.save(entry);
    log.info("Saved income entry with ID {}", saved.getId());
    return mapToDTO(saved);
  }

  public List<IncomeEntryResponseDTO> getEntriesByIncomeId(Long incomeId) {
    return incomeEntryRepository.findByIncomeId(incomeId)
        .stream()
        .map(this::mapToDTO)
        .toList();
  }

  public List<IncomeEntryResponseDTO> getAllEntries() {
    return incomeEntryRepository.findAll()
        .stream()
        .map(this::mapToDTO)
        .toList();
  }

  // UPDATE
  public IncomeEntryResponseDTO updateEntryById(Long id, IncomeEntryRequestDTO dto) {
    log.info("Attempting to update IncomeEntry with ID {}", id);

    IncomeEntry existingEntry = incomeEntryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Income entry not found with ID: " + id));

    if (!existingEntry.getIncome().getId().equals(dto.incomeId())) {
      log.info("Income source changed from {} to {}. Fetching new source.",
          existingEntry.getIncome().getId(), dto.incomeId());

      Income newIncomeSource = incomeRepository.findById(dto.incomeId())
          .orElseThrow(() -> new ResourceNotFoundException("New Income source not found with ID: " + dto.incomeId()));

      existingEntry.setIncome(newIncomeSource);
    }

    existingEntry.setDate(dto.date());
    existingEntry.setAmount(dto.amount());
    existingEntry.setNote(dto.note());

    IncomeEntry updatedEntry = incomeEntryRepository.save(existingEntry);
    log.info("Successfully updated IncomeEntry with ID {}", updatedEntry.getId());

    return mapToDTO(updatedEntry);
  }

  // DELETE
  public void deleteEntryById(Long id) {
    log.info("Attempting to delete IncomeEntry with ID {}", id);
    if (!incomeEntryRepository.existsById(id)) {
      throw new ResourceNotFoundException("Income entry not found with ID: " + id);
    }
    incomeEntryRepository.deleteById(id);
    log.info("Successfully deleted IncomeEntry with ID {}", id);
  }

  private IncomeEntryResponseDTO mapToDTO(IncomeEntry entry) {
    return new IncomeEntryResponseDTO(
        entry.getId(),
        entry.getAmount(),
        entry.getDate(),
        entry.getNote()
    );
  }
}
