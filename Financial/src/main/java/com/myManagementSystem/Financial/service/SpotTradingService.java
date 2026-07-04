package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.SpotTransactionRequestDTO;
import com.myManagementSystem.Financial.entity.Account;
import com.myManagementSystem.Financial.entity.Bucket;
import com.myManagementSystem.Financial.entity.SpotAsset;
import com.myManagementSystem.Financial.entity.SpotTransaction;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AccountRepository;
import com.myManagementSystem.Financial.repository.BucketRepository;
import com.myManagementSystem.Financial.repository.SpotAssetRepository;
import com.myManagementSystem.Financial.repository.SpotTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpotTradingService {

    private final SpotAssetRepository spotAssetRepository;
    private final SpotTransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final BucketRepository bucketRepository;

    @Transactional
    public void executeSpotTrade(SpotTransactionRequestDTO request) {
        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Bucket bucket = bucketRepository.findById(request.bucketId())
                .orElseThrow(() -> new ResourceNotFoundException("Bucket not found"));

        BigDecimal totalUsdtValue = request.amount().multiply(request.executionPrice());

        SpotAsset asset = spotAssetRepository.findByAccountIdAndCoin(account.getId(), request.coin())
                .orElse(SpotAsset.builder()
                        .coin(request.coin())
                        .totalAmount(BigDecimal.ZERO)
                        .currentPrice(request.executionPrice())
                        .account(account)
                        .bucket(bucket)
                        .build());

        if (request.type().equalsIgnoreCase("BUY")) {
            if (bucket.getCurrentAmount().compareTo(totalUsdtValue) < 0) {
                throw new IllegalStateException("Insufficient Buying Power to execute spot buy.");
            }
            // Cash leaves bucket, enters asset state. Total Account wealth remains unchanged.
            bucket.setCurrentAmount(bucket.getCurrentAmount().subtract(totalUsdtValue));
            asset.setTotalAmount(asset.getTotalAmount().add(request.amount()));

        } else if (request.type().equalsIgnoreCase("SELL")) {
            if (asset.getTotalAmount().compareTo(request.amount()) < 0) {
                throw new IllegalStateException("Insufficient Coin quantity to sell.");
            }
            // Asset liquidated, cash returns to bucket.
            bucket.setCurrentAmount(bucket.getCurrentAmount().add(totalUsdtValue));
            asset.setTotalAmount(asset.getTotalAmount().subtract(request.amount()));
        }

        asset.setCurrentPrice(request.executionPrice());

        SpotTransaction transaction = SpotTransaction.builder()
                .type(request.type().toUpperCase())
                .amount(request.amount())
                .executionPrice(request.executionPrice())
                .transactionDate(LocalDateTime.now())
                .spotAsset(asset)
                .build();

        bucketRepository.save(bucket);
        spotAssetRepository.save(asset);
        transactionRepository.save(transaction);
        log.info("Executed SPOT {} for {} on Account {}", request.type(), request.coin(), account.getId());
    }
}