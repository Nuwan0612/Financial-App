package com.myManagementSystem.Financial;

import com.myManagementSystem.Financial.dto.CategoryProfitSummaryDTO;
import com.myManagementSystem.Financial.entity.Asset;
import com.myManagementSystem.Financial.repository.AssetRepository;
import com.myManagementSystem.Financial.service.impl.FinancialMetricsCalculatorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinancialMetricsCalculatorServiceTest {

  @Mock
  private AssetRepository assetRepository;

  @InjectMocks
  private FinancialMetricsCalculatorService calculatorService;

  private Asset landAsset;
  private Asset goldAsset;

  @BeforeEach
  void setUp() {
    landAsset = Asset.builder()
        .id(1L)
        .name("Land Plot")
        .purchasePrice(new BigDecimal("1000000.0000"))
        .currentMarketValue(new BigDecimal("1250000.0000"))
        .accrueDate(LocalDate.now())
        .build();

    goldAsset = Asset.builder()
        .id(2L)
        .name("Gold Sovereign")
        .purchasePrice(new BigDecimal("200000.0000"))
        .currentMarketValue(new BigDecimal("250000.0000"))
        .accrueDate(LocalDate.now())
        .build();
  }

  @Test
  @DisplayName("Should correctly calculate profits, totals, and percentages across multiple assets")
  void calculateAssetProfits_Success() {
    when(assetRepository.findAll()).thenReturn(List.of(landAsset, goldAsset));

    CategoryProfitSummaryDTO result = calculatorService.calculateAssetProfits();

    assertThat(result).isNotNull();
    assertThat(result.categoryName()).isEqualTo("ASSETS");
    assertThat(result.totalInvested()).isEqualByComparingTo("1200000.0000");
    assertThat(result.totalCurrentValue()).isEqualByComparingTo("1500000.0000");
    assertThat(result.totalProfitOrLoss()).isEqualByComparingTo("300000.0000");
    assertThat(result.totalProfitPercentage()).isEqualByComparingTo("25.00");
    assertThat(result.items()).hasSize(2);
    assertThat(result.items().get(0).profitOrLoss()).isEqualByComparingTo("250000.0000");
    assertThat(result.items().get(0).profitPercentage()).isEqualByComparingTo("25.00");

    verify(assetRepository, times(1)).findAll();
  }

  @Test
  @DisplayName("Should return zero metrics without throwing ArithmeticException when total invested is zero")
  void calculateAssetProfits_ZeroBasePrice() {
    Asset zeroCostAsset = Asset.builder()
        .id(3L)
        .name("Gifted Bond")
        .purchasePrice(BigDecimal.ZERO)
        .currentMarketValue(new BigDecimal("50000.0000"))
        .build();

    when(assetRepository.findAll()).thenReturn(List.of(zeroCostAsset));

    CategoryProfitSummaryDTO result = calculatorService.calculateAssetProfits();

    assertThat(result.totalInvested()).isEqualByComparingTo("0");
    assertThat(result.totalProfitOrLoss()).isEqualByComparingTo("50000.0000");
    assertThat(result.totalProfitPercentage()).isEqualByComparingTo("0");
  }

  @Test
  @DisplayName("Should return empty lists and zero totals when no assets exist")
  void calculateAssetProfits_EmptyList() {
    when(assetRepository.findAll()).thenReturn(Collections.emptyList());

    CategoryProfitSummaryDTO result = calculatorService.calculateAssetProfits();

    assertThat(result.items()).isEmpty();
    assertThat(result.totalInvested()).isEqualByComparingTo("0");
    assertThat(result.totalCurrentValue()).isEqualByComparingTo("0");
    assertThat(result.totalProfitOrLoss()).isEqualByComparingTo("0");
    assertThat(result.totalProfitPercentage()).isEqualByComparingTo("0");
  }

  @Test
  @DisplayName("Should catch repository exception and return safe fallback DTO")
  void calculateAssetProfits_FallbackOnException() {
    when(assetRepository.findAll()).thenThrow(new RuntimeException("Database connection timeout"));

    CategoryProfitSummaryDTO result = calculatorService.calculateAssetProfits();

    assertThat(result).isNotNull();
    assertThat(result.categoryName()).isEqualTo("ASSETS");
    assertThat(result.totalInvested()).isEqualByComparingTo("0");
    assertThat(result.totalCurrentValue()).isEqualByComparingTo("0");
    assertThat(result.totalProfitOrLoss()).isEqualByComparingTo("0");
    assertThat(result.items()).isEmpty();

    verify(assetRepository, times(1)).findAll();
  }
}
