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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    @Override
    public PaymentResponseDTO createPayment(PaymentCreateDTO createDTO) {

        PaymentEntity payment = paymentMapper.toEntity(createDTO);
        PaymentEntity savedPayment = paymentRepository.save(payment);

        return paymentMapper.toResponseDto(savedPayment);
    }

    @Override
    public PaymentResponseDTO updatePayment(Long id, PaymentUpdateDto updateDTO) {

        PaymentEntity payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + id));

        paymentMapper.updateEntityFromDto(updateDTO, payment);
        PaymentEntity updatedPayment = paymentRepository.save(payment);

        return paymentMapper.toResponseDto(updatedPayment);
    }

    @Override
    @Transactional()
    public PaymentResponseDTO getPaymentById(Long id) {

        PaymentEntity payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + id));

        return paymentMapper.toResponseDto(payment);
    }

    @Override
    @Transactional()
    public CustomPaginationResponseDto<PaymentResponseDTO> getAllPayments(PaymentFilterDto filterDto) {

        // Validate and prepare pagination using PaginationUtils
        Pageable pageable = PaginationUtils.createPageable(
                filterDto.getPageNo(),
                filterDto.getPageSize(),
                "createdAt",
                "DESC"
        );

        // Create specification from filter criteria
        Specification<PaymentEntity> spec = PaymentSpecification.combine(
                filterDto.getSearch(),
                filterDto.getType(),
                filterDto.getStatus(),
                filterDto.getUserId()
        );

        // Execute query with specification and pagination
        Page<PaymentEntity> paymentPage = paymentRepository.findAll(spec, pageable);

        // Apply status correction for any null statuses
        paymentPage.getContent().forEach(payment -> {
            if (payment.getStatus() == null) {
                payment.setStatus(Status.ACTIVE);
                paymentRepository.save(payment);
            }
        });

        // Map to response DTO
        CustomPaginationResponseDto<PaymentResponseDTO> response = paymentMapper.toPaymentAllResponseDto(paymentPage);

        return response;
    }

    @Override
    public PaymentResponseDTO deletePayment(Long id) {

        PaymentEntity payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + id));

        payment.setStatus(Status.DELETED);
        payment = paymentRepository.save(payment);

        return paymentMapper.toResponseDto(payment);

    }

}