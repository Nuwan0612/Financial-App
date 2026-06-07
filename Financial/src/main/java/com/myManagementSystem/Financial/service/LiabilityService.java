package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.LiabilityPaymentRequestDTO;
import com.myManagementSystem.Financial.dto.LiabilityPaymentResponseDTO;
import com.myManagementSystem.Financial.dto.LiabilityRequestDTO;
import com.myManagementSystem.Financial.dto.LiabilityResponseDTO;
import com.myManagementSystem.Financial.entity.Liability;
import com.myManagementSystem.Financial.entity.LiabilityPayment;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.LiabilityPaymentsRepository;
import com.myManagementSystem.Financial.repository.LiabilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LiabilityService {

  private final LiabilityRepository liabilityRepository;
  private final LiabilityPaymentsRepository liabilityPaymentRepository;

  public LiabilityResponseDTO createLiability(LiabilityRequestDTO liabilityRequestDTO) {
    log.info("Attempting to create new Liability {}", liabilityRequestDTO.name());

    Liability liability = Liability.builder()
        .name(liabilityRequestDTO.name())
        .amount(liabilityRequestDTO.amount())
        .isPaid(liabilityRequestDTO.isPaid() != null ? liabilityRequestDTO.isPaid() : false)
        .borrowed(liabilityRequestDTO.borrowed())
        .completed(liabilityRequestDTO.completed())
        .payments(new ArrayList<>())
        .build();

    Liability savedLiability = liabilityRepository.save(liability);
    log.info("Successfully saved Liability with ID {}", savedLiability.getId());
    return mapToDTO(savedLiability);
  }

  public List<LiabilityResponseDTO> getAllLiabilities() {
    log.info("Attempting to get all Liabilities from database");
    return liabilityRepository.findAll()
        .stream()
        .map(this::mapToDTO)
        .toList();
  }

  public LiabilityResponseDTO getLiabilityById(Long id) {
    log.info("Attempting to get Liability by ID {}", id);
    Liability liability = liabilityRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Liability with ID " + id + " not found"));
    return mapToDTO(liability);
  }

  public LiabilityResponseDTO updateLiabilityById(Long id, LiabilityRequestDTO liabilityRequestDTO) {
    log.info("Attempting to update Liability by ID {}", id);
    Liability existingLiability = liabilityRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Liability with ID " + id + " not found"));

    existingLiability.setName(liabilityRequestDTO.name());
    existingLiability.setAmount(liabilityRequestDTO.amount());
    existingLiability.setIsPaid(liabilityRequestDTO.isPaid());
    existingLiability.setBorrowed(liabilityRequestDTO.borrowed());
    existingLiability.setCompleted(liabilityRequestDTO.completed());

    Liability updatedLiability = liabilityRepository.save(existingLiability);
    return mapToDTO(updatedLiability);
  }

  public void deleteLiabilityById(Long id) {
    log.info("Attempting to delete Liability by ID {}", id);
    if (!liabilityRepository.existsById(id)) {
      throw new ResourceNotFoundException("Liability with ID " + id + " not found");
    }
    liabilityRepository.deleteById(id);
  }


  @Transactional
  public LiabilityResponseDTO addPaymentToLiability(Long liabilityId, LiabilityPaymentRequestDTO paymentDTO) {
    log.info("Adding payment of {} to Liability ID {}", paymentDTO.amountPaid(), liabilityId);

    Liability liability = liabilityRepository.findById(liabilityId)
        .orElseThrow(() -> new ResourceNotFoundException("Liability with ID " + liabilityId + " not found"));

    LiabilityPayment newPayment = LiabilityPayment.builder()
        .amountPaid(paymentDTO.amountPaid())
        .paymentDate(paymentDTO.paymentDate())
        .notes(paymentDTO.notes())
        .liability(liability)
        .build();


    liability.getPayments().add(newPayment);


    BigDecimal totalPaid = liability.getPayments().stream()
        .map(LiabilityPayment::getAmountPaid)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    if (totalPaid.compareTo(liability.getAmount()) >= 0) {
      log.info("Liability ID {} is now fully paid off!", liabilityId);
      liability.setIsPaid(true);
      liability.setCompleted(paymentDTO.paymentDate());
    }

    Liability updatedLiability = liabilityRepository.save(liability);
    return mapToDTO(updatedLiability);
  }

  @Transactional
  public LiabilityResponseDTO deletePaymentFromLiability(Long liabilityId, Long paymentId) {
    log.info("Deleting payment ID {} from Liability ID {}", paymentId, liabilityId);

    Liability liability = liabilityRepository.findById(liabilityId)
        .orElseThrow(() -> new ResourceNotFoundException("Liability with ID " + liabilityId + " not found"));

    boolean removed = liability.getPayments().removeIf(payment -> payment.getId().equals(paymentId));

    if (!removed) {
      throw new ResourceNotFoundException("Payment with ID " + paymentId + " not found");
    }

    BigDecimal totalPaid = liability.getPayments().stream()
        .map(LiabilityPayment::getAmountPaid)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    if (totalPaid.compareTo(liability.getAmount()) < 0) {
      log.info("Liability ID {} balance dropped below borrowed amount. Reverting to pending.", liabilityId);
      liability.setIsPaid(false);
      liability.setCompleted(null); // Erase the completion date since it's no longer finished!
    }


    Liability updatedLiability = liabilityRepository.save(liability);
    return mapToDTO(updatedLiability);
  }

  private LiabilityResponseDTO mapToDTO(Liability liability) {
    // 1. Handle null lists just in case
    List<LiabilityPayment> payments = liability.getPayments() != null ? liability.getPayments() : new ArrayList<>();

    // 2. Calculate total paid
    BigDecimal totalPaid = payments.stream()
        .map(LiabilityPayment::getAmountPaid)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    // 3. Calculate remaining balance
    BigDecimal remainingBalance = liability.getAmount().subtract(totalPaid);

    // 4. Map payment history to DTOs
    List<LiabilityPaymentResponseDTO> paymentDTOs = payments.stream()
        .map(p -> new LiabilityPaymentResponseDTO(p.getId(), p.getAmountPaid(), p.getPaymentDate(), p.getNotes()))
        .toList();

    // 5. Return the massive, data-rich DTO back to the frontend
    return new LiabilityResponseDTO(
        liability.getId(),
        liability.getName(),
        liability.getIsPaid(),
        liability.getCompleted(),
        liability.getBorrowed(),
        liability.getAmount(),
        totalPaid, // The math we just did
        remainingBalance, // The math we just did
        paymentDTOs // The list of payments
    );
  }
  
}
