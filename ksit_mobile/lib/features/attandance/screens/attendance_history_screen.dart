// lib/features/attendance/screens/attendance_history_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/features/attandance/controllers/attendance_controller.dart';
import 'package:ksit_mobile/features/attandance/models/attendance_models.dart';
import 'package:ksit_mobile/features/attandance/services/attendance_service.dart';
import 'package:ksit_mobile/features/attandance/widgets/attendance_filter_widget.dart';
import 'package:ksit_mobile/features/attandance/widgets/attendance_item_widget.dart';
import 'package:ksit_mobile/features/attandance/widgets/attendance_details_widget.dart';
import 'package:ksit_mobile/shared/widgets/loading_widget.dart';
import 'package:ksit_mobile/core/utils/pagination_utils.dart';

class AttendanceHistoryScreen extends StatefulWidget {
  const AttendanceHistoryScreen({super.key});

  @override
  State<AttendanceHistoryScreen> createState() =>
      _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> {
  final ScrollController _scrollController = ScrollController();
  final RxBool _showScrollToTop = false.obs;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_scrollListener);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_scrollListener);
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollListener() {
    // Show scroll to top button when scrolled down 200 pixels
    if (_scrollController.offset >= 200) {
      if (!_showScrollToTop.value) {
        _showScrollToTop.value = true;
      }
    } else {
      if (_showScrollToTop.value) {
        _showScrollToTop.value = false;
      }
    }
  }

  void _scrollToTop() {
    _scrollController.animateTo(
      0,
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    // Initialize service and controller
    Get.put(AttendanceService());
    final attendanceController = Get.put(AttendanceController());

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Attendance History',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.white,
              ),
            ),
          ],
        ),
      ),
      body: Obx(() {
        if (attendanceController.isInitialLoading.value) {
          return const LoadingWidget(
            message: '',
            overlay: false,
          );
        }

        return RefreshIndicator(
          onRefresh: attendanceController.refreshAttendance,
          color: AppColors.primary,
          child: Stack(
            children: [
              CustomScrollView(
                controller: _scrollController,
                slivers: [
                  // Filter Section
                  SliverToBoxAdapter(
                    child: AttendanceFilterWidget(
                      availableYears:
                          attendanceController.availableAcademyYears,
                      selectedYear:
                          attendanceController.selectedAcademyYear.value,
                      availableSemesters:
                          attendanceController.availableSemesters,
                      selectedSemester:
                          attendanceController.selectedSemester.value,
                      onYearChanged: attendanceController.setAcademyYear,
                      onSemesterChanged: attendanceController.setSemester,
                      onSemesterCleared: attendanceController.clearSemester,
                      onClearFilters: attendanceController.clearAllFilters,
                    ),
                  ),

                  // Attendance List
                  _buildAttendanceList(attendanceController),
                ],
              ),

              // Scroll to top button
              Obx(() => _showScrollToTop.value
                  ? Positioned(
                      right: 16,
                      bottom: 32,
                      child: Material(
                        elevation: 8,
                        borderRadius: BorderRadius.circular(28),
                        child: Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(28),
                          ),
                          child: InkWell(
                            onTap: _scrollToTop,
                            borderRadius: BorderRadius.circular(22),
                            child: const Icon(
                              Icons.keyboard_arrow_up,
                              color: Colors.white,
                              size: 28,
                            ),
                          ),
                        ),
                      ),
                    )
                  : const SizedBox()),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildAttendanceList(AttendanceController controller) {
    return PagedSliverList<int, AttendanceHistoryModel>(
      pagingController: controller.pagingController,
      builderDelegate:
          PaginationUtils.getCommonBuilderDelegate<AttendanceHistoryModel>(
        itemBuilder: (context, attendance, index) => Padding(
          padding: EdgeInsets.fromLTRB(
            16,
            index == 0 ? 8 : 0,
            16,
            12,
          ),
          child: AttendanceItemWidget(
            attendance: attendance,
            onTap: () =>
                _showAttendanceDetails(context, attendance, controller),
          ),
        ),
        loadingMessage: 'Loading attendance records...',
        emptyTitle: 'No Attendance Records',
        emptyMessage:
            'No attendance records found for the selected criteria.\nTry adjusting your filters.',
        emptyActionText: 'Clear Filters',
        onEmptyActionPressed:
            controller.hasActiveFilters ? controller.clearAllFilters : null,
        onErrorRetry: () => controller.pagingController.refresh(),
      ),
    );
  }

  void _showAttendanceDetails(BuildContext context,
      AttendanceHistoryModel attendance, AttendanceController controller) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AttendanceDetailsWidget(
        attendance: attendance,
        controller: controller,
      ),
    );
  }
}
