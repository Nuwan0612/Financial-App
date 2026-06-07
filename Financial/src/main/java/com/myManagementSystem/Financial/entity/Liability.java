package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "liabilities")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Liability {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private Boolean isPaid;

  @Column(name = "completed_date")
  private LocalDate completed;

  @Column(nullable = false, name = "borrowed_date")
  private LocalDate borrowed;

  @Column(nullable = false, precision =  12, scale = 2)
  private BigDecimal amount;

  @OneToMany(mappedBy = "liability", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<LiabilityPayment> payments = new ArrayList<>();
}
