package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponseDTO(
    Long id,
    String description,
    BigDecimal amount,
    Boolean status,
    LocalDate openingDate,
    LocalDate closingDate,

    Long fromAccountId,
    String fromAccountName,
    Long fromBucketId,
    String fromBucketName,

    Long toAccountId,
    String toAccountName,
    Long toBucketId,
    String toBucketName
) {
}
