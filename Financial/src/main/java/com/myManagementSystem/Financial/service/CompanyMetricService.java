package com.myManagementSystem.Financial.service;

import com.myManagementSystem.Financial.dto.CompanyMetricRequestDTO;
import com.myManagementSystem.Financial.dto.CompanyMetricResponseDTO;
import com.myManagementSystem.Financial.entity.CompanyMetric;
import com.myManagementSystem.Financial.entity.InvestmentCompany;
import com.myManagementSystem.Financial.exception.ResourceNotFoundException;
import com.myManagementSystem.Financial.repository.CompanyMetricRepository;
import com.myManagementSystem.Financial.repository.InvestmentCompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyMetricService {

  private final CompanyMetricRepository metricRepository;
  private final InvestmentCompanyRepository companyRepository;

  public CompanyMetricResponseDTO getMetricByCompanyId(Long companyId) {
    CompanyMetric metric = metricRepository.findByCompanyId(companyId)
        .orElseThrow(() -> new ResourceNotFoundException("No metrics found for company ID: " + companyId));
    return mapToDTO(metric, companyId);
  }

  @Transactional
  public CompanyMetricResponseDTO saveOrUpdateMetric(Long companyId, CompanyMetricRequestDTO dto) {
    InvestmentCompany company = companyRepository.findById(companyId)
        .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));

    CompanyMetric metric = company.getMetric();

    if (metric == null) {
      metric = new CompanyMetric();
    }

    metric.setIsDividendPaying(dto.isDividendPaying());
    metric.setPeRatio(dto.peRatio());
    metric.setEps(dto.eps());

    metric = metricRepository.save(metric);

    // If this is a new metric, link it to the company and save
    if (company.getMetric() == null) {
      company.setMetric(metric);
      companyRepository.save(company);
    }

    return mapToDTO(metric, companyId);
  }

  private CompanyMetricResponseDTO mapToDTO(CompanyMetric metric, Long companyId) {
    return new CompanyMetricResponseDTO(
        metric.getId(),
        companyId,
        metric.getIsDividendPaying(),
        metric.getPeRatio(),
        metric.getEps()
    );
  }
}
