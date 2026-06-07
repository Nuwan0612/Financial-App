package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotBlank;

public record MainCategoryRequestDTO(

    @NotBlank(message = "Main category name is required")
    String name
) {
}
