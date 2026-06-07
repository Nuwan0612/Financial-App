package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "buckets")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@SQLDelete(sql = "UPDATE buckets SET is_active = false WHERE id=?")
public class Bucket {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Builder.Default
  @Column(precision = 12, scale = 2)
  private BigDecimal currentAmount = BigDecimal.ZERO;

  @Builder.Default
  @Column(nullable = false)
  private Boolean isActive = Boolean.TRUE;

  @Builder.Default
  @Column(precision = 12, scale = 2)
  private BigDecimal cumulativeAmount = BigDecimal.ZERO;

  @ToString.Exclude
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "sub_category_id", nullable = false)
  private SubCategory subCategory;

  @ToString.Exclude
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private Account mainAccount;

}