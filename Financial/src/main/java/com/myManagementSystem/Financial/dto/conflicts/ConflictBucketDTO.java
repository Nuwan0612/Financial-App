package com.myManagementSystem.Financial.dto.conflicts;

import java.math.BigDecimal;

// 2. The conflicting buckets (You already have this!)
public record ConflictBucketDTO(
    Long id,
    String name,
    BigDecimal balance
) {}
