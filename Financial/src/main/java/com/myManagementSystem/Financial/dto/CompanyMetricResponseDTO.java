package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;

public record CompanyMetricResponseDTO(
    Long id,
    Long companyId,
    Boolean isDividendPaying,
    BigDecimal peRatio,
    BigDecimal eps
) {}