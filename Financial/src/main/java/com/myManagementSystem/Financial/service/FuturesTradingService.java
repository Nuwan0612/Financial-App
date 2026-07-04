package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.FuturesCloseRequestDTO;
import com.myManagementSystem.Financial.dto.FuturesOpenRequestDTO;
import com.myManagementSystem.Financial.dto.FuturesPositionResponseDTO;
import com.myManagementSystem.Financial.entity.Account;
import com.myManagementSystem.Financial.entity.Bucket;
import com.myManagementSystem.Financial.entity.FuturesPosition;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AccountRepository;
import com.myManagementSystem.Financial.repository.BucketRepository;
import com.myManagementSystem.Financial.repository.FuturesPositionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class FuturesTradingService {

    private final FuturesPositionRepository futuresRepository;
    private final AccountRepository accountRepository;
    private final BucketRepository bucketRepository;

    @Transactional
    public FuturesPositionResponseDTO openPosition(FuturesOpenRequestDTO request) {
        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Bucket bucket = bucketRepository.findById(request.bucketId())
                .orElseThrow(() -> new ResourceNotFoundException("Bucket not found"));

        if (bucket.getCurrentAmount().compareTo(request.margin()) < 0) {
            throw new IllegalStateException("Insufficient Buying Power to cover Futures Margin.");
        }

        // Lock the margin from available buying power
        bucket.setCurrentAmount(bucket.getCurrentAmount().subtract(request.margin()));

        FuturesPosition position = FuturesPosition.builder()
                .coinPair(request.coinPair())
                .positionType(request.positionType().toUpperCase())
                .leverage(request.leverage())
                .margin(request.margin())
                .status("OPEN")
                .openDate(LocalDateTime.now())
                .account(account)
                .bucket(bucket)
                .build();

        bucketRepository.save(bucket);
        return mapToDTO(futuresRepository.save(position));
    }

    @Transactional
    public FuturesPositionResponseDTO closePosition(Long positionId, FuturesCloseRequestDTO request) {
        FuturesPosition position = futuresRepository.findById(positionId)
                .orElseThrow(() -> new ResourceNotFoundException("Futures Position not found"));

        if ("CLOSED".equals(position.getStatus())) {
            throw new IllegalStateException("Position is already closed.");
        }

        Account account = position.getAccount();
        Bucket bucket = position.getBucket();

        // 1. Update Buying Power (Margin returns + PnL)
        BigDecimal returnedFunds = position.getMargin().add(request.realizedPnl());
        if (returnedFunds.compareTo(BigDecimal.ZERO) < 0) {
            returnedFunds = BigDecimal.ZERO; // Floor at zero to prevent negative buying power on severe liquidations
        }
        bucket.setCurrentAmount(bucket.getCurrentAmount().add(returnedFunds));

        // 2. Update Total Wealth (Net profit/loss strictly alters your total portfolio value)
        account.setCurrentBalance(account.getCurrentBalance().add(request.realizedPnl()));
        if (account.getCurrentBalance().compareTo(BigDecimal.ZERO) < 0) {
            account.setCurrentBalance(BigDecimal.ZERO);
        }

        position.setRealizedPnl(request.realizedPnl());
        position.setStatus("CLOSED");
        position.setCloseDate(LocalDateTime.now());

        bucketRepository.save(bucket);
        accountRepository.save(account);
        return mapToDTO(futuresRepository.save(position));
    }

    private FuturesPositionResponseDTO mapToDTO(FuturesPosition position) {
        return new FuturesPositionResponseDTO(
                position.getId(), position.getCoinPair(), position.getPositionType(),
                position.getLeverage(), position.getMargin(), position.getRealizedPnl(),
                position.getStatus(), position.getOpenDate(), position.getCloseDate()
        );
    }
}