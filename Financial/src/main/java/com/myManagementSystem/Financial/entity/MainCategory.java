package com.myManagementSystem.Financial.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.util.List;

@Entity
@Table(name = "allocation_main_category")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@SQLDelete(sql = "UPDATE allocation_main_category SET is_active = false WHERE id=?")
public class MainCategory {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String category;

  @Builder.Default
  @Column(nullable = false)
  private Boolean isActive = Boolean.TRUE;

  // Cascade is perfect here.
  @OneToMany(mappedBy = "mainCategory", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<SubCategory> subCategories;
}