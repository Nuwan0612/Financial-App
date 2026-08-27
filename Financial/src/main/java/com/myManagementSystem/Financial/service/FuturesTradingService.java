package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.FuturesJournalRequestDTO;
import com.myManagementSystem.Financial.dto.FuturesJournalResponseDTO;
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

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FuturesTradingService {

    private final FuturesPositionRepository futuresRepository;
    private final AccountRepository accountRepository;
    private final BucketRepository bucketRepository;

    @Transactional
    public FuturesJournalResponseDTO futuresJournal(FuturesJournalRequestDTO request) {
        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Bucket bucket = bucketRepository.findById(request.bucketId())
                .orElseThrow(() -> new ResourceNotFoundException("Bucket not found"));

        if (bucket.getCurrentAmount().compareTo(request.margin()) < 0) {
            throw new IllegalStateException("Insufficient Buying Power to cover Futures Margin.");
        }

        // Lock the margin from available buying power
        bucket.setCurrentAmount(bucket.getCurrentAmount().add(request.pnl()));

        FuturesPosition position = FuturesPosition.builder()
                .coinPair(request.coinPair())
                .positionType(request.positionType().toUpperCase())
                .leverage(request.leverage())
                .margin(request.margin())
                .openDate(request.openDate())
                .closeDate(request.closeDate())
                .account(account)
                .bucket(bucket)
                .realizedPnl(request.pnl())
                .ss_path(request.ss_path())
                .notes(request.notes())
                .build();

        bucketRepository.save(bucket);
        return mapToDTO(futuresRepository.save(position));
    }

    public List<FuturesJournalResponseDTO> getFuturesJournal(Long accountId){
        List<FuturesPosition> positions = futuresRepository.findByAccountId(accountId);

        return positions.stream()
            .map(this::mapToDTO)
            .toList();
    }

    private FuturesJournalResponseDTO mapToDTO(FuturesPosition position) {
        return new FuturesJournalResponseDTO(
                position.getId(),
                position.getCoinPair(),
                position.getPositionType(),
                position.getLeverage(),
                position.getMargin(),
                position.getRealizedPnl(),
                position.getOpenDate(),
                position.getCloseDate(),
                position.getSs_path(),
                position.getNotes()
        );
    }
}