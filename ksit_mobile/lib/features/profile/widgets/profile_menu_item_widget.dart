// Separate StatelessWidget for ProfileMenuItem
import 'package:flutter/material.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';

class ProfileMenuItemWidget extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final Color? titleColor;
  final Color? iconColor;
  final String? iconUrl;
  final bool showArrow;

  const ProfileMenuItemWidget({
    super.key,
    required this.icon,
    required this.title,
    required this.onTap,
    this.titleColor,
    this.iconColor,
    this.iconUrl,
    this.showArrow = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 1),
      child: Material(
        color: Colors.white,
        child: InkWell(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: showArrow
                  ? const Border(
                      bottom: BorderSide(
                        color: AppColors.border,
                        width: 1,
                      ),
                    )
                  : null,
            ),
            child: Row(
              children: [
                // Icon
                if (iconUrl != null)
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Image.asset(
                      iconUrl!,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) {
                        return Icon(
                          icon,
                          size: 24,
                          color: iconColor ?? AppColors.primary,
                        );
                      },
                    ),
                  )
                else
                  Icon(
                    icon,
                    size: 20,
                    color: iconColor ?? AppColors.primary,
                  ),

                const SizedBox(width: 16),

                // Title
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      color: titleColor ?? AppColors.textPrimary,
                    ),
                  ),
                ),

                // Arrow
                if (showArrow)
                  Icon(
                    Icons.chevron_right,
                    size: 20,
                    color: Colors.grey[400],
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
