package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssetRequestDTO(
    @NotBlank(message = "Asset name is required")
    String name,

    @NotNull(message = "Amount is required")
    @PositiveOrZero(message = "Amount cannot be negative")
    BigDecimal purchasePrice,

    LocalDate accrueDate,

    BigDecimal currentMarketValue
) { }
