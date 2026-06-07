package com.myManagementSystem.Financial.entity;

import com.myManagementSystem.Financial.enums.CurrencyType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "incomes")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Income {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String name;

  @Column(nullable = false)
  private CurrencyType currency;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal expectedAmount;

  @OneToMany(mappedBy = "income", cascade = CascadeType.ALL)
  private List<IncomeEntry> entries;
}
