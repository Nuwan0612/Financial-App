package com.myManagementSystem.Financial.entity;

import com.myManagementSystem.Financial.listener.AccountEntityListener;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "accounts")
@EntityListeners(AccountEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
@Data
@SQLDelete(sql = "UPDATE accounts SET is_active = false WHERE id=?")
@Builder
public class Account {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String type;

  @Builder.Default
  @Column(nullable = false)
  private Boolean isActive = Boolean.TRUE;

  @Builder.Default
  @Column(precision = 12, scale = 2)
  private BigDecimal currentBalance = BigDecimal.ZERO;

  @ToString.Exclude
  @OneToMany(mappedBy = "mainAccount", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<Bucket> buckets = new ArrayList<>();

  @ToString.Exclude
  @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<SubCategory> subCategories = new ArrayList<>();


}