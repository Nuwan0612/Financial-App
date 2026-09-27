package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;

public record ItemProfitMetricDTO(
    Long id,
    String name,
    BigDecimal investedAmount,
    BigDecimal currentValue,
    BigDecimal profitOrLoss,
    BigDecimal profitPercentage
) {}