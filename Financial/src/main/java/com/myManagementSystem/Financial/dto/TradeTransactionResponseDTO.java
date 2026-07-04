package com.myManagementSystem.Financial.dto;

import com.myManagementSystem.Financial.enums.StockTransactionSide;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TradeTransactionResponseDTO(
    Long id,
    Long companyId,
    String companySymbol,
    StockTransactionSide type,
    BigDecimal quantity,
    BigDecimal executionPrice,
    BigDecimal investmentAmount,
    LocalDateTime transactionDate
) {
}