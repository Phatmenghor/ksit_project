// Semester Picker Component
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';

class SemesterPickerWidget extends StatefulWidget {
  final List<Semester> availableSemesters;
  final Semester? selectedSemester;
  final Function(Semester) onSemesterSelected;
  final VoidCallback? onSemesterCleared;

  const SemesterPickerWidget({
    super.key,
    required this.availableSemesters,
    required this.selectedSemester,
    required this.onSemesterSelected,
    this.onSemesterCleared,
  });

  @override
  State<SemesterPickerWidget> createState() => _SemesterPickerWidgetState();
}

class _SemesterPickerWidgetState extends State<SemesterPickerWidget> {
  late Semester? tempSelectedSemester;
  late FixedExtentScrollController scrollController;

  @override
  void initState() {
    super.initState();
    tempSelectedSemester = widget.selectedSemester;

    // Find the correct initial index
    int initialIndex = 0; // Default to "All Semester"
    if (widget.selectedSemester != null) {
      // Find the index of the selected semester (add 1 because null is at index 0)
      final semesterIndex =
          widget.availableSemesters.indexOf(widget.selectedSemester!);
      if (semesterIndex >= 0) {
        initialIndex =
            semesterIndex + 1; // +1 because "All Semester" (null) is at index 0
      }
    }

    scrollController = FixedExtentScrollController(initialItem: initialIndex);
  }

  @override
  void dispose() {
    scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final allSemesters = <Semester?>[null, ...widget.availableSemesters];

    return Column(
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            border: Border(
              bottom: BorderSide(color: AppColors.border),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text(
                  'Cancel',
                  style: TextStyle(color: AppColors.error),
                ),
              ),
              const Text(
                'Select Semester',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              TextButton(
                onPressed: () {
                  if (tempSelectedSemester != null) {
                    widget.onSemesterSelected(tempSelectedSemester!);
                  } else {
                    // Clear semester selection
                    widget.onSemesterCleared?.call();
                  }
                  Navigator.pop(context);
                },
                child: const Text(
                  'Done',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),

        // Picker
        Expanded(
          child: CupertinoPicker(
            scrollController: scrollController,
            itemExtent: 40,
            onSelectedItemChanged: (index) {
              tempSelectedSemester = allSemesters[index];
            },
            children: allSemesters.map((semester) {
              return Center(
                child: Text(
                  semester == null ? 'All Semester' : semester.displayName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}
