package com.myManagementSystem.Financial.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SubCategoryRequestDTO(

    @NotBlank(message = "Sub-category name is required")
    String name,

    @NotNull(message = "Percentage is required")
    @DecimalMin(value = "0.01", message = "Percentage must be greater than zero")
    @DecimalMax(value = "100.00", message = "Percentage cannot be greater than 100")
    BigDecimal percentage,

    // Notice we only ask for the IDs!
    @NotNull(message = "Main Category ID is required")
    Long mainCategoryId,

    @NotNull(message = "Target Account ID is required")
    Long accountId

) { }
