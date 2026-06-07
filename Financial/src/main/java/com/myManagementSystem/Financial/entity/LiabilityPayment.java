package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "liability_payments")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class LiabilityPayment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal amountPaid;

  @Column(nullable = false, name = "payment_date")
  private LocalDate paymentDate;

  @Column(length = 255)
  private String notes;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "liability_id", nullable = false)
  private Liability liability;
}
