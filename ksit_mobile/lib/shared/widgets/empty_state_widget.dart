import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import 'custom_button.dart';

class EmptyStateWidget extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String? actionText;
  final VoidCallback? onActionPressed;
  final Widget? customAction;
  final Color? iconColor;

  const EmptyStateWidget({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionText,
    this.onActionPressed,
    this.customAction,
    this.iconColor,
  });

  // Predefined empty states
  static Widget noData({
    String title = 'No Data Available',
    String message = 'There is no data to display at the moment.',
    String? actionText,
    VoidCallback? onActionPressed,
  }) {
    return EmptyStateWidget(
      icon: Icons.inbox_outlined,
      title: title,
      message: message,
      actionText: actionText,
      onActionPressed: onActionPressed,
      iconColor: AppColors.iconSecondary,
    );
  }

  static Widget noResults({
    String title = 'No Results Found',
    String message = 'We couldn\'t find any results matching your criteria.',
    String? actionText = 'Clear Filters',
    VoidCallback? onActionPressed,
  }) {
    return EmptyStateWidget(
      icon: Icons.search_off,
      title: title,
      message: message,
      actionText: actionText,
      onActionPressed: onActionPressed,
      iconColor: AppColors.iconSecondary,
    );
  }

  static Widget noConnection({
    String title = 'No Internet Connection',
    String message = 'Please check your internet connection and try again.',
    String actionText = 'Retry',
    VoidCallback? onActionPressed,
  }) {
    return EmptyStateWidget(
      icon: Icons.wifi_off,
      title: title,
      message: message,
      actionText: actionText,
      onActionPressed: onActionPressed,
      iconColor: AppColors.error,
    );
  }

  static Widget error({
    String title = 'Something Went Wrong',
    String message = 'An error occurred while loading the data.',
    String actionText = 'Try Again',
    VoidCallback? onActionPressed,
  }) {
    return EmptyStateWidget(
      icon: Icons.error_outline,
      title: title,
      message: message,
      actionText: actionText,
      onActionPressed: onActionPressed,
      iconColor: AppColors.error,
    );
  }

  static Widget comingSoon({
    String title = 'Coming Soon',
    String message =
        'This feature is under development and will be available soon.',
  }) {
    return EmptyStateWidget(
      icon: Icons.construction_outlined,
      title: title,
      message: message,
      iconColor: AppColors.warning,
    );
  }

  static Widget maintenance({
    String title = 'Under Maintenance',
    String message = 'This service is temporarily unavailable for maintenance.',
    String actionText = 'Check Status',
    VoidCallback? onActionPressed,
  }) {
    return EmptyStateWidget(
      icon: Icons.build_outlined,
      title: title,
      message: message,
      actionText: actionText,
      onActionPressed: onActionPressed,
      iconColor: AppColors.warning,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.largePadding),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: (iconColor ?? AppColors.iconSecondary).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 60,
                color: iconColor ?? AppColors.iconSecondary,
              ),
            ),

            const SizedBox(height: AppConstants.largePadding),

            // Title
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: AppConstants.smallPadding),

            // Message
            Text(
              message,
              style: const TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: AppConstants.largePadding),

            // Action Button
            if (customAction != null)
              customAction!
            else if (actionText != null && onActionPressed != null)
              CustomButton(
                text: actionText!,
                onPressed: onActionPressed,
                type: ButtonType.primary,
                width: 160,
              ),
          ],
        ),
      ),
    );
  }
}

class ErrorStateWidget extends StatelessWidget {
  final String title;
  final String message;
  final String? actionText;
  final VoidCallback? onActionPressed;
  final bool showIcon;

  const ErrorStateWidget({
    super.key,
    required this.title,
    required this.message,
    this.actionText,
    this.onActionPressed,
    this.showIcon = true,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.largePadding),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (showIcon) ...[
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.error_outline,
                  size: 50,
                  color: AppColors.error,
                ),
              ),
              const SizedBox(height: AppConstants.largePadding),
            ],
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppConstants.smallPadding),
            Text(
              message,
              style: const TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            if (actionText != null && onActionPressed != null) ...[
              const SizedBox(height: AppConstants.largePadding),
              CustomButton(
                text: actionText!,
                onPressed: onActionPressed,
                type: ButtonType.primary,
                width: 160,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
