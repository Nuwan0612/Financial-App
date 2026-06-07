package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ExpenseRequestDTO(
    @NotBlank(message = "Expense name is required")
    String name,

    @NotNull(message = "Amount is required")
    @PositiveOrZero(message = "Amount cannot be negative")
    BigDecimal amount
) { }
