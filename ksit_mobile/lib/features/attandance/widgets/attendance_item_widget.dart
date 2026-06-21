// lib/features/attendance/widgets/attendance_item_widget.dart
import 'package:flutter/material.dart';
import 'package:ksit_mobile/core/config/app_config.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/core/constants/app_image.dart';
import 'package:ksit_mobile/features/attandance/models/attendance_models.dart';

class AttendanceItemWidget extends StatelessWidget {
  final AttendanceHistoryModel attendance;
  final VoidCallback? onTap;

  const AttendanceItemWidget({
    super.key,
    required this.attendance,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _buildProfileAvatar(attendance.departmentImageUrl),

                  const SizedBox(width: 12),

                  // Course Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Class ${attendance.displayClassCode}',
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${attendance.displayDay} (${attendance.displayStartTime} - ${attendance.displayEndTime})',
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Status Badge
                  _buildStatusBadge(),

                  const SizedBox(width: 8),

                  // Arrow Icon
                  Icon(
                    Icons.chevron_right,
                    size: 24,
                    color: Colors.black.withAlpha(128),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Course Name
              Text(
                attendance.displayCourseName,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.primary,
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              const SizedBox(height: 8),

              const Divider(
                color: AppColors.border,
                thickness: 0.5,
              ),

              const SizedBox(height: 8),

              // Bottom Row with Teacher and Room
              Row(
                children: [
                  // Teacher Info
                  Expanded(
                    child: Row(
                      children: [
                        Image.asset(
                          AppImages.person,
                          width: 16,
                          height: 16,
                          fit: BoxFit.cover,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            attendance.displayTeacherName,
                            style: const TextStyle(
                              fontSize: 10,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(width: 16),

                  // Room Info
                  Row(
                    children: [
                      Image.asset(
                        AppImages.pin,
                        width: 16,
                        height: 16,
                        fit: BoxFit.cover,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        attendance.displayRoomName,
                        style: const TextStyle(
                          fontSize: 10,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              // Additional information if needed
              if (attendance.recordedTime != null &&
                  attendance.recordedTime!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  'Recorded: ${attendance.displayRecordedTime}',
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],

              // Comment if available
              if (attendance.comment != null &&
                  attendance.comment!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.border.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'Note: ${attendance.comment}',
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppColors.textSecondary,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileAvatar(String? imageUrl) {
    return imageUrl != null && imageUrl.isNotEmpty
        ? ClipOval(
            child: Image.network(
              AppConfig.baseImageUrl + imageUrl,
              width: 36,
              height: 36,
              fit: BoxFit.cover, // This ensures image fills the circle
              errorBuilder: (context, error, stackTrace) {
                return const Icon(
                  Icons.person,
                  color: AppColors.primary,
                  size: 28,
                );
              },
            ),
          )
        : const Icon(
            Icons.person,
            color: AppColors.primary,
            size: 28,
          );
  }

  Widget _buildStatusBadge() {
    Color backgroundColor;
    Color textColor;
    IconData icon;

    switch (attendance.statusColor) {
      case 'success':
        backgroundColor = AppColors.success.withValues(alpha: 0.1);
        textColor = AppColors.success;
        icon = Icons.check_circle;
        break;
      case 'error':
        backgroundColor = AppColors.error.withValues(alpha: 0.1);
        textColor = AppColors.error;
        icon = Icons.cancel;
        break;
      case 'warning':
        backgroundColor = AppColors.warning.withValues(alpha: 0.1);
        textColor = AppColors.warning;
        icon = Icons.warning;
        break;
      case 'info':
        backgroundColor = AppColors.info.withValues(alpha: 0.1);
        textColor = AppColors.info;
        icon = Icons.info;
        break;
      default:
        backgroundColor = AppColors.textSecondary.withValues(alpha: 0.1);
        textColor = AppColors.textSecondary;
        icon = Icons.help;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: textColor.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 12,
            color: textColor,
          ),
          const SizedBox(width: 4),
          Text(
            attendance.displayStatus.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
