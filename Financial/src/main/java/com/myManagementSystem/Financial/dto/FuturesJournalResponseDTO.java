package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FuturesJournalResponseDTO(
        Long id,
        String coinPair,
        String positionType,
        Integer leverage,
        BigDecimal margin,
        BigDecimal realizedPnl,
        LocalDateTime openDate,
        LocalDateTime closeDate,
        String ss_path,
        String notes
) {}
