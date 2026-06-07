package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LiabilityPaymentResponseDTO(
    Long id,
    BigDecimal amountPaid,
    LocalDate paymentDate,
    String notes
) {
}
