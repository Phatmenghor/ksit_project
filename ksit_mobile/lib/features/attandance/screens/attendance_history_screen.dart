// lib/features/attendance/screens/attendance_history_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/core/utils/pagination_utils.dart';
import 'package:ksit_mobile/features/attandance/controllers/attendance_controller.dart';
import 'package:ksit_mobile/features/attandance/models/attendance_models.dart';
import 'package:ksit_mobile/features/attandance/widgets/attendance_details_widget.dart';
import 'package:ksit_mobile/features/attandance/widgets/attendance_filter_widget.dart';
import 'package:ksit_mobile/features/attandance/widgets/attendance_item_widget.dart';
import 'package:ksit_mobile/shared/widgets/loading_widget.dart';

class AttendanceHistoryScreen extends StatefulWidget {
  const AttendanceHistoryScreen({super.key});

  @override
  State<AttendanceHistoryScreen> createState() =>
      _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> {
  final ScrollController _scrollController = ScrollController();
  final RxBool _showScrollToTop = false.obs;
  late final AttendanceController _attendanceController;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_scrollListener);
    // Create the controller here so it's tied to the screen lifecycle.
    // AttendanceService is pre-registered in InitialBinding.
    _attendanceController = Get.isRegistered<AttendanceController>()
        ? Get.find<AttendanceController>()
        : Get.put(AttendanceController());
  }

  @override
  void dispose() {
    _scrollController.removeListener(_scrollListener);
    _scrollController.dispose();
    // Delete the controller so its PagingController and resources are freed.
    Get.delete<AttendanceController>(force: true);
    super.dispose();
  }

  void _scrollListener() {
    if (_scrollController.offset >= 200) {
      if (!_showScrollToTop.value) _showScrollToTop.value = true;
    } else {
      if (_showScrollToTop.value) _showScrollToTop.value = false;
    }
  }

  void _scrollToTop() {
    _scrollController.animateTo(
      0,
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final attendanceController = _attendanceController;

    return Scaffold(
      backgroundColor: AppColors.body,
      body: Obx(() {
        if (attendanceController.isInitialLoading.value) {
          return Column(
            children: [
              _buildGradientHeader(context, attendanceController),
              const Expanded(child: LoadingWidget(message: '', overlay: false)),
            ],
          );
        }

        return Stack(
          children: [
            RefreshIndicator(
              onRefresh: attendanceController.refreshAttendance,
              color: AppColors.primary,
              child: CustomScrollView(
                controller: _scrollController,
                slivers: [
                  // Gradient header as sliver
                  SliverToBoxAdapter(
                    child: _buildGradientHeader(context, attendanceController),
                  ),

                  // Filter widget
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

                  // List
                  _buildAttendanceList(attendanceController),
                ],
              ),
            ),

            // Scroll-to-top FAB
            Obx(() => _showScrollToTop.value
                ? Positioned(
                    right: 16,
                    bottom: 32,
                    child: Material(
                      elevation: 6,
                      shape: const CircleBorder(),
                      color: AppColors.primary,
                      child: InkWell(
                        onTap: _scrollToTop,
                        customBorder: const CircleBorder(),
                        child: const SizedBox(
                          width: 44,
                          height: 44,
                          child: Icon(Icons.keyboard_arrow_up,
                              color: Colors.white, size: 28),
                        ),
                      ),
                    ),
                  )
                : const SizedBox()),
          ],
        );
      }),
    );
  }

  Widget _buildGradientHeader(
      BuildContext context, AttendanceController controller) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryAccent],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => context.pop(),
                  ),
                  const Expanded(
                    child: Text(
                      'Attendance History',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Stats row
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 20),
              child: ValueListenableBuilder<PagingState<int, AttendanceHistoryModel>>(
                valueListenable: controller.pagingController,
                builder: (context, state, _) {
                  final total = state.itemList?.length ?? 0;
                  final present = state.itemList
                          ?.where((a) => a.isPresent)
                          .length ??
                      0;
                  final absent = state.itemList
                          ?.where((a) => a.isAbsent)
                          .length ??
                      0;
                  final late = state.itemList
                          ?.where((a) => a.isLate)
                          .length ??
                      0;
                  return Row(
                    children: [
                      _buildStatChip(
                          Icons.list_alt_outlined, '$total', 'Total', Colors.white70),
                      const SizedBox(width: 8),
                      _buildStatChip(Icons.check_circle_outline, '$present',
                          'Present', Colors.white70),
                      const SizedBox(width: 8),
                      _buildStatChip(Icons.cancel_outlined, '$absent', 'Absent',
                          Colors.white70),
                      const SizedBox(width: 8),
                      _buildStatChip(Icons.access_time_outlined, '$late', 'Late',
                          Colors.white70),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatChip(
      IconData icon, String value, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(height: 3),
            Text(
              value,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            Text(
              label,
              style: const TextStyle(fontSize: 9, color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAttendanceList(AttendanceController controller) {
    return PagedSliverList<int, AttendanceHistoryModel>(
      pagingController: controller.pagingController,
      builderDelegate:
          PaginationUtils.getCommonBuilderDelegate<AttendanceHistoryModel>(
        pagingController: controller.pagingController,
        itemBuilder: (context, attendance, index) => Padding(
          padding: EdgeInsets.fromLTRB(16, index == 0 ? 8 : 0, 16, 12),
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
