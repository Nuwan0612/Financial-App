package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "investment_companies")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class InvestmentCompany {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String symbol;

  @Column(nullable = false)
  private String name;

  @Column(name = "current_price", precision = 19, scale = 4)
  private BigDecimal currentPrice;

  // Link to Sector (Many companies belong to one sector)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "sector_id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private Sector sector;

  // Link to Metrics (One company has one set of metrics)
  @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
  @JoinColumn(name = "metric_id", referencedColumnName = "id")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private CompanyMetric metric;

  // Link to Transactions (One company has many trades)
  @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<TradeTransaction> transactions = new ArrayList<>();
}