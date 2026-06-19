// lib/features/request/screens/request_detail_screen.dart

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/date_time_formatter.dart';
import '../../../core/utils/api_error_utils.dart';
import '../../../core/utils/logger_utils.dart';
import '../../../core/utils/toast_utils.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../models/request_model.dart';
import '../services/request_service.dart';

class RequestDetailScreen extends StatefulWidget {
  final int requestId;

  const RequestDetailScreen({
    super.key,
    required this.requestId,
  });

  @override
  State<RequestDetailScreen> createState() => _RequestDetailScreenState();
}

class _RequestDetailScreenState extends State<RequestDetailScreen> {
  final RequestService _requestService = Get.find<RequestService>();

  RequestModel? request;
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _loadRequestDetail();
  }

  Future<void> _loadRequestDetail() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      LoggerUtils.info('Loading request detail for ID: ${widget.requestId}');

      final requestData =
          await _requestService.getRequestById(widget.requestId);

      setState(() {
        request = requestData;
        isLoading = false;
      });

      LoggerUtils.info('Request detail loaded successfully');
    } catch (e) {
      LoggerUtils.error('Error loading request detail', e);
      final error = ApiErrorUtils.extractApiErrorMessage(e);

      setState(() {
        errorMessage = error;
        isLoading = false;
      });

      // Show toast error for refresh attempts
      if (request != null) {
        ToastUtils.showError('Failed to refresh: $error');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: MediaQuery.of(context).padding.top + 16,
              bottom: 20,
            ),
            decoration: const BoxDecoration(
              color: AppColors.primary,
            ),
            child: Row(
              children: [
                // Back Button
                GestureDetector(
                  onTap: () {
                    // Use GoRouter to go back
                    if (context.canPop()) {
                      context.pop();
                    }
                  },
                  child: const Icon(
                    Icons.arrow_back,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 16),

                // Title
                const Expanded(
                  child: Text(
                    'Request Detail',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),

                const SizedBox(width: 8),

                // Info Icon
                const Icon(
                  Icons.description_outlined,
                  color: Colors.white,
                  size: 22,
                ),
              ],
            ),
          ),

          // Content
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    // Initial loading state
    if (isLoading && request == null) {
      return const LoadingWidget(
        message: 'Loading request details...',
        overlay: false,
      );
    }

    // Error state (when no data loaded yet)
    if (errorMessage != null && request == null) {
      return ErrorStateWidget(
        title: 'Failed to load request',
        message: errorMessage!,
        actionText: 'Try Again',
        onActionPressed: _loadRequestDetail,
      );
    }

    // Request not found
    if (request == null) {
      return EmptyStateWidget.error(
        title: 'Request Not Found',
        message: 'The requested item could not be found.',
        actionText: 'Go Back',
        onActionPressed: () {
          if (context.canPop()) {
            context.pop();
          }
        },
      );
    }

    // Content loaded successfully
    return Column(
      children: [
        // Status Bar
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          color: AppColors.primary,
          child: Column(
            children: [
              Divider(
                color: AppColors.white.withOpacity(0.25),
                thickness: 1,
              ),
              const SizedBox(height: 8),
              Container(
                height: 44,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: AppColors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  children: [
                    Text(
                      'Status',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: AppColors.white.withOpacity(0.5),
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      child: Text(
                        request!.status.displayName,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),

        // Scrollable Content with RefreshIndicator
        Expanded(
          child: RefreshIndicator(
            onRefresh: _loadRequestDetail,
            color: AppColors.primary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildDetailSection([
                    _buildDetailRow('Submit Date',
                        DateTimeFormatter.formatDateTime(request!.createdAt)),
                    _buildDetailRow('Item Name', request!.title),
                    _buildDetailRow('Comments', request!.requestComment),
                    _buildDetailRow(
                        'Commend by staff', request?.staffComment ?? 'N/A'),
                    _buildDetailRow(
                        'Staff Action',
                        DateTimeFormatter.formatDateTime(
                            request!.updatedAt ?? request!.createdAt)),
                  ]),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDetailSection(List<Widget> rows) {
    return Column(
      children: rows
          .map((row) => Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: AppColors.border,
                      width: 1,
                    ),
                  ),
                ),
                child: row,
              ))
          .toList(),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 120,
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
        ),
        const SizedBox(width: 16), // Fixed spacing instead of Spacer
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.right, // Right-align the text
            softWrap: true, // Enable text wrapping
            overflow: TextOverflow.visible, // Show full text
          ),
        ),
      ],
    );
  }
}
