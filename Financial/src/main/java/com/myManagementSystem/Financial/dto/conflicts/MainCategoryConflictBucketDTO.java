package com.myManagementSystem.Financial.dto.conflicts;

import java.math.BigDecimal;

public record MainCategoryConflictBucketDTO(
    Long bucketId,
    String bucketName,
    BigDecimal balance,
    Long subCategoryId,
    String subCategoryName,
    Long accountId,
    String accountName
) { }
