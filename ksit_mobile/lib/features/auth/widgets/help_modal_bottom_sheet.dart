// lib/shared/widgets/help_modal_bottom_sheet.dart
import 'package:flutter/material.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';

class HelpModalBottomSheet extends StatelessWidget {
  const HelpModalBottomSheet({super.key});

  static void show(BuildContext context) {
    showMaterialModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black54,
      enableDrag: true,
      isDismissible: true,
      builder: (context) => const HelpModalBottomSheet(),
    );
  }

  // Alternative with CupertinoModalBottomSheet for iOS style
  static void showCupertino(BuildContext context) {
    showCupertinoModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black54,
      enableDrag: true,
      builder: (context) => const HelpModalBottomSheet(),
    );
  }

  // Alternative with custom modal
  static void showCustom(BuildContext context) {
    showCustomModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black54,
      enableDrag: true,
      isDismissible: true,
      containerWidget: (context, animation, child) => Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        margin: const EdgeInsets.all(16),
        child: child,
      ),
      builder: (context) => const HelpModalBottomSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Warning Icon
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: AppColors.warning,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.info_outline,
                color: Colors.white,
                size: 32,
              ),
            ),

            const SizedBox(height: 24),

            // Title
            const Text(
              'អំពីការភ្លេចលេខសម្ងាត់!',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Color(0xFF2C3E50),
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 20),

            // Description with orange border
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF8E1),
                border: const Border(
                  left: BorderSide(
                    color: AppColors.warning,
                    width: 4,
                  ),
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'សូមនិស្សិតធ្វើការទាក់ទងទៅកាន់ការិយាល័យសិក្សានិងកិច្ចការនិស្សិតនៃវិទ្យាស្ថានបច្ចេកវិទ្យាកំពង់ស្ពឺដើម្បីបំពេញទម្រង់ស្នើសុំលេខសម្ងាត់សម្រាប់ចូលប្រព័ន្ធ។',
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF2C3E50),
                  height: 1.5,
                ),
                textAlign: TextAlign.left,
              ),
            ),

            const SizedBox(height: 24),

            // Thank you text
            const Text(
              'សូមអរគុណ!',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w400,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 24),

            // Close Button
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.warning,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'បាទ/ចា៎ស',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
