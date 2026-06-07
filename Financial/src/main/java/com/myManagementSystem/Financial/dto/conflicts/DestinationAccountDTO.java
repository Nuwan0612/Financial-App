package com.myManagementSystem.Financial.dto.conflicts;

import java.util.List;

// 3. The available destination accounts
public record DestinationAccountDTO(
    Long accountId,
    String accountName,
    List<DestinationBucketDTO> buckets
) {}
