package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "allocation_sub_category")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@SQLDelete(sql = "UPDATE allocation_sub_category SET is_active = false WHERE id=?")
public class SubCategory {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String name;

  @Column(nullable = false, precision = 5, scale = 2)
  private BigDecimal percentage;

  @Builder.Default
  @Column(nullable = false)
  private Boolean isActive = Boolean.TRUE;

  @ToString.Exclude
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id", nullable = false)
  private MainCategory mainCategory;

  @ToString.Exclude
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private Account account;

  // Cascade is perfect here.
  @OneToMany(mappedBy = "subCategory", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Bucket> buckets;
}