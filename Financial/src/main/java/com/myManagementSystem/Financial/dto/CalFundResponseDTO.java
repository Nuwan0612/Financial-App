package com.myManagementSystem.Financial.dto;

import com.myManagementSystem.Financial.enums.CalAssetCategory;
import java.math.BigDecimal;

public record CalFundResponseDTO(
        Long id,
        String name,
        CalAssetCategory category,
        BigDecimal currentValue,
        Boolean isActive,
        Long accountId,
        Long bucketId,

        // Dynamically Calculated Metrics
        BigDecimal totalInvested,
        BigDecimal totalProfit
) {
}