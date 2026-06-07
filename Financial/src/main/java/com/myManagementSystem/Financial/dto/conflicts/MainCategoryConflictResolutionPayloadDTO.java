package com.myManagementSystem.Financial.dto.conflicts;

import java.util.List;

public record MainCategoryConflictResolutionPayloadDTO(
    Long mainCategoryId,
    String mainCategoryName,
    List<MainCategoryConflictBucketDTO> conflictingBuckets,
    List<DestinationAccountDTO> availableDestinations  // reuse existing
) { }
