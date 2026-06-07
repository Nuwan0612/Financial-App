package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;

public record AccountResponseDTO(
    Long id,
    String name,
    String type,
    BigDecimal currentBalance,
    Boolean isActive
) { }
