// lib/features/request/widgets/request_item_widget.dart

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ksit_mobile/core/constants/app_image.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/date_time_formatter.dart';
import '../controllers/request_controller.dart';
import '../models/request_model.dart';

class RequestItemWidget extends StatelessWidget {
  final RequestModel request;
  final VoidCallback? onTap;

  const RequestItemWidget({
    super.key,
    required this.request,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<RequestController>();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(4),
            border: BoxBorder.all(
              width: 1,
              color: AppColors.border,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(AppConstants.defaultPadding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Request #${request.id}',
                            style: const TextStyle(
                              fontSize: 10,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            DateTimeFormatter.formatDateTime(request.createdAt),
                            style: TextStyle(
                              fontSize: 10,
                              color: AppColors.textPrimary.withValues(alpha: 0.5),
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),

                    // Status Badge
                    _buildStatusBadge(controller),
                  ],
                ),
                const SizedBox(
                  height: 6,
                ),
                const Divider(
                  color: AppColors.border,
                ),
                const SizedBox(
                  height: 6,
                ),
                Row(
                  children: [
                    SizedBox(
                      width: 20,
                      height: 20,
                      child: Image.asset(
                        AppImages.arrowRequest,
                      ),
                    ),
                    const SizedBox(width: 8), // Spacing between image and text
                    Expanded(
                      child: Text(
                        request.title,
                        maxLines: 1,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textPrimary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(RequestController controller) {
    final statusColor = controller.getStatusColor(request.status);

    return Row(
      children: [
        Text(
          request.status.displayName.toUpperCase(),
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: statusColor,
            decoration: TextDecoration.underline,
            textBaseline: TextBaseline.alphabetic,
            decorationColor: statusColor,
          ),
        ),
        const SizedBox(width: 4), // Small spacing between text and icon
        Icon(
          Icons.arrow_forward_ios,
          size: 12,
          color: AppColors.textPrimary.withValues(alpha: 0.5),
        ),
      ],
    );
  }
}
