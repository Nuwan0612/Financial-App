package com.myManagementSystem.Financial.entity;

import com.myManagementSystem.Financial.enums.CalAssetCategory;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cal_funds")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CalFund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CalAssetCategory category;

    // The total value shown on your CAL dashboard (Invested + Earnings)
    @Column(name = "current_value", precision = 19, scale = 4)
    private BigDecimal currentValue;

    // Set to false when you fully redeem the fund to keep your active dashboard clean
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    // --- Core Financial Links ---

    // Links to your CAL Brokerage Account to update your Total Wealth with compounding profit
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Account account;

    // Links to your Investment Bucket to track how much pure capital you have deployed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bucket_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Bucket bucket;

    // The ledger of all investments and redemptions for this specific fund
    @OneToMany(mappedBy = "calFund", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<CalTransaction> transactions = new ArrayList<>();
}