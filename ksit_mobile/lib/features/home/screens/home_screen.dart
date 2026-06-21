// lib/features/home/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:ksit_mobile/core/config/app_config.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/core/constants/app_image.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/features/home/controllers/home_controller.dart';
import 'package:ksit_mobile/features/home/models/schedule_models.dart';
import 'package:ksit_mobile/features/home/services/home_service.dart';
import 'package:ksit_mobile/features/home/widget/schedule_class_widget.dart';
import 'package:ksit_mobile/features/home/widget/schedule_filter_widget.dart';
import 'package:ksit_mobile/features/profile/controllers/profile_controller.dart';
import 'package:ksit_mobile/core/utils/pagination_utils.dart';
import 'package:ksit_mobile/shared/widgets/loading_widget.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    Get.put(HomeService());
    final scheduleController = Get.put(HomeController());
    final profileController = Get.find<ProfileController>();

    return Scaffold(
      backgroundColor: AppColors.body,
      body: Obx(() {
        if (scheduleController.isInitialLoading.value) {
          return const LoadingWidget(overlay: false);
        }

        return RefreshIndicator(
          onRefresh: scheduleController.refreshSchedules,
          color: AppColors.primary,
          child: CustomScrollView(
            slivers: [
              // ─── Gradient App Bar ─────────────────────────────────────
              SliverAppBar(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                automaticallyImplyLeading: false,
                floating: true,
                snap: true,
                toolbarHeight: 70,
                flexibleSpace: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [AppColors.primary, AppColors.primaryAccent],
                    ),
                  ),
                ),
                title: Obx(() {
                  final imageUrl = profileController.currentUserProfileUrl;
                  return Row(
                    children: [
                      // School logo
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.asset(
                            AppImages.logoSchool,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Kampong Speu',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'Institute of Technology',
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.white70,
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // User avatar (right side)
                      if (imageUrl != null && imageUrl.isNotEmpty)
                        CircleAvatar(
                          radius: 17,
                          backgroundImage: NetworkImage(
                              AppConfig.baseImageUrl + imageUrl),
                          backgroundColor: Colors.white24,
                        )
                      else
                        Container(
                          width: 34,
                          height: 34,
                          decoration: const BoxDecoration(
                            color: Colors.white24,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.person,
                              color: Colors.white70, size: 20),
                        ),
                    ],
                  );
                }),
              ),

              // ─── Greeting + count header ──────────────────────────────
              SliverToBoxAdapter(
                child: Obx(() {
                  final count =
                      scheduleController.selectedFilterType.value ==
                              FilterType.today
                          ? scheduleController.todayTotalElements.value
                          : scheduleController.allTotalElements.value;
                  final greeting = profileController.greeting;
                  final name = profileController.currentUserDisplayName;

                  return Container(
                    color: AppColors.primary.withValues(alpha: 0.04),
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '$greeting $name',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'You have $count schedule${count == 1 ? '' : 's'}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ),

              // ─── Today / All Schedule filter tabs ─────────────────────
              SliverToBoxAdapter(
                child: Obx(() => Container(
                      color: Colors.white,
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                      child: Row(
                        children: [
                          _buildTab(
                            label: 'Today',
                            icon: Icons.today_outlined,
                            isSelected: scheduleController
                                    .selectedFilterType.value ==
                                FilterType.today,
                            onTap: () => scheduleController
                                .setFilterType(FilterType.today),
                          ),
                          const SizedBox(width: 8),
                          _buildTab(
                            label: 'All Schedule',
                            icon: Icons.calendar_month_outlined,
                            isSelected: scheduleController
                                    .selectedFilterType.value ==
                                FilterType.all,
                            onTap: () =>
                                scheduleController.setFilterType(FilterType.all),
                          ),
                        ],
                      ),
                    )),
              ),

              // ─── Filters ──────────────────────────────────────────────
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

              // ─── Schedule list ────────────────────────────────────────
              _buildSchedulesList(scheduleController),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildTab({
    required String label,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 11),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: isSelected ? AppColors.primary : Colors.transparent,
                width: 2.5,
              ),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 15,
                color:
                    isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
              const SizedBox(width: 5),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight:
                      isSelected ? FontWeight.w700 : FontWeight.w400,
                  color: isSelected
                      ? AppColors.primary
                      : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSchedulesList(HomeController controller) {
    return Obx(() {
      if (controller.selectedFilterType.value == FilterType.today) {
        return _buildTodaySchedules(controller);
      }
      return _buildAllSchedules(controller);
    });
  }

  Widget _buildTodaySchedules(HomeController controller) {
    return PagedSliverList<int, ScheduleModel>(
      key: const ValueKey('today_schedules'),
      pagingController: controller.todaySchedulesPagingController,
      builderDelegate: PaginationUtils.getCommonBuilderDelegate<ScheduleModel>(
        itemBuilder: (context, schedule, index) => Padding(
          padding: EdgeInsets.fromLTRB(16, index == 0 ? 16 : 0, 16, 12),
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
            'You don\'t have any classes scheduled for today.\nEnjoy your free time!',
        onEmptyActionPressed: controller.refreshSchedules,
        onErrorRetry: () =>
            controller.todaySchedulesPagingController.refresh(),
      ),
    );
  }

  Widget _buildAllSchedules(HomeController controller) {
    return PagedSliverList<int, ScheduleModel>(
      key: const ValueKey('all_schedules'),
      pagingController: controller.allSchedulesPagingController,
      builderDelegate: PaginationUtils.getCommonBuilderDelegate<ScheduleModel>(
        itemBuilder: (context, schedule, index) => Padding(
          padding: EdgeInsets.fromLTRB(16, index == 0 ? 16 : 0, 16, 12),
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
        onEmptyActionPressed: controller.refreshSchedules,
        onErrorRetry: () =>
            controller.allSchedulesPagingController.refresh(),
      ),
    );
  }
}
