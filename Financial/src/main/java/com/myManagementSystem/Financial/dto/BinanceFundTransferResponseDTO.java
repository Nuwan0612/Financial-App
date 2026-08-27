package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;

public record BinanceFundTransferResponseDTO(
    Long fromAccountId,
    BigDecimal fromAccountCurrentValue,
    Long toAccountId,
    BigDecimal toAccountCurrentValue
) {
}
