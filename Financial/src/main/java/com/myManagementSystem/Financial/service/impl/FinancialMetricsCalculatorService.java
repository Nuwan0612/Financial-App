package com.myManagementSystem.Financial.service.impl;

import com.myManagementSystem.Financial.dto.AssetResponseDTO;
import com.myManagementSystem.Financial.dto.CategoryProfitSummaryDTO;
import com.myManagementSystem.Financial.dto.ItemProfitMetricDTO;
import com.myManagementSystem.Financial.entity.*;
import com.myManagementSystem.Financial.enums.CalTransactionType;
import com.myManagementSystem.Financial.enums.StockTransactionSide;
import com.myManagementSystem.Financial.repository.*;
import com.myManagementSystem.Financial.service.FinancialMetricsCalculatorServiceInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class FinancialMetricsCalculatorService implements FinancialMetricsCalculatorServiceInterface {
  private static final BigDecimal HUNDRED = new BigDecimal("100");
  private static final int SCALE = 4;
  private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;


  private final AssetRepository assetRepository;
  private final CalFundRepository calFundRepository;
  private final SpotAssetRepository spotAssetRepository;
  private final InvestmentCompanyRepository investmentCompanyRepository;
  private final FuturesPositionRepository futuresRepository;

  // =========================================================================
  // 1. FIXED ASSETS PROFIT CALCULATOR
  // =========================================================================
  @Transactional(readOnly = true)
  public CategoryProfitSummaryDTO calculateAssetProfits() {
    log.info("Calculating profit metrics for Assets");

    try {
      BigDecimal totalInvested = BigDecimal.ZERO;
      BigDecimal totalCurrentValue = BigDecimal.ZERO;
      List<ItemProfitMetricDTO> itemBreakdowns = new ArrayList<>();

      List<Asset> assets = assetRepository.findAll();

      if (assets != null) {
        for (Asset asset : assets) {
          BigDecimal purchasePrice = defaultZero(asset.getPurchasePrice());
          BigDecimal marketValue = defaultZero(asset.getCurrentMarketValue());

          BigDecimal profit = marketValue.subtract(purchasePrice);
          BigDecimal profitPercent = calculatePercentage(profit, purchasePrice);

          totalInvested = totalInvested.add(purchasePrice);
          totalCurrentValue = totalCurrentValue.add(marketValue);

          itemBreakdowns.add(new ItemProfitMetricDTO(
              asset.getId(),
              asset.getName(),
              purchasePrice,
              marketValue,
              profit,
              profitPercent
          ));
        }
      }

      BigDecimal totalProfit = totalCurrentValue.subtract(totalInvested);
      BigDecimal totalProfitPercent = calculatePercentage(totalProfit, totalInvested);

      return new CategoryProfitSummaryDTO(
          "ASSETS",
          totalInvested,
          totalCurrentValue,
          totalProfit,
          totalProfitPercent,
          itemBreakdowns
      );

    } catch (Exception ex) {
      log.error("Failed to calculate asset profit metrics: {}", ex.getMessage(), ex);

      // Safe fallback response: Prevents dashboard/UI breakage
      return new CategoryProfitSummaryDTO(
          "ASSETS",
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          Collections.emptyList()
      );
    }
  }

  // =========================================================================
// 2. CAL UNIT TRUST PROFIT CALCULATOR
// =========================================================================
  @Transactional(readOnly = true)
  public CategoryProfitSummaryDTO calculateCalFundProfits() {
    log.info("Calculating profit metrics for CAL Unit Trust Funds");

    try {
      BigDecimal totalInvested = BigDecimal.ZERO;
      BigDecimal totalCurrentValue = BigDecimal.ZERO;
      List<ItemProfitMetricDTO> itemBreakdowns = new ArrayList<>();

      List<CalFund> funds = calFundRepository.findAll();

      if (funds != null) {
        for (CalFund fund : funds) {
          BigDecimal fundInvested = BigDecimal.ZERO;
          BigDecimal fundUnits = BigDecimal.ZERO;

          if (fund.getTransactions() != null) {
            for (CalTransaction tx : fund.getTransactions()) {
              if (tx.getType() == CalTransactionType.INVEST) {
                fundInvested = fundInvested.add(defaultZero(tx.getAmount()));
                fundUnits = fundUnits.add(defaultZero(tx.getNumberOfUnits()));
              } else if (tx.getType() == CalTransactionType.REDEEM) {
                fundInvested = fundInvested.subtract(defaultZero(tx.getAmount()));
                fundUnits = fundUnits.subtract(defaultZero(tx.getNumberOfUnits()));
              }
            }
          }

          BigDecimal navPrice = defaultZero(fund.getCurrentValue());
          BigDecimal fundCurrentVal = navPrice.multiply(fundUnits).setScale(SCALE, ROUNDING);
          BigDecimal fundProfit = fundCurrentVal.subtract(fundInvested);
          BigDecimal fundProfitPercent = calculatePercentage(fundProfit, fundInvested);

          totalInvested = totalInvested.add(fundInvested);
          totalCurrentValue = totalCurrentValue.add(fundCurrentVal);

          itemBreakdowns.add(new ItemProfitMetricDTO(
              fund.getId(),
              fund.getName(),
              fundInvested,
              fundCurrentVal,
              fundProfit,
              fundProfitPercent
          ));
        }
      }

      BigDecimal totalProfit = totalCurrentValue.subtract(totalInvested);
      BigDecimal totalProfitPercent = calculatePercentage(totalProfit, totalInvested);

      return new CategoryProfitSummaryDTO(
          "CAL_UNIT_TRUST",
          totalInvested,
          totalCurrentValue,
          totalProfit,
          totalProfitPercent,
          itemBreakdowns
      );

    } catch (Exception ex) {
      log.error("Failed to calculate CAL fund profit metrics: {}", ex.getMessage(), ex);

      // Safe fallback response: Prevents dashboard/UI breakage
      return new CategoryProfitSummaryDTO(
          "CAL_UNIT_TRUST",
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          Collections.emptyList()
      );
    }
  }

  // =========================================================================
// 3. CRYPTO SPOT ASSET PROFIT CALCULATOR
// =========================================================================
  @Transactional(readOnly = true)
  public CategoryProfitSummaryDTO calculateSpotProfits() {
    log.info("Calculating profit metrics for Crypto Spot Assets");

    try {
      BigDecimal totalInvested = BigDecimal.ZERO;
      BigDecimal totalCurrentValue = BigDecimal.ZERO;
      List<ItemProfitMetricDTO> itemBreakdowns = new ArrayList<>();

      List<SpotAsset> spotAssets = spotAssetRepository.findAll();

      if (spotAssets != null) {
        for (SpotAsset asset : spotAssets) {
          BigDecimal totalBuyQty = BigDecimal.ZERO;
          BigDecimal totalBuyCost = BigDecimal.ZERO;

          if (asset.getTransactions() != null) {
            for (SpotTransaction tx : asset.getTransactions()) {
              if ("BUY".equalsIgnoreCase(tx.getType())) {
                totalBuyQty = totalBuyQty.add(defaultZero(tx.getQuantity()));
                totalBuyCost = totalBuyCost.add(defaultZero(tx.getInvestAmount()));
              }
            }
          }

          BigDecimal avgPrice = totalBuyQty.compareTo(BigDecimal.ZERO) > 0
              ? totalBuyCost.divide(totalBuyQty, SCALE, ROUNDING)
              : BigDecimal.ZERO;

          BigDecimal currentQty = defaultZero(asset.getTotalQuantity());
          BigDecimal currentHoldingCost = currentQty.multiply(avgPrice).setScale(SCALE, ROUNDING);
          BigDecimal marketPrice = defaultZero(asset.getCurrentPrice());
          BigDecimal marketValue = currentQty.multiply(marketPrice).setScale(SCALE, ROUNDING);

          BigDecimal profit = marketValue.subtract(currentHoldingCost);
          BigDecimal profitPercent = calculatePercentage(profit, currentHoldingCost);

          totalInvested = totalInvested.add(currentHoldingCost);
          totalCurrentValue = totalCurrentValue.add(marketValue);

          itemBreakdowns.add(new ItemProfitMetricDTO(
              asset.getId(),
              asset.getCoin(),
              currentHoldingCost,
              marketValue,
              profit,
              profitPercent
          ));
        }
      }

      BigDecimal totalProfit = totalCurrentValue.subtract(totalInvested);
      BigDecimal totalProfitPercent = calculatePercentage(totalProfit, totalInvested);

      return new CategoryProfitSummaryDTO(
          "CRYPTO_SPOT",
          totalInvested,
          totalCurrentValue,
          totalProfit,
          totalProfitPercent,
          itemBreakdowns
      );

    } catch (Exception ex) {
      log.error("Failed to calculate crypto spot profit metrics: {}", ex.getMessage(), ex);

      return new CategoryProfitSummaryDTO(
          "CRYPTO_SPOT",
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          Collections.emptyList()
      );
    }
  }

  // =========================================================================
// 4. STOCK MARKET (CSE) PROFIT CALCULATOR
// =========================================================================
  @Transactional(readOnly = true)
  public CategoryProfitSummaryDTO calculateStockProfits() {
    log.info("Calculating profit metrics for Stock Market (CSE)");

    try {
      BigDecimal totalInvested = BigDecimal.ZERO;
      BigDecimal totalCurrentValue = BigDecimal.ZERO;
      List<ItemProfitMetricDTO> itemBreakdowns = new ArrayList<>();

      List<InvestmentCompany> companies = investmentCompanyRepository.findAll();

      if (companies != null) {
        for (InvestmentCompany company : companies) {
          BigDecimal totalActiveShares = BigDecimal.ZERO;
          BigDecimal totalSharesBought = BigDecimal.ZERO;
          BigDecimal totalCostOfBuys = BigDecimal.ZERO;

          if (company.getTransactions() != null) {
            for (TradeTransaction trade : company.getTransactions()) {
              if (trade.getType() == StockTransactionSide.BUY) {
                totalActiveShares = totalActiveShares.add(defaultZero(trade.getQuantity()));
                totalSharesBought = totalSharesBought.add(defaultZero(trade.getQuantity()));
                totalCostOfBuys = totalCostOfBuys.add(defaultZero(trade.getInvestmentAmount()));
              } else if (trade.getType() == StockTransactionSide.SELL) {
                totalActiveShares = totalActiveShares.subtract(defaultZero(trade.getQuantity()));
              }
            }
          }

          if (totalActiveShares.compareTo(BigDecimal.ZERO) < 0) {
            totalActiveShares = BigDecimal.ZERO;
          }

          BigDecimal avgCost = totalSharesBought.compareTo(BigDecimal.ZERO) > 0
              ? totalCostOfBuys.divide(totalSharesBought, SCALE, ROUNDING)
              : BigDecimal.ZERO;

          BigDecimal currentPrice = defaultZero(company.getCurrentPrice());
          BigDecimal investedAmount = avgCost.multiply(totalActiveShares).setScale(SCALE, ROUNDING);
          BigDecimal marketValue = currentPrice.multiply(totalActiveShares).setScale(SCALE, ROUNDING);

          BigDecimal profit = marketValue.subtract(investedAmount);
          BigDecimal profitPercent = calculatePercentage(profit, investedAmount);

          totalInvested = totalInvested.add(investedAmount);
          totalCurrentValue = totalCurrentValue.add(marketValue);

          itemBreakdowns.add(new ItemProfitMetricDTO(
              company.getId(),
              company.getSymbol(),
              investedAmount,
              marketValue,
              profit,
              profitPercent
          ));
        }
      }

      BigDecimal totalProfit = totalCurrentValue.subtract(totalInvested);
      BigDecimal totalProfitPercent = calculatePercentage(totalProfit, totalInvested);

      return new CategoryProfitSummaryDTO(
          "STOCK_MARKET",
          totalInvested,
          totalCurrentValue,
          totalProfit,
          totalProfitPercent,
          itemBreakdowns
      );

    } catch (Exception ex) {
      log.error("Failed to calculate stock market profit metrics: {}", ex.getMessage(), ex);

      return new CategoryProfitSummaryDTO(
          "STOCK_MARKET",
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          Collections.emptyList()
      );
    }
  }

  // =========================================================================
// 5. FUTURES TRADING PROFIT CALCULATOR (Realized PnL vs Margin)
// =========================================================================
  @Transactional(readOnly = true)
  public CategoryProfitSummaryDTO calculateFuturesProfits() {
    log.info("Calculating profit metrics for Futures Positions");

    try {
      BigDecimal totalMarginCommitted = BigDecimal.ZERO;
      BigDecimal totalRealizedPnl = BigDecimal.ZERO;
      List<ItemProfitMetricDTO> itemBreakdowns = new ArrayList<>();

      List<FuturesPosition> positions = futuresRepository.findAll();

      if (positions != null) {
        for (FuturesPosition pos : positions) {
          BigDecimal margin = defaultZero(pos.getMargin());
          BigDecimal pnl = defaultZero(pos.getRealizedPnl());
          BigDecimal pnlPercent = calculatePercentage(pnl, margin);

          totalMarginCommitted = totalMarginCommitted.add(margin);
          totalRealizedPnl = totalRealizedPnl.add(pnl);

          itemBreakdowns.add(new ItemProfitMetricDTO(
              pos.getId(),
              pos.getCoinPair() + " (" + pos.getPositionType() + ")",
              margin,
              margin.add(pnl),
              pnl,
              pnlPercent
          ));
        }
      }

      BigDecimal totalPnlPercent = calculatePercentage(totalRealizedPnl, totalMarginCommitted);

      return new CategoryProfitSummaryDTO(
          "FUTURES",
          totalMarginCommitted,
          totalMarginCommitted.add(totalRealizedPnl),
          totalRealizedPnl,
          totalPnlPercent,
          itemBreakdowns
      );

    } catch (Exception ex) {
      log.error("Failed to calculate futures profit metrics: {}", ex.getMessage(), ex);

      return new CategoryProfitSummaryDTO(
          "FUTURES",
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          BigDecimal.ZERO,
          Collections.emptyList()
      );
    }
  }
  // =========================================================================
  // HELPER METHODS
  // =========================================================================
  private BigDecimal calculatePercentage(BigDecimal profit, BigDecimal base) {
    if (base == null || base.compareTo(BigDecimal.ZERO) == 0) {
      return BigDecimal.ZERO;
    }
    return profit.divide(base, SCALE, ROUNDING)
        .multiply(HUNDRED)
        .setScale(2, ROUNDING);
  }

  private BigDecimal defaultZero(BigDecimal value) {
    return value != null ? value : BigDecimal.ZERO;
  }

}
