package com.myManagementSystem.Financial.entity;

import com.myManagementSystem.Financial.enums.CalTransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cal_transactions")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CalTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CalTransactionType type;

    // The exact fiat amount you deposited or withdrew
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    // Links back to the parent fund
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cal_fund_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private CalFund calFund;
}