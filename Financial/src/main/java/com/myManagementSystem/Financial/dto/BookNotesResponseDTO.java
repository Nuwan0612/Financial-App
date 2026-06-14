package com.myManagementSystem.Financial.dto;

import com.myManagementSystem.Financial.entity.Book;

import java.time.LocalDateTime;

public record BookNotesResponseDTO(
        Long id,
        String chapter,
        String notes,
        LocalDateTime dateTime,
        Long bookId
) {
}
