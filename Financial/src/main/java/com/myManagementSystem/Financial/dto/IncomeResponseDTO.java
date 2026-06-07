package com.myManagementSystem.Financial.dto;

import com.myManagementSystem.Financial.enums.CurrencyType;

import java.math.BigDecimal;
import java.util.List;

public record IncomeResponseDTO(
    Long id,
    String name,
    BigDecimal expectedAmount,
    CurrencyType currency,
    List<IncomeEntryResponseDTO> incomeEntries
) {
}
