package com.menghor.ksit.feature.school.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.school.dto.filter.RequestFilterDto;
import com.menghor.ksit.feature.school.dto.filter.RequestHistoryFilterDto;
import com.menghor.ksit.feature.school.dto.request.RequestCreateDto;
import com.menghor.ksit.feature.school.dto.response.RequestHistoryDto;
import com.menghor.ksit.feature.school.dto.response.RequestResponseDto;
import com.menghor.ksit.feature.school.dto.update.RequestUpdateDto;
import com.menghor.ksit.feature.school.service.RequestService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import com.menghor.ksit.utils.database.SecurityUtils;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RequestResponseDto> createRequest(
            @Valid @RequestBody RequestCreateDto createDto) {
        RequestResponseDto response = requestService.createRequest(createDto);
        return ApiResponse.success("Request created successfully", response);
    }

    @PutMapping("/{id}")
    public ApiResponse<RequestResponseDto> updateRequest(
            @PathVariable Long id,
            @Valid @RequestBody RequestUpdateDto updateDto) {
        RequestResponseDto response = requestService.updateRequest(id, updateDto);
        return ApiResponse.success("Request updated successfully", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<RequestResponseDto> getRequestById(
            @Parameter(description = "Request ID") @PathVariable Long id) {
        RequestResponseDto response = requestService.getRequestById(id);
        return ApiResponse.success("Request fetched successfully", response);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<RequestResponseDto>> getAllRequests(
            @RequestBody RequestFilterDto filterDto) {
        CustomPaginationResponseDto<RequestResponseDto> response = requestService.getAllRequests(filterDto);
        return ApiResponse.success("Requests fetched successfully", response);
    }

    @PostMapping("/all/token")
    public ApiResponse<CustomPaginationResponseDto<RequestResponseDto>> getAllMyRequests(
            @RequestBody RequestFilterDto filterDto) {
        filterDto.setUserId(securityUtils.getCurrentUser().getId());
        CustomPaginationResponseDto<RequestResponseDto> response = requestService.getAllRequests(filterDto);
        return ApiResponse.success("My requests fetched successfully", response);
    }

    @PostMapping("/history")
    public ApiResponse<CustomPaginationResponseDto<RequestHistoryDto>> getRequestHistory(
            @RequestBody RequestHistoryFilterDto filterDto) {

        CustomPaginationResponseDto<RequestHistoryDto> response = requestService.getRequestHistory(filterDto);
        return ApiResponse.success("Request history fetched successfully", response);
    }

    @PostMapping("/my-history")
    public ApiResponse<CustomPaginationResponseDto<RequestHistoryDto>> getMyRequestHistory(
            @RequestBody RequestHistoryFilterDto filterDto) {

        CustomPaginationResponseDto<RequestHistoryDto> response = requestService.getMyRequestHistory(filterDto);
        return ApiResponse.success("Your request history fetched successfully", response);
    }

    // NEW ENDPOINT: Get detailed history by history ID
    @GetMapping("/history/{historyId}")
    public ApiResponse<RequestHistoryDto> getRequestHistoryDetail(
            @Parameter(description = "Request History ID") @PathVariable Long historyId) {
        RequestHistoryDto response = requestService.getRequestHistoryDetail(historyId);
        return ApiResponse.success("Request history detail fetched successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<RequestResponseDto> deleteRequest(
            @Parameter(description = "Request ID") @PathVariable Long id) {
        RequestResponseDto response = requestService.deleteRequest(id);
        return ApiResponse.success("Request deleted successfully", response);
    }
}
