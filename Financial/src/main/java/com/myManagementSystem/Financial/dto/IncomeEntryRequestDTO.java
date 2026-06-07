package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record IncomeEntryRequestDTO(
    @NotNull(message = "Income Source ID is required")
    Long incomeId,

    @NotNull(message = "Date should not be null")
    LocalDate date,

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    BigDecimal amount,

    String note
) { }
