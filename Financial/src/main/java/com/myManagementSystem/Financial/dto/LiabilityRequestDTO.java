package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LiabilityRequestDTO(

    @NotBlank(message = "Name is required")
    String name,

    Boolean isPaid,

    LocalDate completed,

    @NotNull(message = "Borrowed date is required")
    LocalDate borrowed,

    @NotNull(message = "Amount is required")
    @PositiveOrZero(message = "Amount cannot be negative")
    BigDecimal amount
) { }
