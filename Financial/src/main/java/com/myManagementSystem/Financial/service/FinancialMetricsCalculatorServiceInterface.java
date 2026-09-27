package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.CategoryProfitSummaryDTO;
import com.myManagementSystem.Financial.entity.Asset;

import java.math.BigDecimal;
import java.util.List;

public interface FinancialMetricsCalculatorServiceInterface {
  CategoryProfitSummaryDTO calculateAssetProfits();
  CategoryProfitSummaryDTO calculateCalFundProfits();
  CategoryProfitSummaryDTO calculateSpotProfits();
  CategoryProfitSummaryDTO calculateStockProfits();
  CategoryProfitSummaryDTO calculateFuturesProfits();

}
