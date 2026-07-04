package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;

public record SpotAssetResponseDTO(
        Long id,
        String coin,
        BigDecimal totalAmount,
        BigDecimal currentPrice
) {}
