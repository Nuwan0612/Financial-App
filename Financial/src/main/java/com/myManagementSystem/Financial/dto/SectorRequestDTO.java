package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotBlank;

public record SectorRequestDTO(
    @NotBlank(message = "Sector name cant be empty")
    String name
) {
}
