// lib/features/home/widget/schedule_filter_widget.dart
import 'package:flutter/material.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/features/home/widget/semester_picker_widget.dart';
import 'package:ksit_mobile/features/home/widget/year_picker_widget.dart';

// Import the new utils
import '../../../core/utils/enums_utils.dart';
import '../../../core/utils/ui_utils.dart';

class ScheduleFilterWidget extends StatelessWidget {
  final List<int> availableYears;
  final int selectedYear;
  final List<Semester> availableSemesters;
  final Semester? selectedSemester;
  final Function(int) onYearChanged;
  final Function(Semester) onSemesterChanged;
  final VoidCallback? onSemesterCleared;
  final VoidCallback? onClearFilters;

  const ScheduleFilterWidget({
    super.key,
    required this.availableYears,
    required this.selectedYear,
    required this.availableSemesters,
    required this.selectedSemester,
    required this.onYearChanged,
    required this.onSemesterChanged,
    this.onSemesterCleared,
    this.onClearFilters,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(left: 16, right: 16, top: 32, bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        children: [
          // Academy Year Filter
          Expanded(
            child: _buildFilterCard(
              title: '',
              value: _getYearDisplayText(),
              icon: Icons.filter_alt_rounded,
              hasSelection: selectedYear != 0,
              onTap: () => _showYearPicker(context),
              onClear: selectedYear != 0 ? () => onYearChanged(0) : null,
            ),
          ),

          const SizedBox(width: 12),

          // Semester Filter
          Expanded(
            child: _buildFilterCard(
              title: '',
              value: _getSemesterDisplayText(),
              icon: Icons.filter_alt_rounded,
              hasSelection: selectedSemester != null,
              onTap: () => _showSemesterPicker(context),
              onClear: selectedSemester != null ? onSemesterCleared : null,
            ),
          ),
        ],
      ),
    );
  }

  String _getYearDisplayText() {
    if (selectedYear == 0) {
      return 'All Academy';
    }
    return selectedYear.toString();
  }

  String _getSemesterDisplayText() {
    if (selectedSemester == null) {
      return 'All Semester';
    }
    return selectedSemester!.displayName;
  }

  Widget _buildFilterCard({
    required String title,
    required String value,
    required IconData icon,
    required bool hasSelection,
    required VoidCallback onTap,
    VoidCallback? onClear,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 16,
              color: AppColors.textSecondary,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: RichText(
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: title,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    TextSpan(
                      text: value,
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textPrimary.withValues(alpha: 0.8),
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 4),
            if (hasSelection && onClear != null)
              GestureDetector(
                onTap: onClear,
                child: const Icon(
                  Icons.clear,
                  size: 16,
                  color: AppColors.error,
                ),
              )
            else
              const Icon(
                Icons.keyboard_arrow_down,
                size: 16,
                color: AppColors.textSecondary,
              ),
          ],
        ),
      ),
    );
  }

  void _showYearPicker(BuildContext context) {
    // Use UIUtils for bottom sheet
    UIUtils.showCustomBottomSheet(
      height: 300,
      child: YearPickerWidget(
        availableYears: availableYears,
        selectedYear: selectedYear,
        onYearSelected: onYearChanged,
      ),
    );
  }

  void _showSemesterPicker(BuildContext context) {
    // Use UIUtils for bottom sheet
    UIUtils.showCustomBottomSheet(
      height: 300,
      child: SemesterPickerWidget(
        availableSemesters: availableSemesters,
        selectedSemester: selectedSemester,
        onSemesterSelected: onSemesterChanged,
        onSemesterCleared: onSemesterCleared,
      ),
    );
  }
}
