package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotBlank;

public record BookNotesRequestDTO(

        @NotBlank(message = "Chapter name is required")
        String chapter,

        String notes,
        Long bookId
) {
}
