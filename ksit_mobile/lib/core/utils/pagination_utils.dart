// lib/core/utils/pagination_utils.dart
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../../shared/widgets/loading_widget.dart';
import '../../shared/widgets/empty_state_widget.dart';
import 'ui_utils.dart';

class PaginationUtils {
  // Private constructor to prevent instantiation
  PaginationUtils._();

  /// Setup pagination controller with common configuration
  static void setupPagingController<T>({
    required PagingController<int, T> controller,
    required Future<void> Function(int pageKey) fetchPage,
    int firstPageKey = 1,
  }) {
    controller.addPageRequestListener(fetchPage);
  }

  /// Handle API response for pagination
  static void handlePaginationResponse<T>({
    required PagingController<int, T> controller,
    required List<T> items,
    required int pageKey,
    required bool isLastPage,
    int? totalElements,
  }) {
    if (isLastPage) {
      controller.appendLastPage(items);
    } else {
      final nextPageKey = pageKey + 1;
      controller.appendPage(items, nextPageKey);
    }
  }

  /// Handle pagination error
  static void handlePaginationError<T>({
    required PagingController<int, T> controller,
    required dynamic error,
  }) {
    controller.error = error.toString();
  }

  /// Build common error indicator
  static Widget buildErrorIndicator({
    required String error,
    required VoidCallback onRetry,
    bool isNewPage = false,
  }) {
    return UIUtils.buildErrorWidget(
      title: isNewPage ? 'Failed to load more' : 'Something went wrong',
      message: error,
      actionText: isNewPage ? 'Retry' : 'Try Again',
      onActionPressed: onRetry,
      isNewPage: isNewPage,
    );
  }

  /// Build common loading indicator
  static Widget buildLoadingIndicator({
    String? message,
    bool isNewPage = false,
  }) {
    if (isNewPage) {
      return Container(
        padding: const EdgeInsets.all(20),
        child: const Center(
          child: SizedBox(
            width: 24,
            height: 24,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          ),
        ),
      );
    }

    return LoadingWidget(
      message: message ?? 'Loading...',
      overlay: false,
    );
  }

  /// Build common empty state indicator
  static Widget buildEmptyStateIndicator({
    String title = 'No items found',
    String message = 'There are no items to display.',
    String? actionText,
    VoidCallback? onActionPressed,
    IconData? icon,
  }) {
    return EmptyStateWidget(
      icon: icon ?? Icons.inbox_outlined,
      title: title,
      message: message,
      actionText: actionText,
      onActionPressed: onActionPressed,
    );
  }

  /// Get pagination info text
  static String getPaginationInfo({
    required int currentItemCount,
    required int? totalElements,
    required bool isLastPage,
  }) {
    if (totalElements != null) {
      return 'Showing $currentItemCount of $totalElements items';
    } else if (isLastPage) {
      return 'Showing all $currentItemCount items';
    } else {
      return 'Showing $currentItemCount items';
    }
  }

  /// Calculate page number from item index
  static int getPageFromIndex(int index, int pageSize) {
    return (index / pageSize).floor() + 1;
  }

  /// Calculate starting index for a page
  static int getStartingIndex(int pageKey, int pageSize) {
    return (pageKey - 1) * pageSize;
  }

  /// Check if should trigger next page load
  static bool shouldLoadNextPage({
    required int currentIndex,
    required int totalItems,
    int threshold = 3,
  }) {
    return currentIndex >= totalItems - threshold;
  }

  /// Build pagination controls for manual pagination
  static Widget buildPaginationControls({
    required int currentPage,
    required int totalPages,
    required Function(int) onPageChanged,
    int maxVisiblePages = 5,
  }) {
    if (totalPages <= 1) return const SizedBox.shrink();

    final startPage = (currentPage - maxVisiblePages ~/ 2).clamp(1, totalPages);
    final endPage = (startPage + maxVisiblePages - 1).clamp(1, totalPages);

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Previous button
        IconButton(
          onPressed:
              currentPage > 1 ? () => onPageChanged(currentPage - 1) : null,
          icon: const Icon(Icons.chevron_left),
        ),

        // Page numbers
        ...List.generate(endPage - startPage + 1, (index) {
          final pageNum = startPage + index;
          final isSelected = pageNum == currentPage;

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: GestureDetector(
              onTap: () => onPageChanged(pageNum),
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.transparent,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.border,
                  ),
                ),
                child: Center(
                  child: Text(
                    pageNum.toString(),
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ),
          );
        }),

        // Next button
        IconButton(
          onPressed: currentPage < totalPages
              ? () => onPageChanged(currentPage + 1)
              : null,
          icon: const Icon(Icons.chevron_right),
        ),
      ],
    );
  }

  /// Build load more button
  static Widget buildLoadMoreButton({
    required VoidCallback onPressed,
    required bool isLoading,
    String text = 'Load More',
  }) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Center(
        child: SizedBox(
          width: 120,
          child: ElevatedButton(
            onPressed: isLoading ? null : onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: isLoading
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : Text(text),
          ),
        ),
      ),
    );
  }

  /// Dispose pagination controller safely
  static void disposePagingController<T>(PagingController<int, T>? controller) {
    controller?.dispose();
  }

  /// Refresh pagination controller safely
  static void refreshPagingController<T>(PagingController<int, T>? controller) {
    controller?.refresh();
  }

  /// Clear pagination controller safely
  static void clearPagingController<T>(PagingController<int, T>? controller) {
    controller?.itemList?.clear();
    controller?.nextPageKey = 1;
  }

  /// Get common paginated builder delegate
  static PagedChildBuilderDelegate<T> getCommonBuilderDelegate<T>({
    required Widget Function(BuildContext, T, int) itemBuilder,
    String? loadingMessage,
    String? emptyTitle,
    String? emptyMessage,
    String? emptyActionText,
    VoidCallback? onEmptyActionPressed,
    VoidCallback? onErrorRetry,
  }) {
    return PagedChildBuilderDelegate<T>(
      itemBuilder: itemBuilder,
      firstPageErrorIndicatorBuilder: (context) => buildErrorIndicator(
        error: 'Failed to load data',
        onRetry: onErrorRetry ?? () {},
      ),
      newPageErrorIndicatorBuilder: (context) => buildErrorIndicator(
        error: 'Failed to load more data',
        onRetry: onErrorRetry ?? () {},
        isNewPage: true,
      ),
      firstPageProgressIndicatorBuilder: (context) => buildLoadingIndicator(
        message: loadingMessage,
      ),
      newPageProgressIndicatorBuilder: (context) => buildLoadingIndicator(
        isNewPage: true,
      ),
      noItemsFoundIndicatorBuilder: (context) => buildEmptyStateIndicator(
        title: emptyTitle ?? 'No items found',
        message: emptyMessage ?? 'There are no items to display.',
        actionText: emptyActionText,
        onActionPressed: onEmptyActionPressed,
      ),
    );
  }
}
