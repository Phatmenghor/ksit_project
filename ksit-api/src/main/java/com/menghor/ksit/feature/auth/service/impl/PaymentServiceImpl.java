package com.menghor.ksit.feature.auth.service.impl;

import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.auth.dto.filter.PaymentFilterDto;
import com.menghor.ksit.feature.auth.dto.request.PaymentCreateDTO;
import com.menghor.ksit.feature.auth.dto.resposne.PaymentResponseDTO;
import com.menghor.ksit.feature.auth.dto.update.PaymentUpdateDto;
import com.menghor.ksit.feature.auth.mapper.PaymentMapper;
import com.menghor.ksit.feature.auth.models.PaymentEntity;
import com.menghor.ksit.feature.auth.repository.PaymentRepository;
import com.menghor.ksit.feature.auth.service.PaymentService;
import com.menghor.ksit.feature.auth.specification.PaymentSpecification;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import com.menghor.ksit.utils.pagiantion.PaginationUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    @Override
    public PaymentResponseDTO createPayment(PaymentCreateDTO createDTO) {
        log.info("Creating payment for userId={}", createDTO.getUserId());
        PaymentEntity payment = paymentMapper.toEntity(createDTO);
        PaymentEntity savedPayment = paymentRepository.save(payment);
        log.info("Payment created successfully. id={}", savedPayment.getId());
        return paymentMapper.toResponseDto(savedPayment);
    }

    @Override
    public PaymentResponseDTO updatePayment(Long id, PaymentUpdateDto updateDTO) {
        log.info("Updating payment id={}", id);
        PaymentEntity payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + id));
        paymentMapper.updateEntityFromDto(updateDTO, payment);
        PaymentEntity updatedPayment = paymentRepository.save(payment);
        log.info("Payment id={} updated successfully", id);
        return paymentMapper.toResponseDto(updatedPayment);
    }

    @Override
    @Transactional()
    public PaymentResponseDTO getPaymentById(Long id) {
        log.info("Fetching payment id={}", id);
        PaymentEntity payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + id));
        return paymentMapper.toResponseDto(payment);
    }

    @Override
    @Transactional()
    public CustomPaginationResponseDto<PaymentResponseDTO> getAllPayments(PaymentFilterDto filterDto) {
        log.info("Fetching all payments");
        Pageable pageable = PaginationUtils.createPageable(
                filterDto.getPageNo(),
                filterDto.getPageSize(),
                "createdAt",
                "DESC"
        );

        Specification<PaymentEntity> spec = PaymentSpecification.combine(
                filterDto.getSearch(),
                filterDto.getType(),
                filterDto.getStatus(),
                filterDto.getUserId()
        );

        Page<PaymentEntity> paymentPage = paymentRepository.findAll(spec, pageable);

        paymentPage.getContent().forEach(payment -> {
            if (payment.getStatus() == null) {
                payment.setStatus(Status.ACTIVE);
                paymentRepository.save(payment);
            }
        });

        return paymentMapper.toPaymentAllResponseDto(paymentPage);
    }

    @Override
    public PaymentResponseDTO deletePayment(Long id) {
        log.info("Deleting payment id={}", id);
        PaymentEntity payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + id));
        payment.setStatus(Status.DELETED);
        payment = paymentRepository.save(payment);
        log.info("Payment id={} deleted successfully", id);
        return paymentMapper.toResponseDto(payment);
    }

}