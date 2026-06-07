package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "income_entries")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class IncomeEntry {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "income_id", nullable = false)
  private Income income;

  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal amount;

  @Column
  private String note;
}
