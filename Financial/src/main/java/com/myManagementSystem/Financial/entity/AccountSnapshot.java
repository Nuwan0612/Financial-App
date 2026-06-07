package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "account_snapshots")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountSnapshot {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private Long accountId; // Just the ID is fine here for a lightweight snapshot

  private BigDecimal balance;

  private LocalDateTime snapshotDate;
}
