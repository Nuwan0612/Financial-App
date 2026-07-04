package com.myManagementSystem.Financial.dto;

import com.myManagementSystem.Financial.enums.StockTransactionSide;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record TradeTransactionRequestDTO(
    @NotNull(message = "Company ID is required")
    Long companyId,

    @NotNull(message = "Transaction type (BUY/SELL) is required")
    StockTransactionSide type,

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    BigDecimal quantity,

    @NotNull(message = "Execution price is required")
    @Positive(message = "Price must be greater than zero")
    BigDecimal executionPrice,

    @NotNull(message = "Account ID is required")
    Long accountId,

    @NotNull(message = "Bucket ID is required")
    Long bucketId
) {
}