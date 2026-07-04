package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "company_metrics")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CompanyMetric {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "is_sp_20", nullable = false)
  private Boolean isSp20;

  @Column(name = "is_dividend_paying", nullable = false)
  private Boolean isDividendPaying;

  @Column(name = "pe_ratio", precision = 10, scale = 4)
  private BigDecimal peRatio;

  @Column(name = "eps", precision = 10, scale = 4)
  private BigDecimal eps;

  // Links back to the company
  @OneToOne(mappedBy = "metric")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private InvestmentCompany company;
}