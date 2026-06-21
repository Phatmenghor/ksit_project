// lib/features/profile/widgets/gender_select_field_widget.dart
import 'package:flutter/material.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';

class GenderSelectionField extends StatelessWidget {
  final GenderEnum? selectedGender;
  final Function(GenderEnum?) onChanged;
  final String? Function(GenderEnum?)? validator;
  final String hint;
  final Color fillColor;
  final BorderRadius borderRadius;
  final Map<GenderEnum, String>? customGenderOptions;

  const GenderSelectionField({
    super.key,
    required this.selectedGender,
    required this.onChanged,
    this.validator,
    this.hint = 'ជ្រើសរើសភេទ',
    this.fillColor = Colors.white,
    this.borderRadius = const BorderRadius.all(Radius.circular(4)),
    this.customGenderOptions,
  });

  // Default gender options in Khmer
  static const Map<GenderEnum, String> _defaultGenderOptions = {
    GenderEnum.male: 'ប្រុស',
    GenderEnum.female: 'ស្រី',
    GenderEnum.other: 'ផ្សេងៗ',
  };

  Map<GenderEnum, String> get _genderOptions =>
      customGenderOptions ?? _defaultGenderOptions;

  @override
  Widget build(BuildContext context) {
    return FormField<GenderEnum>(
      validator: validator,
      builder: (FormFieldState<GenderEnum> state) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GestureDetector(
              onTap: () => _showGenderBottomSheet(context),
              child: Container(
                decoration: BoxDecoration(
                  color: fillColor,
                  borderRadius: borderRadius,
                  border: Border.all(
                    color: state.hasError ? Colors.red : AppColors.border,
                    width: 1,
                  ),
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 12,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      selectedGender != null
                          ? _genderOptions[selectedGender!]!
                          : hint,
                      style: TextStyle(
                        fontSize: 14,
                        color: selectedGender != null
                            ? AppColors.textPrimary
                            : Colors.grey[600],
                      ),
                    ),
                    const Icon(
                      Icons.keyboard_arrow_down,
                      color: Colors.grey,
                    ),
                  ],
                ),
              ),
            ),
            if (state.hasError)
              Padding(
                padding: const EdgeInsets.only(top: 4, left: 12),
                child: Text(
                  state.errorText!,
                  style: const TextStyle(
                    color: Colors.red,
                    fontSize: 12,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  void _showGenderBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (BuildContext context) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              // Header
              Container(
                padding: const EdgeInsets.all(20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'ជ្រើសរើសភេទ',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(
                          Icons.close,
                          size: 20,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Gender options
              ..._genderOptions.entries.map((entry) {
                final isSelected = selectedGender == entry.key;
                return InkWell(
                  onTap: () {
                    onChanged(entry.key);
                    Navigator.pop(context);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 16,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary.withValues(alpha: 0.1)
                          : Colors.transparent,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            entry.value,
                            style: TextStyle(
                              fontSize: 16,
                              color: isSelected
                                  ? AppColors.primary
                                  : AppColors.textPrimary,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                            ),
                          ),
                        ),
                        if (isSelected)
                          const Icon(
                            Icons.check_circle,
                            color: AppColors.primary,
                            size: 20,
                          ),
                      ],
                    ),
                  ),
                );
              }),

              // Bottom padding
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }
}
