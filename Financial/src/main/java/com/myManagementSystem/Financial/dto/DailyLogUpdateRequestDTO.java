package com.myManagementSystem.Financial.dto;

import com.myManagementSystem.Financial.enums.LogType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyLogUpdateRequestDTO(
    @NotNull(message = "ID is required for bulk updates")
    Long id,

    @NotNull(message = "Date is required")
    LocalDate date,

    @NotBlank(message = "Description cannot be empty")
    String description,

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    BigDecimal amount,

    @NotNull(message = "Log type is required")
    LogType type,

    @NotNull(message = "Account ID is required")
    Long accountId,

    Long bucketId // Optional
) {
}
