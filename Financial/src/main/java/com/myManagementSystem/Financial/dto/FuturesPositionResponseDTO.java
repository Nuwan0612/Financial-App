package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FuturesPositionResponseDTO(
        Long id,
        String coinPair,
        String positionType,
        Integer leverage,
        BigDecimal margin,
        BigDecimal realizedPnl,
        String status,
        LocalDateTime openDate,
        LocalDateTime closeDate
) {}
