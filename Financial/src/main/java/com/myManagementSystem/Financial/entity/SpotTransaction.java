package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "spot_transactions")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class SpotTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // BUY or SELL

    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal amount; // Quantity of coin

    @Column(name = "execution_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal executionPrice; // Price in USDT

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spot_asset_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private SpotAsset spotAsset;
}