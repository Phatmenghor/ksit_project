// Year Picker Component
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';

class YearPickerWidget extends StatefulWidget {
  final List<int> availableYears;
  final int selectedYear;
  final Function(int) onYearSelected;

  const YearPickerWidget({
    super.key,
    required this.availableYears,
    required this.selectedYear,
    required this.onYearSelected,
  });

  @override
  State<YearPickerWidget> createState() => _YearPickerWidgetState();
}

class _YearPickerWidgetState extends State<YearPickerWidget> {
  late int tempSelectedYear;
  late FixedExtentScrollController scrollController;

  @override
  void initState() {
    super.initState();
    tempSelectedYear = widget.selectedYear;

    // Add "All Academy" option at the beginning
    final allYears = [0, ...widget.availableYears];
    final initialIndex = allYears.indexOf(tempSelectedYear);
    scrollController = FixedExtentScrollController(
        initialItem: initialIndex >= 0 ? initialIndex : 0);
  }

  @override
  void dispose() {
    scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final allYears = [0, ...widget.availableYears];

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
                'Select Academy Year',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              TextButton(
                onPressed: () {
                  widget.onYearSelected(tempSelectedYear);
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
              tempSelectedYear = allYears[index];
            },
            children: allYears.map((year) {
              return Center(
                child: Text(
                  year == 0 ? 'All Academy' : year.toString(),
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
