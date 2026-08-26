package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SpotTransactionDTO(
        Long id,
        String type,
        BigDecimal quantity,
        BigDecimal executionPrice,
        BigDecimal investAmount,
        LocalDateTime transactionDate
) {}
