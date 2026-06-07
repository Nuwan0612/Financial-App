package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountSnapshotResponseDTO(
    Long id,
    Long accountId,
    BigDecimal balance,
    LocalDateTime date
) {
}
