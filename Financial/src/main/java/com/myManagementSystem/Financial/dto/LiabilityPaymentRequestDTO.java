package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LiabilityPaymentRequestDTO(
    @NotNull(message = "Payment amount is required")
    @Positive(message = "Payment amount must be greater than zero")
    BigDecimal amountPaid,

    @NotNull(message = "Payment date is required")
    LocalDate paymentDate,

    String notes
) {
}
