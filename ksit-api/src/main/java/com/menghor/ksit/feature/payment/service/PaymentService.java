package com.menghor.ksit.feature.payment.service;

import com.menghor.ksit.feature.payment.dto.filter.PaymentFilterDto;
import com.menghor.ksit.feature.payment.dto.request.PaymentCreateDTO;
import com.menghor.ksit.feature.payment.dto.response.PaymentResponseDTO;
import com.menghor.ksit.feature.payment.dto.update.PaymentUpdateDto;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;

public interface PaymentService {
    
    PaymentResponseDTO createPayment(PaymentCreateDTO createDTO);
    
    PaymentResponseDTO updatePayment(Long id, PaymentUpdateDto updateDTO);
    
    PaymentResponseDTO getPaymentById(Long id);
    
    CustomPaginationResponseDto<PaymentResponseDTO> getAllPayments(PaymentFilterDto filterDto);

    PaymentResponseDTO deletePayment(Long id);
}