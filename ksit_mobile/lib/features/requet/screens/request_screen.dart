// lib/features/request/screens/request_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/core/constants/app_constants.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/features/requet/controllers/request_controller.dart';
import 'package:ksit_mobile/features/requet/models/request_model.dart';
import 'package:ksit_mobile/features/requet/widget/request_item_widget.dart';
import 'package:ksit_mobile/shared/widgets/loading_widget.dart';

class RequestScreen extends StatelessWidget {
  const RequestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final requestController = Get.put(RequestController());

    return Scaffold(
      backgroundColor: AppColors.body,
      body: Obx(() {
        if (requestController.isInitialLoading.value) {
          return Column(
            children: [
              _buildGradientHeader(context),
              const Expanded(
                  child:
                      LoadingWidget(message: 'Loading requests...', overlay: false)),
            ],
          );
        }

        return Column(
          children: [
            _buildGradientHeader(context),

            // Filter chips
            _buildFilterChips(requestController),

            // List
            Expanded(
              child: RefreshIndicator(
                onRefresh: requestController.refreshRequests,
                color: AppColors.primary,
                child: PagedListView<int, RequestModel>(
                  pagingController: requestController.pagingController,
                  padding: const EdgeInsets.all(AppConstants.defaultPadding),
                  builderDelegate:
                      PagedChildBuilderDelegate<RequestModel>(
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
                                AppColors.primary),
                          ),
                        ),
                      ),
                    ),
                    noItemsFoundIndicatorBuilder: (context) =>
                        _buildEmptyState(requestController),
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
        elevation: 3,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  // ─── Gradient header ─────────────────────────────────────────────────────

  Widget _buildGradientHeader(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryAccent],
        ),
      ),
      child: const SafeArea(
        bottom: false,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Row(
            children: [
              SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Requests',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Submit and track your requests to admin',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white70,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 52),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Filter chips ─────────────────────────────────────────────────────────

  Widget _buildFilterChips(RequestController controller) {
    return Container(
      height: 52,
      color: Colors.white,
      child: Obx(() => SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildChip(
                  'All',
                  controller.selectedStatus.value == null,
                  () => controller.setStatusFilter(null),
                ),
                ...RequestStatus.values.map((status) => Padding(
                      padding: const EdgeInsets.only(left: 8),
                      child: _buildChip(
                        status.displayName,
                        controller.selectedStatus.value == status,
                        () => controller.setStatusFilter(status),
                      ),
                    )),
              ],
            ),
          )),
    );
  }

  Widget _buildChip(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        height: 32,
        margin: const EdgeInsets.symmetric(vertical: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : AppColors.primary.withValues(alpha: 0.35),
            width: 1.5,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.25),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  )
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.primary,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  // ─── Empty + error ────────────────────────────────────────────────────────

  Widget _buildEmptyState(RequestController controller) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.inbox_outlined,
                size: 40, color: AppColors.primary),
          ),
          const SizedBox(height: 16),
          const Text(
            'No Requests Yet',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Tap the + button to submit your first request.',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
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
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              const Text(
                'Something went wrong',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary),
              ),
              const SizedBox(height: 6),
            ],
            Text(
              isNewPage ? 'Failed to load more requests' : error,
              style: const TextStyle(
                  fontSize: 13, color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh, size: 16),
              label: Text(isNewPage ? 'Retry' : 'Try Again'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(6)),
                elevation: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
