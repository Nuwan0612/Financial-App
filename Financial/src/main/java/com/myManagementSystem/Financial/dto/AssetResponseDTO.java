package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssetResponseDTO(
    Long id,
    String name,
    BigDecimal purchasePrice,
    BigDecimal currentMarketValue,
    LocalDate accrueDate
) {
}
