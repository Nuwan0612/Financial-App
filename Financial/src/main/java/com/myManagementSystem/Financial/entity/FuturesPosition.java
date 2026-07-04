package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "futures_positions")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class FuturesPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "coin_pair", nullable = false)
    private String coinPair; // e.g., "BTC/USDT"

    @Column(nullable = false)
    private String positionType; // LONG or SHORT

    @Column(nullable = false)
    private Integer leverage;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal margin;

    @Column(name = "realized_pnl", precision = 19, scale = 4)
    private BigDecimal realizedPnl;

    @Column(nullable = false)
    private String status; // OPEN or CLOSED

    @Column(name = "open_date", nullable = false)
    private LocalDateTime openDate;

    @Column(name = "close_date")
    private LocalDateTime closeDate;

    // Directly linking to your global envelope system
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bucket_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Bucket bucket;
}