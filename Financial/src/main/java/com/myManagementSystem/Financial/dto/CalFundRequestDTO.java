package com.myManagementSystem.Financial.dto;

import com.myManagementSystem.Financial.enums.CalAssetCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CalFundRequestDTO(
        @NotBlank(message = "Fund name is required")
        String name,

        @NotNull(message = "Category is required")
        CalAssetCategory category,

        @NotNull(message = "Account ID is required")
        Long accountId,

        @NotNull(message = "Bucket ID is required")
        Long bucketId
) {
}