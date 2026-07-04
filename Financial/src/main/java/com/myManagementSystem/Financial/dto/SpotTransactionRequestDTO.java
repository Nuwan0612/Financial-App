package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record SpotTransactionRequestDTO(
        @NotNull Long accountId,
        @NotNull Long bucketId,
        @NotBlank String coin,
        @NotBlank String type, // BUY or SELL
        @NotNull @Positive BigDecimal amount,
        @NotNull @Positive BigDecimal executionPrice
) {}
