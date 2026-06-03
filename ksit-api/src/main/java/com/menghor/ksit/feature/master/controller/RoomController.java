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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {
    private final RoomService roomService;

    @PostMapping
    public ApiResponse<RoomResponseDto> create(@Valid @RequestBody RoomRequestDto roomRequestDto) {
        RoomResponseDto roomResponseDto = roomService.createRoom(roomRequestDto);
        return new ApiResponse<>(
                "success",
                "Room created successfully...!"
                , roomResponseDto
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomResponseDto> getById(@PathVariable Long id) {
        RoomResponseDto roomResponseDto = roomService.getRoomById(id);
        return new ApiResponse<>(
                "success",
                "Get room by id " + id + " successfully...!",
                roomResponseDto
        );
    }

    @PostMapping("/updateById/{id}")
    public ApiResponse<RoomResponseDto> updateById(@Valid @RequestBody RoomUpdateDto roomRequest, @PathVariable Long id) {
        RoomResponseDto roomResponseDto = roomService.updateRoomById(roomRequest, id);
        return new ApiResponse<>(
                "success",
                "Update room by id " + id + " successfully...!"
                , roomResponseDto
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<RoomResponseDto> deleteById(@PathVariable Long id) {
        RoomResponseDto roomResponseDto = roomService.deleteRoomById(id);
        return new ApiResponse<>(
                "success",
                "Delete room by id " + id + " successfully...!"
                , roomResponseDto
        );
    }

    @PostMapping("/all")
    public ApiResponse<CustomPaginationResponseDto<RoomResponseDto>> getAllRooms(@RequestBody RoomFilterDto filterDto) {
        CustomPaginationResponseDto<RoomResponseDto> allRooms = roomService.getAllRoom(filterDto);
        return new ApiResponse<>(
                "success",
                "All rooms fetched successfully...!"
                , allRooms
        );
    }
}