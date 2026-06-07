package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequestDTO(
    String description,

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be strictly positive")
    BigDecimal amount,

    @NotNull(message = "Opening date is required")
    LocalDate openingDate,

    // FROM side — null = money comes from outside (calculator allocations)
    Long fromAccountId,
    Long fromBucketId,

    // TO side — always required
    @NotNull(message = "Target Account ID is required")
    Long toAccountId,

    @NotNull(message = "Target Bucket ID is required")
    Long toBucketId
) { }
