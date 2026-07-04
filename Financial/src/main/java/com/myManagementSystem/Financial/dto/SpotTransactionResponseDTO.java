package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SpotTransactionResponseDTO(
        Long id,
        String type,
        BigDecimal amount,
        BigDecimal executionPrice,
        LocalDateTime transactionDate
) {}
