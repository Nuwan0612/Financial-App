package com.myManagementSystem.Financial.dto;

import com.myManagementSystem.Financial.entity.Income;
import com.myManagementSystem.Financial.enums.CurrencyType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record IncomeEntryResponseDTO(
    Long id,
    BigDecimal amount,
    LocalDate date,
    String note
) { }
