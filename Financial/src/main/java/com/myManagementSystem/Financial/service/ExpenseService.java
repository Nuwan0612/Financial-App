package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.ExpenseRequestDTO;
import com.myManagementSystem.Financial.dto.ExpenseResponseDTO;
import com.myManagementSystem.Financial.entity.Expense;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

  private final ExpenseRepository expenseRepository;

  // CREATE
  public ExpenseResponseDTO createExpense(ExpenseRequestDTO expenseRequestDTO) {
    log.info("Attempting to create new Expense {}", expenseRequestDTO.name());

    Expense expense = Expense.builder()
        .name(expenseRequestDTO.name())
        .amount(expenseRequestDTO.amount())
        .build();

    Expense savedExpense = expenseRepository.save(expense);
    log.info("Successfully saved Expense with ID {}", savedExpense.getId());
    return mapToDTO(savedExpense);
  }

  // READ ALL
  public List<ExpenseResponseDTO> getAllExpenses() {
    log.info("Attempting to get all Expenses from database");

    List<ExpenseResponseDTO> expenses = expenseRepository.findAll()
        .stream()
        .map(this::mapToDTO)
        .toList();

    log.debug("Successfully retrieved {} Expenses", expenses.size());
    return expenses;
  }

  // READ ONE
  public ExpenseResponseDTO getExpenseById(Long id) {
    log.info("Attempting to get Expense by ID {}", id);
    Expense expense = expenseRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Expense with ID {} not found", id);
          return new ResourceNotFoundException("Expense with ID " + id + " not found");
        });
    return mapToDTO(expense);
  }

  // UPDATE
  public ExpenseResponseDTO updateExpenseById(Long id,  ExpenseRequestDTO expenseRequestDTO) {
    log.info("Attempting to update Expense by ID {}", id);
    Expense existingExpense = expenseRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Update failed. Expense not found with ID: {}", id);
          return new ResourceNotFoundException("Expense with ID " + id + " not found");
        });

    log.debug("Updating Expense '{}'. Changing amount from {} to {}",
        existingExpense.getName(), existingExpense.getAmount(), expenseRequestDTO.amount());

    existingExpense.setName(expenseRequestDTO.name());
    existingExpense.setAmount(expenseRequestDTO.amount());

    Expense updatedExpense = expenseRepository.save(existingExpense);
    log.info("Successfully updated Expense with ID: {}", id);

    return mapToDTO(updatedExpense);
  }

  // DELETE
  public void deleteExpenseById(Long id) {
    log.info("Attempting to delete Expense by ID {}", id);
    if (!expenseRepository.existsById(id)) {
      log.warn("Deletion failed. Expense with ID {} not found", id);
      throw new ResourceNotFoundException("Expense with ID " + id + " not found");
    }

    expenseRepository.deleteById(id);
    log.info("Successfully deleted Expense with ID: {}", id);
  }

  // Helper Method
  private ExpenseResponseDTO mapToDTO(Expense expense) {
    return new ExpenseResponseDTO(
        expense.getId(),
        expense.getName(),
        expense.getAmount()
    );
  }
}
