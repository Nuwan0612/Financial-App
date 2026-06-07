package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.IncomeEntryResponseDTO;
import com.myManagementSystem.Financial.dto.IncomeRequestDTO;
import com.myManagementSystem.Financial.dto.IncomeResponseDTO;
import com.myManagementSystem.Financial.entity.Income;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncomeService {
  
  private final IncomeRepository incomeRepository;

  // CREATE
  public IncomeResponseDTO createIncome(IncomeRequestDTO incomeRequestDTO) {
    log.info("Attempting to create new Income {}", incomeRequestDTO.name());

    Income income = Income.builder()
        .name(incomeRequestDTO.name())
        .expectedAmount(incomeRequestDTO.expectedAmount())
        .currency(incomeRequestDTO.currency())
        .build();

    Income savedIncome = incomeRepository.save(income);
    log.info("Successfully saved Income with ID {}", savedIncome.getId());
    return mapToDTO(savedIncome);
  }

  // READ ALL
  public List<IncomeResponseDTO> getAllIncomes() {
    log.info("Attempting to get all Incomes from database");

    List<IncomeResponseDTO> incomes = incomeRepository.findAll()
        .stream()
        .map(this::mapToDTO)
        .toList();

    log.debug("Successfully retrieved {} Incomes", incomes.size());
    return incomes;
  }

  // READ ONE
  public IncomeResponseDTO getIncomeById(Long id) {
    log.info("Attempting to get Income by ID {}", id);
    Income Income = incomeRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Income with ID {} not found", id);
          return new ResourceNotFoundException("Income with ID " + id + " not found");
        });
    return mapToDTO(Income);
  }

  // UPDATE
  public IncomeResponseDTO updateIncomeById(Long id,  IncomeRequestDTO incomeRequestDTO) {
    log.info("Attempting to update Income by ID {}", id);
    Income existingIncome = incomeRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Update failed. Income not found with ID: {}", id);
          return new ResourceNotFoundException("Income with ID " + id + " not found");
        });

    log.debug("Updating Income '{}'. Changing amount from {} to {}",
        existingIncome.getName(), existingIncome.getExpectedAmount(), incomeRequestDTO.expectedAmount());

    existingIncome.setName(incomeRequestDTO.name());
    existingIncome.setExpectedAmount(incomeRequestDTO.expectedAmount());
    existingIncome.setCurrency(incomeRequestDTO.currency());

    Income updatedIncome = incomeRepository.save(existingIncome);
    log.info("Successfully updated Income with ID: {}", id);

    return mapToDTO(updatedIncome);
  }

  // DELETE
  public void deleteIncomeById(Long id) {
    log.info("Attempting to delete Income by ID {}", id);
    if (!incomeRepository.existsById(id)) {
      log.warn("Deletion failed. Income with ID {} not found", id);
      throw new ResourceNotFoundException("Income with ID " + id + " not found");
    }

    incomeRepository.deleteById(id);
    log.info("Successfully deleted Income with ID: {}", id);
  }

  // Helper Method
  private IncomeResponseDTO mapToDTO(Income income) {

    List<IncomeEntryResponseDTO> entryDTOs = income.getEntries() != null
        ? income.getEntries().stream()
          .map(entry -> new IncomeEntryResponseDTO(
              entry.getId(),
              entry.getAmount(), // adjust these based on your actual entity fields
              entry.getDate(),
              entry.getNote()
          ))
          .toList()
        : List.of();

    return new IncomeResponseDTO(
        income.getId(),
        income.getName(),
        income.getExpectedAmount(),
        income.getCurrency(),
        entryDTOs
    );
  }
}
