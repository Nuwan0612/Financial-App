package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;

public record InvestmentCompanyResponseDTO(
    Long id,
    String symbol,
    String name,
    BigDecimal currentPrice,
    String sectorName,
    Boolean isSp20,
    Boolean isActive,

    // --- Dynamically Calculated Financial Metrics ---
    BigDecimal totalActiveShares,
    BigDecimal totalInvestedAmount, // Average Cost * Active Shares
    BigDecimal currentTotalValue,   // Current Price * Active Shares
    BigDecimal totalProfit          // Current Value - Invested Amount
) {
}