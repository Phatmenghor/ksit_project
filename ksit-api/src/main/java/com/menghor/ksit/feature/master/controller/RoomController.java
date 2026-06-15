package com.menghor.ksit.feature.master.controller;

import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.master.dto.filter.RoomFilterDto;
import com.menghor.ksit.feature.master.dto.request.RoomRequestDto;
import com.menghor.ksit.feature.master.dto.response.RoomResponseDto;
import com.menghor.ksit.feature.master.dto.update.RoomUpdateDto;
import com.menghor.ksit.feature.master.service.RoomService;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/rooms")
@Slf4j
public class RoomController {
    private final RoomService roomService;

    @PostMapping
    public ApiResponse<RoomResponseDto> create(@Valid @RequestBody RoomRequestDto roomRequestDto) {
        log.info("Create room request received");
        RoomResponseDto roomResponseDto = roomService.createRoom(roomRequestDto);
        log.info("Room created successfully. id={}", roomResponseDto.getId());
        return new ApiResponse<>("success", "Room created successfully", roomResponseDto);
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomResponseDto> getById(@PathVariable Long id) {
        log.info("Get room id={} request received", id);
        RoomResponseDto roomResponseDto = roomService.getRoomById(id);
        return new ApiResponse<>("success", "Room fetched successfully", roomResponseDto);
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<RoomResponseDto> updateById(@Valid @RequestBody RoomUpdateDto roomRequest, @PathVariable Long id) {
        log.info("Update room id={} request received", id);
        RoomResponseDto roomResponseDto = roomService.updateRoomById(roomRequest, id);
        log.info("Room id={} updated successfully", id);
        return new ApiResponse<>("success", "Room updated successfully", roomResponseDto);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<RoomResponseDto> deleteById(@PathVariable Long id) {
        log.info("Delete room id={} request received", id);
        RoomResponseDto roomResponseDto = roomService.deleteRoomById(id);
        log.info("Room id={} deleted successfully", id);
        return new ApiResponse<>("success", "Room deleted successfully", roomResponseDto);
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<RoomResponseDto>> getAllRooms(@RequestBody RoomFilterDto filterDto) {
        log.info("Get all rooms request received");
        CustomPaginationResponseDto<RoomResponseDto> allRooms = roomService.getAllRoom(filterDto);
        return new ApiResponse<>("success", "All rooms fetched successfully", allRooms);
    }
}