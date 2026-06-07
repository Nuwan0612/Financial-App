package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;

public record SubCategoryResponseDTO(
    Long id,
    String name,
    BigDecimal percentage,

    // Flattened Main Category data
    Long mainCategoryId,
    String mainCategoryName,

    // Flattened Account data
    Long accountId,
    String accountName,

    Boolean isActive
) { }
