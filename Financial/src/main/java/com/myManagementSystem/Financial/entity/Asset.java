package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "assets")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Asset {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  // Renamed for clarity: What did you buy it for?
  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal purchasePrice;

  // The new field: What is it worth today?
  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal currentMarketValue;

  @Column(name = "accrue_date")
  private LocalDate accrueDate;
}