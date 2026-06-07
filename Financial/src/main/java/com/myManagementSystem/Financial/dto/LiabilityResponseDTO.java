package com.myManagementSystem.Financial.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record LiabilityResponseDTO(
    Long id,
    String name,
    Boolean isPaid,
    LocalDate completed,
    LocalDate borrowed,
    BigDecimal amount,
    BigDecimal totalPaid,
    BigDecimal remainingBalance,
    List<LiabilityPaymentResponseDTO> payments
) { }
