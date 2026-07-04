package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record InvestmentCompanyRequestDTO(
    @NotBlank(message = "Symbol is required")
    String symbol,

    @NotBlank(message = "Company name is required")
    String name,

    BigDecimal currentPrice,

    @NotNull(message = "Sector ID is required")
    Long sectorId
) {
}