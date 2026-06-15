package com.menghor.ksit.feature.school.helper;

import com.menghor.ksit.feature.school.dto.filter.ScheduleFilterDto;
import com.menghor.ksit.feature.school.dto.response.ScheduleResponseDto;
import com.menghor.ksit.utils.database.CustomPaginationResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@Slf4j
public class ScheduleFilterHelper {

    public ScheduleFilterDto copyWithTeacherId(ScheduleFilterDto original, Long teacherId) {
        log.debug("Creating schedule filter copy with teacherId={}", teacherId);
        ScheduleFilterDto copy = new ScheduleFilterDto();
        copy.setSearch(original.getSearch());
        copy.setClassId(original.getClassId());
        copy.setRoomId(original.getRoomId());
        copy.setTeacherId(teacherId);
        copy.setStudentId(null);
        copy.setAcademyYear(original.getAcademyYear());
        copy.setSemester(original.getSemester());
        copy.setDayOfWeek(original.getDayOfWeek());
        copy.setStatus(original.getStatus());
        copy.setPageNo(original.getPageNo());
        copy.setPageSize(original.getPageSize());
        return copy;
    }

    public ScheduleFilterDto copyWithClassId(ScheduleFilterDto original, Long classId) {
        log.debug("Creating schedule filter copy with classId={}", classId);
        ScheduleFilterDto copy = new ScheduleFilterDto();
        copy.setSearch(original.getSearch());
        copy.setClassId(classId);
        copy.setRoomId(original.getRoomId());
        copy.setTeacherId(null);
        copy.setStudentId(null);
        copy.setAcademyYear(original.getAcademyYear());
        copy.setSemester(original.getSemester());
        copy.setDayOfWeek(original.getDayOfWeek());
        copy.setStatus(original.getStatus());
        copy.setPageNo(original.getPageNo());
        copy.setPageSize(original.getPageSize());
        return copy;
    }

    public CustomPaginationResponseDto<ScheduleResponseDto> createEmptyResponse(ScheduleFilterDto filterDto) {
        return CustomPaginationResponseDto.<ScheduleResponseDto>builder()
                .content(Collections.emptyList())
                .pageNo(filterDto.getPageNo() != null ? filterDto.getPageNo() : 1)
                .pageSize(filterDto.getPageSize() != null ? filterDto.getPageSize() : 10)
                .totalElements(0L)
                .totalPages(0)
                .last(true)
                .build();
    }
}
