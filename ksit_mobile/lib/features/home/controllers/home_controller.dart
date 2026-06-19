// lib/features/home/controllers/home_controller.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:ksit_mobile/core/constants/app_routes.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/features/home/services/home_service.dart';

// Import the new utils
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/core/utils/schedule_utils.dart';
import 'package:ksit_mobile/core/utils/pagination_utils.dart';

import '../models/schedule_models.dart';

class HomeController extends GetxController {
  final HomeService _homeService = Get.find<HomeService>();

  // Observables
  final RxBool isInitialLoading = true.obs;

  final Rx<FilterType> selectedFilterType = FilterType.today.obs;
  final RxInt selectedAcademyYear = 0.obs;
  final Rx<Semester?> selectedSemester = Rx<Semester?>(null);
  final RxList<int> availableAcademyYears = <int>[].obs;
  final RxList<Semester> availableSemesters = <Semester>[].obs;

  // Observables for total counts from API
  final RxInt todayTotalElements = 0.obs;
  final RxInt allTotalElements = 0.obs;

  // Today's schedules with pagination
  final PagingController<int, ScheduleModel> todaySchedulesPagingController =
      PagingController(firstPageKey: 1);

  // All schedules pagination
  final PagingController<int, ScheduleModel> allSchedulesPagingController =
      PagingController(firstPageKey: 1);

  // Default values for "show all" state
  final int _defaultYear = 0;
  final Semester? _defaultSemester = null;

  @override
  void onInit() {
    super.onInit();
    _setupPagination();
    _loadInitialData();
  }

  @override
  void onClose() {
    // Use PaginationUtils to safely dispose controllers
    PaginationUtils.disposePagingController(todaySchedulesPagingController);
    PaginationUtils.disposePagingController(allSchedulesPagingController);
    super.onClose();
  }

  void _setupPagination() {
    // Use PaginationUtils for setup
    PaginationUtils.setupPagingController(
      controller: todaySchedulesPagingController,
      fetchPage: _fetchTodaySchedulesPage,
    );

    PaginationUtils.setupPagingController(
      controller: allSchedulesPagingController,
      fetchPage: _fetchAllSchedulesPage,
    );
  }

  Future<void> _loadInitialData() async {
    try {
      isInitialLoading.value = true;

      // Use ScheduleUtils for available data
      availableAcademyYears.assignAll(ScheduleUtils.generateAcademyYears());
      availableSemesters.assignAll(ScheduleUtils.getAvailableSemesters());

      selectedFilterType.value = FilterType.today;
      selectedAcademyYear.value = 0;
      selectedSemester.value = null;
    } catch (e) {
      ToastUtils.showError('Failed to load schedules');
    } finally {
      isInitialLoading.value = false;
    }
  }

  void setFilterType(FilterType filterType) {
    if (selectedFilterType.value != filterType) {
      selectedFilterType.value = filterType;

      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (filterType == FilterType.today) {
          if (todaySchedulesPagingController.itemList == null) {
            _fetchTodaySchedulesPage(1);
          } else {
            PaginationUtils.refreshPagingController(
                todaySchedulesPagingController);
          }
        } else {
          if (allSchedulesPagingController.itemList == null) {
            _fetchAllSchedulesPage(1);
          } else {
            PaginationUtils.refreshPagingController(
                allSchedulesPagingController);
          }
        }
      });
    }
  }

  void setAcademyYear(int year) {
    if (selectedAcademyYear.value != year) {
      selectedAcademyYear.value = year;

      Future.delayed(Duration.zero, () {
        if (selectedFilterType.value == FilterType.today) {
          PaginationUtils.refreshPagingController(
              todaySchedulesPagingController);
        } else {
          PaginationUtils.refreshPagingController(allSchedulesPagingController);
        }
      });
    }
  }

  void setSemester(Semester semester) {
    if (selectedSemester.value != semester) {
      selectedSemester.value = semester;

      Future.delayed(Duration.zero, () {
        if (selectedFilterType.value == FilterType.today) {
          PaginationUtils.refreshPagingController(
              todaySchedulesPagingController);
        } else {
          PaginationUtils.refreshPagingController(allSchedulesPagingController);
        }
      });
    }
  }

  void clearSemester() {
    if (selectedSemester.value != null) {
      selectedSemester.value = null;

      Future.delayed(Duration.zero, () {
        if (selectedFilterType.value == FilterType.today) {
          PaginationUtils.refreshPagingController(
              todaySchedulesPagingController);
        } else {
          PaginationUtils.refreshPagingController(allSchedulesPagingController);
        }
      });
    }
  }

  Future<void> _fetchTodaySchedulesPage(int pageKey) async {
    try {
      // Use DayOfWeekExtension from utils
      final currentDay = DayOfWeekExtension.getCurrentDay();

      final academyYear =
          selectedAcademyYear.value != 0 ? selectedAcademyYear.value : null;

      final semester = selectedSemester.value;

      final response = await _homeService.getMySchedules(
        academyYear: academyYear,
        semester: semester,
        dayOfWeek: currentDay,
        pageNo: pageKey,
        pageSize: 10,
      );

      todayTotalElements.value = response.totalElements;

      // Use PaginationUtils to handle response
      PaginationUtils.handlePaginationResponse(
        controller: todaySchedulesPagingController,
        items: response.content,
        pageKey: pageKey,
        isLastPage: response.last,
      );
    } catch (e) {
      // Use PaginationUtils to handle error
      PaginationUtils.handlePaginationError(
        controller: todaySchedulesPagingController,
        error: e,
      );
    }
  }

  Future<void> _fetchAllSchedulesPage(int pageKey) async {
    try {
      final academyYear =
          selectedAcademyYear.value != 0 ? selectedAcademyYear.value : null;

      final semester = selectedSemester.value;

      final response = await _homeService.getMySchedules(
        academyYear: academyYear,
        semester: semester,
        pageNo: pageKey,
        pageSize: 10,
      );

      allTotalElements.value = response.totalElements;

      // Use PaginationUtils to handle response
      PaginationUtils.handlePaginationResponse(
        controller: allSchedulesPagingController,
        items: response.content,
        pageKey: pageKey,
        isLastPage: response.last,
      );
    } catch (e) {
      // Use PaginationUtils to handle error
      PaginationUtils.handlePaginationError(
        controller: allSchedulesPagingController,
        error: e,
      );
    }
  }

  // Public methods for UI interactions
  Future<void> refreshSchedules() async {
    try {
      if (selectedFilterType.value == FilterType.today) {
        PaginationUtils.refreshPagingController(todaySchedulesPagingController);
      } else {
        PaginationUtils.refreshPagingController(allSchedulesPagingController);
      }
    } catch (e) {
      ToastUtils.showError('Failed to refresh schedules');
    }
  }

  // Check if any filters are applied (not default values)
  bool get hasActiveFilters {
    return selectedAcademyYear.value != _defaultYear ||
        selectedSemester.value != _defaultSemester;
  }

  // Clear all filters to default state
  void clearAllFilters() {
    selectedAcademyYear.value = _defaultYear;
    selectedSemester.value = _defaultSemester;

    Future.delayed(Duration.zero, () {
      if (selectedFilterType.value == FilterType.today) {
        PaginationUtils.refreshPagingController(todaySchedulesPagingController);
      } else {
        PaginationUtils.refreshPagingController(allSchedulesPagingController);
      }
    });

    ToastUtils.showInfo('Filters cleared');
  }

  void onScheduleTap(ScheduleModel schedule) {
    if (schedule.id != null) {
      Get.context?.push('${AppRoutes.scheduleDetailRoute}?id=${schedule.id}');
    } else {
      ToastUtils.showError('Schedule ID not available');
    }
  }

  void onSurveyTap(ScheduleModel schedule) async {
    if (schedule.shouldShowSurveyButton && schedule.id != null) {
      final result = await Get.context
          ?.push('${AppRoutes.surveyRoute}?scheduleId=${schedule.id}');

      // If survey was completed successfully, refresh the schedules
      if (result == true) {
        refreshSchedules();
      }
    } else {
      ToastUtils.showInfo('Survey not available for this class');
    }
  }

  // Helper methods for UI - now using ScheduleUtils
  String getScheduleStatusText(ScheduleModel schedule) {
    return ScheduleUtils.getScheduleStatusText(
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      day: schedule.day,
    );
  }

  Color getScheduleStatusColor(ScheduleModel schedule) {
    return ScheduleUtils.getScheduleStatusColor(
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      day: schedule.day,
    );
  }

  // Get the total count from API response (totalElements)
  int get todaySchedulesCount {
    return todayTotalElements.value;
  }

  // Get total schedules count from API response (totalElements)
  int get totalSchedulesCount {
    return allTotalElements.value;
  }
}
