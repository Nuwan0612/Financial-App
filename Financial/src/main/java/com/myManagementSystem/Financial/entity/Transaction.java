package com.myManagementSystem.Financial.entity;

import com.myManagementSystem.Financial.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Transaction {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String description;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal amount;

  @Builder.Default
  private Boolean status = Boolean.FALSE;

  @Column(nullable = false)
  private LocalDate openingDate;

  private LocalDate closingDate;

  // FROM side — store both ID and name
  @Column(name = "from_account_id")
  private Long fromAccountId;

  @Column(name = "from_account_name")
  private String fromAccountName;

  @Column(name = "from_bucket_id")
  private Long fromBucketId;

  @Column(name = "from_bucket_name")
  private String fromBucketName;

  // TO side — store both ID and name
  @Column(name = "to_account_id", nullable = false)
  private Long toAccountId;

  @Column(name = "to_account_name", nullable = false)
  private String toAccountName;

  @Column(name = "to_bucket_id", nullable = false)
  private Long toBucketId;

  @Column(name = "to_bucket_name", nullable = false)
  private String toBucketName;
}