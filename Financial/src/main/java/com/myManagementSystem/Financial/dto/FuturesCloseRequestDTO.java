package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record FuturesCloseRequestDTO(
        @NotNull BigDecimal realizedPnl // Can be negative (loss)
) {}
