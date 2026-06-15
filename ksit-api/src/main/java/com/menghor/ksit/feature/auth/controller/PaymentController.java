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
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Payments", description = "Manage student payment records and history")
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentResponseDTO> createPayment(@Valid @RequestBody PaymentCreateDTO createDTO) {
        log.info("Create payment request received");
        PaymentResponseDTO payment = paymentService.createPayment(createDTO);
        log.info("Payment created successfully. id={}", payment.getId());
        return ApiResponse.success("Payment created successfully", payment);
    }

    @PostMapping("/token")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentResponseDTO> createTokenPayment(@Valid @RequestBody PaymentCreateDTO createDTO) {
        Long userId = securityUtils.getUserIdFromToken();
        log.info("Create payment by token request received. userId={}", userId);
        createDTO.setUserId(userId);
        PaymentResponseDTO payment = paymentService.createPayment(createDTO);
        log.info("Payment created successfully. id={}", payment.getId());
        return ApiResponse.success("Payment created successfully", payment);
    }

    @PutMapping("/{id}")
    public ApiResponse<PaymentResponseDTO> updatePayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentUpdateDto updateDTO) {
        log.info("Update payment id={} request received", id);
        PaymentResponseDTO payment = paymentService.updatePayment(id, updateDTO);
        log.info("Payment id={} updated successfully", id);
        return ApiResponse.success("Payment updated successfully", payment);
    }

    @PutMapping("token/{id}")
    public ApiResponse<PaymentResponseDTO> updateTokenPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentUpdateDto updateDTO) {
        Long userId = securityUtils.getUserIdFromToken();
        log.info("Update payment id={} by token request received. userId={}", id, userId);
        updateDTO.setUserId(userId);
        PaymentResponseDTO payment = paymentService.updatePayment(id, updateDTO);
        return ApiResponse.success("Payment updated successfully", payment);
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentResponseDTO> getPaymentById(@PathVariable Long id) {
        log.info("Get payment id={} request received", id);
        PaymentResponseDTO payment = paymentService.getPaymentById(id);
        return ApiResponse.success("Payment retrieved successfully", payment);
    }

    @GetMapping("token/{id}")
    public ApiResponse<PaymentResponseDTO> getPaymentTokenById() {
        Long id = securityUtils.getUserIdFromToken();
        log.info("Get payment by token request received. userId={}", id);
        PaymentResponseDTO payment = paymentService.getPaymentById(id);
        return ApiResponse.success("Payment by token retrieved successfully", payment);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<PaymentResponseDTO>> getAllPayments(
            @RequestBody PaymentFilterDto filterDto) {
        log.info("Get all payments request received");
        CustomPaginationResponseDto<PaymentResponseDTO> payments = paymentService.getAllPayments(filterDto);
        return ApiResponse.success("Payments retrieved successfully", payments);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<PaymentResponseDTO> deletePayment(@PathVariable Long id) {
        log.info("Delete payment id={} request received", id);
        PaymentResponseDTO payment = paymentService.deletePayment(id);
        log.info("Payment id={} deleted successfully", id);
        return ApiResponse.success("Payment deleted successfully", payment);
    }
}