package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;

public record BucketResponseDTO(
    Long id,
    String name,
    BigDecimal currentAmount,
    BigDecimal cumulativeAmount,
    Long subCategoryId,
    String subCategoryName,
    Long accountId,
    String accountName,
    Boolean isActive
) {
}
