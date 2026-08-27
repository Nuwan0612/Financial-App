package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FuturesJournalRequestDTO(
    @NotNull Long accountId,
    @NotNull Long bucketId,
    @NotBlank String coinPair,
    @NotBlank String positionType, // LONG or SHORT
    @NotNull @Positive Integer leverage,
    @NotNull @Positive BigDecimal margin,
    @NotNull @Positive BigDecimal pnl,
    @NotNull LocalDateTime openDate,
    @NotNull LocalDateTime closeDate,
    String ss_path,
    String notes
    ) {}
