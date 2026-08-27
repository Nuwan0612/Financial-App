package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.*;
import com.myManagementSystem.Financial.entity.Account;
import com.myManagementSystem.Financial.entity.Bucket;
import com.myManagementSystem.Financial.entity.SpotAsset;
import com.myManagementSystem.Financial.entity.SpotTransaction;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AccountRepository;
import com.myManagementSystem.Financial.repository.BucketRepository;
import com.myManagementSystem.Financial.repository.SpotAssetRepository;
import com.myManagementSystem.Financial.repository.SpotTransactionRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class SpotTradingService {

    private final SpotAssetRepository spotAssetRepository;
    private final SpotTransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final BucketRepository bucketRepository;

    @Transactional
    public SpotTransactionResponseDTO executeSpotTrade(SpotTransactionRequestDTO request) {
        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Bucket bucket = bucketRepository.findById(request.bucketId())
                .orElseThrow(() -> new ResourceNotFoundException("Bucket not found"));

//        BigDecimal totalUsdtValue = request.amount().multiply(request.executionPrice());

        SpotAsset asset = spotAssetRepository.findByCoin(request.coin())
                .orElse(SpotAsset.builder()
                        .coin(request.coin())
                        .totalQuantity(BigDecimal.ZERO)
                        .currentPrice(request.executionPrice())
                        .account(account)
                        .bucket(bucket)
                        .transactions(new ArrayList<>()) // <-- Add this line
                        .build());

        if (request.type().equalsIgnoreCase("BUY")) {
            if (bucket.getCurrentAmount().compareTo(request.amount()) < 0) {
                throw new IllegalStateException("Insufficient Buying Power to execute spot buy.");
            }
            // Cash leaves bucket, enters asset state. Total Account wealth remains unchanged.
            bucket.setCurrentAmount(bucket.getCurrentAmount().subtract(request.amount()));
            asset.setTotalQuantity(asset.getTotalQuantity().add(request.quantity()));

        } else if (request.type().equalsIgnoreCase("SELL")) {
            if (asset.getTotalQuantity().compareTo(request.quantity()) < 0) {
                throw new IllegalStateException("Insufficient Coin quantity to sell.");
            }
            // Asset liquidated, cash returns to bucket.
            bucket.setCurrentAmount(bucket.getCurrentAmount().add(request.amount()));
            asset.setTotalQuantity(asset.getTotalQuantity().subtract(request.quantity()));
        }

        asset.setCurrentPrice(request.executionPrice());

        SpotTransaction transaction = SpotTransaction.builder()
                .type(request.type().toUpperCase())
                .quantity(request.quantity())
                .investAmount(request.amount())
                .executionPrice(request.executionPrice())
                .transactionDate(LocalDateTime.now())
                .spotAsset(asset)
                .build();

        bucketRepository.save(bucket);
        SpotAsset savedAsset = spotAssetRepository.save(asset);
        savedAsset.getTransactions().add(transaction);
        transactionRepository.save(transaction);
        log.info("Executed SPOT {} for {} on Account {}", request.type(), request.coin(), account.getId());

        return mapToDTO(savedAsset);
    }

    // Add this to your existing SpotTradingService
    @Transactional(readOnly = true)
    public List<SpotTransactionResponseDTO> getSpotAssetsByAccount(Long accountId) {
        List<SpotAsset> assets = spotAssetRepository.findByAccountId(accountId);

        // Filter out assets where the user has sold everything (quantity == 0)
        return assets.stream()
            .filter(asset -> asset.getTotalQuantity().compareTo(BigDecimal.ZERO) > 0)
            .map(this::mapToDTO)
            .toList();
    }

    @Transactional
    public BinanceFundTransferResponseDTO transferFundWithinAccounts(BinanceFundTransferRequestDTO request){
        Bucket fromAccountBucket = bucketRepository.findById(request.fromAccountId())
            .orElseThrow(() -> new ResourceNotFoundException("From Bucket not found"));

        Bucket toAccountBucket = bucketRepository.findById(request.toAccountId())
            .orElseThrow(() -> new ResourceNotFoundException("To Bucket not found"));

        BigDecimal fromAccountCurrentValue = fromAccountBucket.getCurrentAmount().subtract(request.amount());
        BigDecimal toAccountCurrentValue = toAccountBucket.getCurrentAmount().add(request.amount());

        fromAccountBucket.setCurrentAmount(fromAccountCurrentValue);
        toAccountBucket.setCurrentAmount(toAccountCurrentValue);

        bucketRepository.save(fromAccountBucket);
        bucketRepository.save(toAccountBucket);

        return new BinanceFundTransferResponseDTO(
            fromAccountBucket.getId(),
            fromAccountCurrentValue,
            toAccountBucket.getId(),
            toAccountCurrentValue
        );
    }

    private SpotTransactionResponseDTO mapToDTO(SpotAsset asset) {
        BigDecimal totalBuyQuantity = BigDecimal.ZERO;
        BigDecimal totalBuyCost = BigDecimal.ZERO;
        List<SpotTransactionDTO> transactionDTOs = new ArrayList<>();

        if (asset.getTransactions() != null) {
            for (SpotTransaction tx : asset.getTransactions()) {
                // Map the transaction
                transactionDTOs.add(new SpotTransactionDTO(
                        tx.getId(),
                        tx.getType(),
                        tx.getQuantity(),
                        tx.getExecutionPrice(),
                        tx.getInvestAmount(),
                        tx.getTransactionDate()
                ));

                // Only BUYs affect the average cost basis
                if ("BUY".equalsIgnoreCase(tx.getType())) {
                    totalBuyQuantity = totalBuyQuantity.add(tx.getQuantity());
                    totalBuyCost = totalBuyCost.add(tx.getInvestAmount());
                }
            }
        }

        // Sort transactions newest to oldest for the frontend expanded row
        transactionDTOs.sort(Comparator.comparing(SpotTransactionDTO::transactionDate).reversed());

        // Calculate Average Buy Price
        BigDecimal avgPrice = BigDecimal.ZERO;
        if (totalBuyQuantity.compareTo(BigDecimal.ZERO) > 0) {
            avgPrice = totalBuyCost.divide(totalBuyQuantity, 4, RoundingMode.HALF_UP);
        }

        // Calculate Total Invested (Current Holdings * Average Buy Price)
        BigDecimal totalInvested = asset.getTotalQuantity().multiply(avgPrice).setScale(4, RoundingMode.HALF_UP);

        return new SpotTransactionResponseDTO(
                asset.getId(),
                asset.getCoin(),
                asset.getTotalQuantity(),
                asset.getCurrentPrice(),
                avgPrice,
                totalInvested,
                asset.getAccount().getId(),
                asset.getBucket().getId(),
                transactionDTOs
        );
    }
}