package com.myManagementSystem.Financial.dto.conflicts;

// 4. The available destination buckets
public record DestinationBucketDTO(
    Long bucketId,
    String bucketName,
    String subCategoryName // Helpful for grouping in the React dropdown!
) {}
