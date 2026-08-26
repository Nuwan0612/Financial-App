package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "spot_assets")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class SpotAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String coin; // e.g., "BTC", "ETH"

    @Column(name = "total_quantity", precision = 19, scale = 8)
    private BigDecimal totalQuantity; // Total Quantity

    @Column(name = "current_price", precision = 19, scale = 4)
    private BigDecimal currentPrice;

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

    @Builder.Default
    @OneToMany(mappedBy = "spotAsset", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<SpotTransaction> transactions = new ArrayList<>();
}