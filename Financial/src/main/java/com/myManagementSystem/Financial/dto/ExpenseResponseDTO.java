package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;

public record ExpenseResponseDTO(Long id, String name, BigDecimal amount) {
}
