package com.myManagementSystem.Financial.dto;

import com.myManagementSystem.Financial.enums.CalTransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CalTransactionRequestDTO(
        @NotNull(message = "Fund ID is required")
        Long calFundId,

        @NotNull(message = "Transaction type is required")
        CalTransactionType type,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero")
        BigDecimal amount
) {
}