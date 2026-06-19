import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';

class LoadingWidget extends StatelessWidget {
  final String? message;
  final double size;
  final Color? color;
  final bool overlay;

  const LoadingWidget({
    super.key,
    this.message,
    this.size = 24,
    this.color,
    this.overlay = true,
  });

  @override
  Widget build(BuildContext context) {
    final loadingContent = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: size,
          height: size,
          child: CircularProgressIndicator(
            strokeWidth: 3,
            valueColor: AlwaysStoppedAnimation<Color>(
              color ?? AppColors.primary,
            ),
          ),
        ),
        if (message != null) ...[
          const SizedBox(height: 16),
          Text(
            message!,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );

    if (overlay) {
      return Container(
        color: AppColors.overlayLight,
        child: Center(child: loadingContent),
      );
    }

    return Center(child: loadingContent);
  }
}
