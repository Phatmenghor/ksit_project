package com.menghor.ksit.feature.auth.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.auth.dto.filter.PaymentFilterDto;
import com.menghor.ksit.feature.auth.dto.request.PaymentCreateDTO;
import com.menghor.ksit.feature.auth.dto.resposne.PaymentResponseDTO;
import com.menghor.ksit.feature.auth.dto.update.PaymentUpdateDto;
import com.menghor.ksit.feature.auth.service.PaymentService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import com.menghor.ksit.utils.database.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentResponseDTO> createPayment(@Valid @RequestBody PaymentCreateDTO createDTO) {
        log.info("Creating payment for user: {}", createDTO.getUserId());
        PaymentResponseDTO payment = paymentService.createPayment(createDTO);
        log.info("Payment created successfully with ID: {}", payment.getId());
        return ApiResponse.success("Payment created successfully", payment);
    }

    @PostMapping("/token")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentResponseDTO> createTokenPayment(@Valid @RequestBody PaymentCreateDTO createDTO) {
        Long userId = securityUtils.getUserIdFromToken();
        createDTO.setUserId(userId);
        log.info("Creating token payment for user: {}", createDTO.getUserId());
        PaymentResponseDTO payment = paymentService.createPayment(createDTO);
        log.info("Payment token created successfully with ID: {}", payment.getId());
        return ApiResponse.success("Payment created successfully", payment);
    }

    @PutMapping("/{id}")
    public ApiResponse<PaymentResponseDTO> updatePayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentUpdateDto updateDTO) {
        log.info("Updating payment with ID: {}", id);
        PaymentResponseDTO payment = paymentService.updatePayment(id, updateDTO);
        log.info("Payment updated successfully with ID: {}", id);
        return ApiResponse.success("Payment updated successfully", payment);
    }

    @PutMapping("token/{id}")
    public ApiResponse<PaymentResponseDTO> updateTokenPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentUpdateDto updateDTO) {
        Long userId = securityUtils.getUserIdFromToken();
        log.info("Updating payment token with ID: {}", id);
        updateDTO.setUserId(userId);
        PaymentResponseDTO payment = paymentService.updatePayment(id, updateDTO);
        log.info("Payment token updated successfully with ID: {}", id);
        return ApiResponse.success("Payment updated successfully", payment);
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentResponseDTO> getPaymentById(@PathVariable Long id) {
        log.info("Retrieving payment with ID: {}", id);
        PaymentResponseDTO payment = paymentService.getPaymentById(id);
        log.info("Payment retrieved successfully with ID: {}", id);
        return ApiResponse.success("Payment retrieved successfully", payment);
    }

    @GetMapping("token/{id}")
    public ApiResponse<PaymentResponseDTO> getPaymentTokenById() {
        Long id = securityUtils.getUserIdFromToken();
        log.info("Retrieving payment token with ID: {}", id);
        PaymentResponseDTO payment = paymentService.getPaymentById(id);
        log.info("Payment retrieved  token successfully with ID: {}", id);
        return ApiResponse.success("Payment by token retrieved successfully", payment);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<PaymentResponseDTO>> getAllPayments(
            @RequestBody PaymentFilterDto filterDto) {
        log.info("Retrieving all payments with filter: {}", filterDto);
        CustomPaginationResponseDto<PaymentResponseDTO> payments = paymentService.getAllPayments(filterDto);
        log.info("Payments retrieved successfully with total count: {}", payments.getTotalElements());
        return ApiResponse.success("Payments retrieved successfully", payments);
    }


    @DeleteMapping("/{id}")
    public ApiResponse<PaymentResponseDTO> deletePayment(@PathVariable Long id) {
        log.info("Deleting payment with ID: {}", id);
        PaymentResponseDTO payment = paymentService.deletePayment(id);
        log.info("Payment deleted successfully with ID: {}", id);
        return ApiResponse.success("Payment deleted successfully", payment);
    }
}