package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SpotTransactionResponseDTO(
        Long id,
        String coin,
        BigDecimal totalQuantity,
        BigDecimal currentPrice,
        BigDecimal avgPrice,      // Calculated in mapper
        BigDecimal totalInvested, // Calculated in mapper
        Long accountId,
        Long bucketId,
        List<SpotTransactionDTO> transactions
) {}
