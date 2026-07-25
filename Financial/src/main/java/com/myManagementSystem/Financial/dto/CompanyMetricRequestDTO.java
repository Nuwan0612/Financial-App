package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;

public record CompanyMetricRequestDTO(
    @NotNull(message = "Dividend paying status is required")
    Boolean isDividendPaying,
    BigDecimal peRatio,
    BigDecimal eps
) {}