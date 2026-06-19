// lib/features/home/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:ksit_mobile/core/constants/app_image.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/features/home/controllers/home_controller.dart';
import 'package:ksit_mobile/features/home/services/home_service.dart';
import 'package:ksit_mobile/features/home/widget/schedule_filter_widget.dart';
import 'package:ksit_mobile/features/home/widget/schedule_class_widget.dart';

import '../../../core/constants/app_colors.dart';
import '../../../shared/widgets/loading_widget.dart';

// Import the new utils
import '../../../core/utils/ui_utils.dart';
import '../../../core/utils/pagination_utils.dart';

import '../models/schedule_models.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Initialize service and controller
    Get.put(HomeService());
    final scheduleController = Get.put(HomeController());

    return Scaffold(
      backgroundColor: AppColors.white,
      body: Obx(() {
        if (scheduleController.isInitialLoading.value) {
          return const LoadingWidget(
            overlay: false,
          );
        }

        return RefreshIndicator(
          onRefresh: scheduleController.refreshSchedules,
          color: AppColors.primary,
          child: CustomScrollView(
            slivers: [
              // Custom App Bar
              SliverAppBar(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                automaticallyImplyLeading: false,
                floating: true,
                snap: true,
                toolbarHeight: 70,
                title: Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: Colors.white,
                      child: ClipOval(
                        child: Image.asset(
                          AppImages.logoSchool,
                          width: 44,
                          height: 44,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Kampong Speu',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.white,
                          ),
                        ),
                        Text(
                          'Institute of Technology',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.white,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Header Section
              SliverToBoxAdapter(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Upcoming Schedules',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Obx(() {
                        final count =
                            scheduleController.selectedFilterType.value ==
                                    FilterType.today
                                ? scheduleController.todayTotalElements.value
                                : scheduleController.allTotalElements.value;

                        return Text(
                          '$count Schedules',
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),

              // Filter Tabs
              SliverToBoxAdapter(
                child: Obx(() => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          // Use UIUtils for filter buttons
                          UIUtils.buildAppBarFilterButton(
                            text: 'Today',
                            isSelected:
                                scheduleController.selectedFilterType.value ==
                                    FilterType.today,
                            onTap: () => scheduleController
                                .setFilterType(FilterType.today),
                          ),
                          const SizedBox(width: 8),
                          UIUtils.buildAppBarFilterButton(
                            text: 'All Schedule',
                            isSelected:
                                scheduleController.selectedFilterType.value ==
                                    FilterType.all,
                            onTap: () => scheduleController
                                .setFilterType(FilterType.all),
                          ),
                        ],
                      ),
                    )),
              ),

              // Schedule Filter Widget
              SliverToBoxAdapter(
                child: ScheduleFilterWidget(
                  availableYears: scheduleController.availableAcademyYears,
                  selectedYear: scheduleController.selectedAcademyYear.value,
                  availableSemesters: scheduleController.availableSemesters,
                  selectedSemester: scheduleController.selectedSemester.value,
                  onYearChanged: scheduleController.setAcademyYear,
                  onSemesterChanged: scheduleController.setSemester,
                  onSemesterCleared: scheduleController.clearSemester,
                  onClearFilters: scheduleController.clearAllFilters,
                ),
              ),

              // Schedules List
              _buildSchedulesList(scheduleController),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildSchedulesList(HomeController controller) {
    return Obx(() {
      // Show today's schedules when Today filter is selected
      if (controller.selectedFilterType.value == FilterType.today) {
        return _buildTodaySchedules(controller);
      }

      // Show all schedules when All filter is selected
      return _buildAllSchedules(controller);
    });
  }

  Widget _buildTodaySchedules(HomeController controller) {
    return PagedSliverList<int, ScheduleModel>(
      key: const ValueKey('today_schedules'),
      pagingController: controller.todaySchedulesPagingController,
      builderDelegate: PaginationUtils.getCommonBuilderDelegate<ScheduleModel>(
        itemBuilder: (context, schedule, index) => Padding(
          padding: EdgeInsets.fromLTRB(
            16,
            index == 0 ? 16 : 0,
            16,
            12,
          ),
          child: ScheduleClassWidget(
            schedule: schedule,
            onSurveyTap: () => controller.onSurveyTap(schedule),
            onTap: () => controller.onScheduleTap(schedule),
            statusText: controller.getScheduleStatusText(schedule),
            statusColor: controller.getScheduleStatusColor(schedule),
          ),
        ),
        loadingMessage: 'Loading today\'s schedules...',
        emptyTitle: 'No Classes Today',
        emptyMessage:
            'You don\'t have any classes scheduled for today.\nEnjoy your free time! 🎉',
        // emptyActionText: 'Refresh',
        onEmptyActionPressed: controller.refreshSchedules,
        onErrorRetry: () => controller.todaySchedulesPagingController.refresh(),
      ),
    );
  }

  Widget _buildAllSchedules(HomeController controller) {
    return PagedSliverList<int, ScheduleModel>(
      key: const ValueKey('all_schedules'),
      pagingController: controller.allSchedulesPagingController,
      builderDelegate: PaginationUtils.getCommonBuilderDelegate<ScheduleModel>(
        itemBuilder: (context, schedule, index) => Padding(
          padding: EdgeInsets.fromLTRB(
            16,
            index == 0 ? 16 : 0,
            16,
            12,
          ),
          child: ScheduleClassWidget(
            schedule: schedule,
            onSurveyTap: () => controller.onSurveyTap(schedule),
            onTap: () => controller.onScheduleTap(schedule),
            statusText: controller.getScheduleStatusText(schedule),
            statusColor: controller.getScheduleStatusColor(schedule),
          ),
        ),
        loadingMessage: 'Loading schedules...',
        emptyTitle: 'No Schedules Found',
        emptyMessage:
            'No schedules available for the selected filters.\nTry adjusting your selection.',
        // emptyActionText: 'Refresh',
        onEmptyActionPressed: controller.refreshSchedules,
        onErrorRetry: () => controller.allSchedulesPagingController.refresh(),
      ),
    );
  }
}
