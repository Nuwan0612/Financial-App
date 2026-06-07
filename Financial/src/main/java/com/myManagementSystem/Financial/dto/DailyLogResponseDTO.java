package com.myManagementSystem.Financial.dto;

import com.myManagementSystem.Financial.enums.LogType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyLogResponseDTO(
    Long id,
    LocalDate date,
    String description,
    BigDecimal amount,
    LogType type,

    Long accountId,
    String accountName,

    Long bucketId,
    String bucketName
) {
}
