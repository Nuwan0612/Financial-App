package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyWealthSnapshotResponseDTO(
    LocalDate date,
    BigDecimal totalBalance
) {}
