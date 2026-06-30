package com.myManagementSystem.Financial.dto;

import com.myManagementSystem.Financial.enums.CalTransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CalTransactionResponseDTO(
        Long id,
        Long calFundId,
        String fundName,
        CalTransactionType type,
        BigDecimal amount,
        LocalDateTime transactionDate
) {
}