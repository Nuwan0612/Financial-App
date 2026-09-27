package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import java.util.List;

public record CategoryProfitSummaryDTO(
    String categoryName,
    BigDecimal totalInvested,
    BigDecimal totalCurrentValue,
    BigDecimal totalProfitOrLoss,
    BigDecimal totalProfitPercentage,
    List<ItemProfitMetricDTO> items
) {}
