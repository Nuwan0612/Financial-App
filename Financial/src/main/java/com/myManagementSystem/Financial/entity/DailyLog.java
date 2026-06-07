package com.myManagementSystem.Financial.entity;

import com.myManagementSystem.Financial.enums.LogType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "daily_logs")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class DailyLog {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = false)
  private String description;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal amount;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private LogType type; // Uses the safe Enum!

  @ToString.Exclude
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private Account account;

  // Nullable is TRUE because an expense might just be from an account,
  // not necessarily linked to a specific savings bucket.
  @ToString.Exclude
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "bucket_id", nullable = true)
  private Bucket bucket;

}
