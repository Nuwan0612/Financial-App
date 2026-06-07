package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record AccountRequestDTO(

    @NotBlank(message = "Account name is required")
    String name,

    @NotBlank(message = "Account type is required")
    String type,

    BigDecimal currentBalance
) { }
