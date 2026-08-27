package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BinanceFundTransferRequestDTO(
    @NotNull(message = "Required fromAccount ID")
    Long fromAccountId,

    @NotNull(message = "Required toAccount ID")
    Long toAccountId,

    @NotNull
    @Positive
    BigDecimal amount
) {
}
