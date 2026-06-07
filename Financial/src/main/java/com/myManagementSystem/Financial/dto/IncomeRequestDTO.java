package com.myManagementSystem.Financial.dto;

import com.myManagementSystem.Financial.enums.CurrencyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record IncomeRequestDTO(
    @NotBlank(message = "Income is required")
    String name,

    @NotNull(message = "Currency type is required")
    CurrencyType currency, // Added here!

    @NotNull(message = "Amount is required")
    @PositiveOrZero(message = "Amount cannot be negative")
    BigDecimal expectedAmount
) { }
