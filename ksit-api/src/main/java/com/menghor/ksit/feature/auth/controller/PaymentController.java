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
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentResponseDTO> createPayment(@Valid @RequestBody PaymentCreateDTO createDTO) {
        PaymentResponseDTO payment = paymentService.createPayment(createDTO);
        return ApiResponse.success("Payment created successfully", payment);
    }

    @PostMapping("/token")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentResponseDTO> createTokenPayment(@Valid @RequestBody PaymentCreateDTO createDTO) {
        Long userId = securityUtils.getUserIdFromToken();
        createDTO.setUserId(userId);
        PaymentResponseDTO payment = paymentService.createPayment(createDTO);
        return ApiResponse.success("Payment created successfully", payment);
    }

    @PutMapping("/{id}")
    public ApiResponse<PaymentResponseDTO> updatePayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentUpdateDto updateDTO) {
        PaymentResponseDTO payment = paymentService.updatePayment(id, updateDTO);
        return ApiResponse.success("Payment updated successfully", payment);
    }

    @PutMapping("token/{id}")
    public ApiResponse<PaymentResponseDTO> updateTokenPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentUpdateDto updateDTO) {
        Long userId = securityUtils.getUserIdFromToken();
        updateDTO.setUserId(userId);
        PaymentResponseDTO payment = paymentService.updatePayment(id, updateDTO);
        return ApiResponse.success("Payment updated successfully", payment);
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentResponseDTO> getPaymentById(@PathVariable Long id) {
        PaymentResponseDTO payment = paymentService.getPaymentById(id);
        return ApiResponse.success("Payment retrieved successfully", payment);
    }

    @GetMapping("token/{id}")
    public ApiResponse<PaymentResponseDTO> getPaymentTokenById() {
        Long id = securityUtils.getUserIdFromToken();
        PaymentResponseDTO payment = paymentService.getPaymentById(id);
        return ApiResponse.success("Payment by token retrieved successfully", payment);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<PaymentResponseDTO>> getAllPayments(
            @RequestBody PaymentFilterDto filterDto) {
        CustomPaginationResponseDto<PaymentResponseDTO> payments = paymentService.getAllPayments(filterDto);
        return ApiResponse.success("Payments retrieved successfully", payments);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<PaymentResponseDTO> deletePayment(@PathVariable Long id) {
        PaymentResponseDTO payment = paymentService.deletePayment(id);
        return ApiResponse.success("Payment deleted successfully", payment);
    }
}