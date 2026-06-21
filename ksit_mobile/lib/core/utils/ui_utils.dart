// lib/core/utils/ui_utils.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';

class UIUtils {
  // Private constructor to prevent instantiation
  UIUtils._();

  /// Show confirmation dialog
  static Future<bool?> showConfirmationDialog({
    required String title,
    required String message,
    String confirmText = 'Confirm',
    String cancelText = 'Cancel',
    Color? confirmColor,
    Color? cancelColor,
    bool isDangerous = false,
  }) {
    return Get.dialog<bool>(
      AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            style: TextButton.styleFrom(
              foregroundColor: cancelColor ?? AppColors.textSecondary,
            ),
            child: Text(cancelText),
          ),
          TextButton(
            onPressed: () => Get.back(result: true),
            style: TextButton.styleFrom(
              foregroundColor: confirmColor ??
                  (isDangerous ? AppColors.error : AppColors.primary),
            ),
            child: Text(confirmText),
          ),
        ],
      ),
    );
  }

  /// Show bottom sheet with custom content
  static void showCustomBottomSheet({
    required Widget child,
    double? height,
    bool isScrollControlled = true,
    bool isDismissible = true,
    bool enableDrag = true,
  }) {
    Get.bottomSheet(
      Container(
        height: height ?? Get.height * 0.8,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
        ),
        child: Column(
          children: [
            // Handle
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Expanded(child: child),
          ],
        ),
      ),
      isScrollControlled: isScrollControlled,
      isDismissible: isDismissible,
      enableDrag: enableDrag,
    );
  }

  /// Show loading dialog
  static void showLoadingDialog({
    String message = 'Loading...',
    bool dismissible = false,
  }) {
    Get.dialog(
      AlertDialog(
        content: Row(
          children: [
            const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            const SizedBox(width: 16),
            Expanded(child: Text(message)),
          ],
        ),
      ),
      barrierDismissible: dismissible,
    );
  }

  /// Hide loading dialog
  static void hideLoadingDialog() {
    if (Get.isDialogOpen ?? false) {
      Get.back();
    }
  }

  /// Build error widget
  static Widget buildErrorWidget({
    required String title,
    required String message,
    String? actionText,
    VoidCallback? onActionPressed,
    bool isNewPage = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (!isNewPage) ...[
              const Icon(
                Icons.error_outline_rounded,
                size: 48,
                color: AppColors.error,
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
            ],
            Text(
              message,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            if (actionText != null && onActionPressed != null) ...[
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: onActionPressed,
                icon: const Icon(Icons.refresh_rounded),
                label: Text(actionText),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Build filter chip
  static Widget buildFilterChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    Color? selectedColor,
    Color? unselectedColor,
  }) {
    return Container(
      margin: const EdgeInsets.only(right: 8, top: 8, bottom: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => onTap(),
        backgroundColor: unselectedColor ?? Colors.white,
        selectedColor: (selectedColor ?? AppColors.primary).withValues(alpha: 0.2),
        labelStyle: TextStyle(
          color: isSelected
              ? (selectedColor ?? AppColors.primary)
              : AppColors.textSecondary,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
        side: BorderSide(
          color: isSelected
              ? (selectedColor ?? AppColors.primary)
              : AppColors.border,
        ),
      ),
    );
  }

  /// Build app bar filter button
  static Widget buildAppBarFilterButton({
    required String text,
    required bool isSelected,
    required VoidCallback onTap,
    Color? selectedColor,
    Color? unselectedColor,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 36,
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? (selectedColor ?? AppColors.primary)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: AppColors.textPrimary.withValues(alpha: 0.1),
            width: 1,
          ),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: isSelected
                ? (unselectedColor ?? AppColors.white)
                : AppColors.textPrimary.withValues(alpha: 0.5),
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  /// Build stat card
  static Widget buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppConstants.borderRadius),
          boxShadow: const [
            BoxShadow(
              color: AppColors.shadowLight,
              blurRadius: 4,
              offset: Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  /// Build section header
  static Widget buildSectionHeader({
    required String title,
    String? subtitle,
    Widget? action,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppConstants.defaultPadding,
        vertical: AppConstants.smallPadding,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (action != null) action,
        ],
      ),
    );
  }

  /// Show picker dialog
  static Future<T?> showPickerDialog<T>({
    required String title,
    required List<T> items,
    required String Function(T) itemBuilder,
    T? selectedItem,
    bool allowNull = false,
    String? nullLabel,
  }) {
    return Get.dialog<T>(
      AlertDialog(
        title: Text(title),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView(
            shrinkWrap: true,
            children: [
              if (allowNull)
                ListTile(
                  title: Text(nullLabel ?? 'None'),
                  leading: Radio<T?>(
                    value: null,
                    // ignore: deprecated_member_use
                    groupValue: selectedItem,
                    // ignore: deprecated_member_use
                    onChanged: (value) => Get.back(result: value),
                  ),
                  onTap: () => Get.back(result: null),
                ),
              ...items.map((item) => ListTile(
                    title: Text(itemBuilder(item)),
                    leading: Radio<T>(
                      value: item,
                      // ignore: deprecated_member_use
                      groupValue: selectedItem,
                      // ignore: deprecated_member_use
                      onChanged: (value) => Get.back(result: value),
                    ),
                    onTap: () => Get.back(result: item),
                  )),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  /// Get safe area padding
  static EdgeInsets getSafeAreaPadding(BuildContext context) {
    return MediaQuery.of(context).padding;
  }

  /// Get screen size
  static Size getScreenSize() {
    return Get.size;
  }

  /// Check if device is tablet
  static bool isTablet() {
    final size = Get.size;
    return size.shortestSide >= 600;
  }

  /// Get responsive padding
  static double getResponsivePadding() {
    return isTablet() ? AppConstants.largePadding : AppConstants.defaultPadding;
  }

  /// Show success snackbar
  static void showSuccessSnackbar({
    required String title,
    required String message,
    Duration? duration,
  }) {
    Get.snackbar(
      title,
      message,
      backgroundColor: AppColors.success,
      colorText: Colors.white,
      duration: duration ?? const Duration(seconds: 3),
      snackPosition: SnackPosition.TOP,
      margin: const EdgeInsets.all(AppConstants.defaultPadding),
      borderRadius: AppConstants.borderRadius,
      icon: const Icon(Icons.check_circle, color: Colors.white),
    );
  }

  /// Show error snackbar
  static void showErrorSnackbar({
    required String title,
    required String message,
    Duration? duration,
  }) {
    Get.snackbar(
      title,
      message,
      backgroundColor: AppColors.error,
      colorText: Colors.white,
      duration: duration ?? const Duration(seconds: 4),
      snackPosition: SnackPosition.TOP,
      margin: const EdgeInsets.all(AppConstants.defaultPadding),
      borderRadius: AppConstants.borderRadius,
      icon: const Icon(Icons.error, color: Colors.white),
    );
  }

  /// Show info snackbar
  static void showInfoSnackbar({
    required String title,
    required String message,
    Duration? duration,
  }) {
    Get.snackbar(
      title,
      message,
      backgroundColor: AppColors.info,
      colorText: Colors.white,
      duration: duration ?? const Duration(seconds: 3),
      snackPosition: SnackPosition.TOP,
      margin: const EdgeInsets.all(AppConstants.defaultPadding),
      borderRadius: AppConstants.borderRadius,
      icon: const Icon(Icons.info, color: Colors.white),
    );
  }
}
