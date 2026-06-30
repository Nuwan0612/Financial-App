package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.CalTransactionRequestDTO;
import com.myManagementSystem.Financial.dto.CalTransactionResponseDTO;
import com.myManagementSystem.Financial.entity.Account;
import com.myManagementSystem.Financial.entity.Bucket;
import com.myManagementSystem.Financial.entity.CalFund;
import com.myManagementSystem.Financial.entity.CalTransaction;
import com.myManagementSystem.Financial.enums.CalTransactionType;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AccountRepository;
import com.myManagementSystem.Financial.repository.BucketRepository;
import com.myManagementSystem.Financial.repository.CalFundRepository;
import com.myManagementSystem.Financial.repository.CalTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalTransactionService {

    private final CalTransactionRepository transactionRepository;
    private final CalFundRepository fundRepository;
    private final BucketRepository bucketRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public CalTransactionResponseDTO createTransaction(CalTransactionRequestDTO request) {
        log.info("Processing {} for CAL Fund ID: {}", request.type(), request.calFundId());

        CalFund fund = fundRepository.findById(request.calFundId())
                .orElseThrow(() -> new ResourceNotFoundException("Fund not found"));

        Bucket bucket = fund.getBucket();
        Account account = fund.getAccount(); // <-- FETCH THE LINKED ACCOUNT

        if (request.type() == CalTransactionType.INVEST) {
            // Money goes into the fund, invested capital goes up
            fund.setCurrentValue(fund.getCurrentValue().add(request.amount()));

        } else if (request.type() == CalTransactionType.REDEEM) {
            // 1. Security Check: Prevent over-redemption based on actual Fund value
            if (request.amount().compareTo(fund.getCurrentValue()) > 0) {
                throw new IllegalArgumentException("Insufficient funds: Cannot redeem more than the current fund value.");
            }

            // 2. Fund Value goes DOWN
            fund.setCurrentValue(fund.getCurrentValue().subtract(request.amount()));

            // 3. Total Portfolio Value (Account) goes DOWN
            account.setCurrentBalance(account.getCurrentBalance().subtract(request.amount()));

            // 4. Invested Capital (Bucket) goes DOWN (Floored at zero to handle profit withdrawals)
            BigDecimal newBucketAmount = bucket.getCurrentAmount().subtract(request.amount());
            if (newBucketAmount.compareTo(BigDecimal.ZERO) < 0) {
                newBucketAmount = BigDecimal.ZERO; // Principal is fully withdrawn, the rest is profit
            }
            bucket.setCurrentAmount(newBucketAmount);

            // Check for total redemption to hide from active dashboard
//            if (fund.getCurrentValue().compareTo(BigDecimal.ZERO) <= 0) {
//                fund.setIsActive(false);
//                fund.setCurrentValue(BigDecimal.ZERO);
//            }
        }

        // Save all three updated entities
        bucketRepository.save(bucket);
        accountRepository.save(account); // <-- SAVE THE ACCOUNT
        fundRepository.save(fund);

        CalTransaction transaction = CalTransaction.builder()
                .type(request.type())
                .amount(request.amount())
                .transactionDate(LocalDateTime.now())
                .calFund(fund)
                .build();

        return mapToDTO(transactionRepository.save(transaction));
    }

    public List<CalTransactionResponseDTO> getTransactionsByFundId(Long fundId) {
        return transactionRepository.findByCalFundIdOrderByTransactionDateDesc(fundId)
                .stream().map(this::mapToDTO).toList();
    }

    private CalTransactionResponseDTO mapToDTO(CalTransaction tx) {
        return new CalTransactionResponseDTO(
                tx.getId(),
                tx.getCalFund().getId(),
                tx.getCalFund().getName(),
                tx.getType(),
                tx.getAmount(),
                tx.getTransactionDate()
        );
    }
}