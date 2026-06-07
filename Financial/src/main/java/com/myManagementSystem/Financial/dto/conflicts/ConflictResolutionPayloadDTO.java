package com.myManagementSystem.Financial.dto.conflicts;

import java.math.BigDecimal;
import java.util.List;

public record ConflictResolutionPayloadDTO(
    Long accountId,             // <-- ADDED
    String accountName,
    Long mainCategoryId,
    String mainCategoryName,
    Long subCategoryId,
    String subCategoryName,
    List<ConflictBucketDTO> conflictingBuckets,
    List<DestinationAccountDTO> availableDestinations
) {}

