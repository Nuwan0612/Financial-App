package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotBlank;

public record BookRequestDTO(
        @NotBlank(message = "Book name is required")
        String name
) {
}
