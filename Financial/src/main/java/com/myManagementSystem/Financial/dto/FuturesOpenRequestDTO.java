package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record FuturesOpenRequestDTO(
        @NotNull Long accountId,
        @NotNull Long bucketId,
        @NotBlank String coinPair,
        @NotBlank String positionType, // LONG or SHORT
        @NotNull @Positive Integer leverage,
        @NotNull @Positive BigDecimal margin
) {}
