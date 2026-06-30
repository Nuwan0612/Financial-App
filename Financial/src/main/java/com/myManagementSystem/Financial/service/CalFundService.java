package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.CalFundRequestDTO;
import com.myManagementSystem.Financial.dto.CalFundResponseDTO;
import com.myManagementSystem.Financial.entity.Account;
import com.myManagementSystem.Financial.entity.Bucket;
import com.myManagementSystem.Financial.entity.CalFund;
import com.myManagementSystem.Financial.entity.CalTransaction;
import com.myManagementSystem.Financial.enums.CalTransactionType;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.AccountRepository;
import com.myManagementSystem.Financial.repository.BucketRepository;
import com.myManagementSystem.Financial.repository.CalFundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalFundService {

    private final CalFundRepository calFundRepository;
    private final AccountRepository accountRepository;
    private final BucketRepository bucketRepository;

    @Transactional
    public CalFundResponseDTO createFund(CalFundRequestDTO dto) {
        log.info("Creating new CAL Fund: {}", dto.name());

        Account account = accountRepository.findById(dto.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Bucket bucket = bucketRepository.findById(dto.bucketId())
                .orElseThrow(() -> new ResourceNotFoundException("Bucket not found"));

        CalFund fund = CalFund.builder()
                .name(dto.name())
                .category(dto.category())
                .currentValue(BigDecimal.ZERO)
                .isActive(true)
                .account(account)
                .bucket(bucket)
                .build();

        return mapToDTO(calFundRepository.save(fund));
    }

    // This is where compound profit is captured and applied to your total wealth
    @Transactional
    public CalFundResponseDTO updateFundEarnings(Long fundId, BigDecimal newValue) {
        log.info("Updating earnings for CAL Fund ID: {}", fundId);

        CalFund fund = calFundRepository.findById(fundId)
                .orElseThrow(() -> new ResourceNotFoundException("Fund not found"));

        // Calculate the profit (New Value - Old Value)
        BigDecimal profit = newValue.subtract(fund.getCurrentValue());

        // Update the Fund's current value
        fund.setCurrentValue(newValue);

        // Add the profit to the Account to increase total wealth
        Account account = fund.getAccount();
        account.setCurrentBalance(account.getCurrentBalance().add(profit));

        accountRepository.save(account);
        return mapToDTO(calFundRepository.save(fund));
    }

    public List<CalFundResponseDTO> getActiveFunds() {
        return calFundRepository.findByIsActiveTrue().stream().map(this::mapToDTO).toList();
    }

    public CalFundResponseDTO getFundById(Long id) {
        CalFund fund = calFundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fund not found"));
        return mapToDTO(fund);
    }

    // Dynamic Calculator
    private CalFundResponseDTO mapToDTO(CalFund fund) {
        BigDecimal totalInvested = BigDecimal.ZERO;

        if (fund.getTransactions() != null) {
            for (CalTransaction tx : fund.getTransactions()) {
                if (tx.getType() == CalTransactionType.INVEST) {
                    totalInvested = totalInvested.add(tx.getAmount());
                } else if (tx.getType() == CalTransactionType.REDEEM) {
                    totalInvested = totalInvested.subtract(tx.getAmount());
                }
            }
        }

        BigDecimal currentValue = fund.getCurrentValue() != null ? fund.getCurrentValue() : BigDecimal.ZERO;
        BigDecimal totalProfit = currentValue.subtract(totalInvested);

        return new CalFundResponseDTO(
                fund.getId(),
                fund.getName(),
                fund.getCategory(),
                currentValue,
                fund.getIsActive(),
                fund.getAccount().getId(),
                fund.getBucket().getId(),
                totalInvested,
                totalProfit
        );
    }
}