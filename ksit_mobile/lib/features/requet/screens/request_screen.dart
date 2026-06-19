// lib/features/request/screens/request_screen.dart

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/features/requet/widget/request_item_widget.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../controllers/request_controller.dart';
import '../models/request_model.dart';

class RequestScreen extends StatelessWidget {
  const RequestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final requestController = Get.put(RequestController());

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Request',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
        ),
        centerTitle: false,
        backgroundColor: AppColors.primary,
      ),
      body: Obx(() {
        if (requestController.isInitialLoading.value) {
          return const LoadingWidget(
            message: 'Loading requests...',
            overlay: false,
          );
        }

        return Column(
          children: [
            // Description Header
            Container(
              width: double.infinity,
              color: AppColors.primary,
              padding: const EdgeInsets.fromLTRB(16, 0, 0, 16),
              child: Text(
                'Students can send item requests to the admin',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 12,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),

            // Filter chips
            _buildFilterChips(requestController),

            // Requests list
            Expanded(
              child: RefreshIndicator(
                onRefresh: requestController.refreshRequests,
                child: PagedListView<int, RequestModel>(
                  pagingController: requestController.pagingController,
                  padding: const EdgeInsets.all(AppConstants.defaultPadding),
                  builderDelegate: PagedChildBuilderDelegate<RequestModel>(
                    itemBuilder: (context, request, index) => RequestItemWidget(
                      request: request,
                      onTap: () => requestController.onRequestTap(request),
                    ),
                    firstPageErrorIndicatorBuilder: (context) =>
                        _buildErrorWidget(
                      requestController.pagingController.error.toString(),
                      () => requestController.pagingController.refresh(),
                    ),
                    newPageErrorIndicatorBuilder: (context) =>
                        _buildErrorWidget(
                      requestController.pagingController.error.toString(),
                      () => requestController.pagingController
                          .retryLastFailedRequest(),
                      isNewPage: true,
                    ),
                    firstPageProgressIndicatorBuilder: (context) =>
                        const LoadingWidget(
                      message: 'Loading requests...',
                      overlay: false,
                    ),
                    newPageProgressIndicatorBuilder: (context) => const Padding(
                      padding: EdgeInsets.all(16),
                      child: Center(
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                    ),
                    noItemsFoundIndicatorBuilder: (context) => Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              color: AppColors.iconSecondary.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.inbox_outlined,
                              size: 60,
                              color: AppColors.iconSecondary,
                            ),
                          ),
                          const SizedBox(height: 24),
                          const Text(
                            'No Request',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'You haven\'t submitted any requests yet.',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      }),
      floatingActionButton: FloatingActionButton(
        onPressed: requestController.createNewRequest,
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildFilterChips(RequestController controller) {
    return Container(
      height: 60,
      color: AppColors.body,
      child: Obx(() {
        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              // All filter
              _buildScrollableFilterChip(
                'All',
                controller.selectedStatus.value == null,
                () => controller.setStatusFilter(null),
              ),

              const SizedBox(width: 8),

              // Status filters
              ...RequestStatus.values.map((status) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: _buildScrollableFilterChip(
                    status.displayName,
                    controller.selectedStatus.value == status,
                    () => controller.setStatusFilter(status),
                  ),
                );
              }),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildScrollableFilterChip(
      String text, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 36,
        margin: const EdgeInsets.symmetric(vertical: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16), // Dynamic padding
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(4), // More rounded for chip look
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : AppColors.primary.withOpacity(0.3),
            width: 1.5,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          text,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.primary,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }

  Widget _buildErrorWidget(String error, VoidCallback onRetry,
      {bool isNewPage = false}) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (!isNewPage) ...[
              const Icon(
                Icons.error_outline,
                size: 64,
                color: AppColors.error,
              ),
              const SizedBox(height: 16),
              const Text(
                'Something went wrong',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
            ],
            Text(
              isNewPage ? 'Failed to load more requests' : error,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: Text(isNewPage ? 'Retry' : 'Try Again'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
