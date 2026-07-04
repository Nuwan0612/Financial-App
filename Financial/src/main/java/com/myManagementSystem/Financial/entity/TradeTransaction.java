package com.myManagementSystem.Financial.entity;

import com.myManagementSystem.Financial.enums.StockTransactionSide;
import com.myManagementSystem.Financial.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trade_transactions")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class TradeTransaction {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private StockTransactionSide type; // BUY or SELL

  @Column(nullable = false, precision = 19, scale = 4)
  private BigDecimal quantity; // Number of shares

  @Column(name = "execution_price", nullable = false, precision = 19, scale = 4)
  private BigDecimal executionPrice; // Share value when bought/sold

  @Column(name = "investment_amount", nullable = false, precision = 19, scale = 4)
  private BigDecimal investmentAmount; // Total value (Quantity * Price + Fees)

  @Column(name = "transaction_date", nullable = false)
  private LocalDateTime transactionDate;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "company_id", nullable = false)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private InvestmentCompany company;
}