package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "binance_snapshots")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BinanceSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long bucketId;

    private BigDecimal balance;

    private LocalDateTime snapshotDate;
}
