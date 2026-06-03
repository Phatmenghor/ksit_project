package com.menghor.ksit.feature.master.service;

import com.menghor.ksit.feature.master.dto.filter.MajorFilterDto;
import com.menghor.ksit.feature.master.dto.request.MajorRequestDto;
import com.menghor.ksit.feature.master.dto.response.MajorResponseDto;
import com.menghor.ksit.feature.master.dto.update.MajorUpdateDto;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;

import java.util.List;

public interface MajorService {

    MajorResponseDto createMajor(MajorRequestDto majorRequestDto);

    MajorResponseDto getMajorById(Long id);

    MajorResponseDto updateMajorById(Long id, MajorUpdateDto majorRequestDto);

    MajorResponseDto deleteMajorById(Long id);

    CustomPaginationResponseDto<MajorResponseDto> getAllMajors(MajorFilterDto filterDto);

    CustomPaginationResponseDto<MajorResponseDto> getMyMajors(MajorFilterDto filterDto);

    List<MajorResponseDto> getAllListMajors(MajorFilterDto filterDto);
    List<MajorResponseDto> getAllMyListMajors(MajorFilterDto filterDto);

}
