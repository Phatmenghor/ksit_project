// lib/features/request/controllers/request_controller.dart

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/core/utils/logger_utils.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/core/utils/validator_utils.dart';
import 'package:ksit_mobile/features/requet/widget/create_request_modal.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_routes.dart';
import '../models/request_model.dart';
import '../services/request_service.dart';

class RequestController extends GetxController {
  final RequestService _requestService = Get.put(RequestService());

  // Pagination
  final PagingController<int, RequestModel> pagingController =
      PagingController(firstPageKey: 1);

  // Observables
  final RxBool isInitialLoading = true.obs;
  final Rx<RequestStatus?> selectedStatus = Rx<RequestStatus?>(null);
  final RxBool isCreating = false.obs;

  // Form controllers for new request
  final titleController = TextEditingController();
  final commentController = TextEditingController();
  final formKey = GlobalKey<FormState>();

  @override
  void onInit() {
    super.onInit();
    _setupPagination();
    _loadInitialData();
  }

  @override
  void onClose() {
    pagingController.dispose();
    titleController.dispose();
    commentController.dispose();
    super.onClose();
  }

  void _setupPagination() {
    pagingController.addPageRequestListener((pageKey) {
      _fetchPage(pageKey);
    });
  }

  Future<void> _loadInitialData() async {
    try {
      isInitialLoading.value = true;
      pagingController.refresh();
    } catch (e) {
      LoggerUtils.error('Error loading initial data', e);
    } finally {
      isInitialLoading.value = false;
    }
  }

  Future<void> _fetchPage(int pageKey) async {
    try {
      LoggerUtils.info(
          'Fetching page $pageKey with status: ${selectedStatus.value?.name ?? 'ALL'}');

      final result = await _requestService.getRequests(
        status: selectedStatus.value,
        pageNo: pageKey,
        pageSize: AppConstants.defaultPageSize,
      );

      final isLastPage = result.last;

      if (isLastPage) {
        pagingController.appendLastPage(result.content);
      } else {
        final nextPageKey = pageKey + 1;
        pagingController.appendPage(result.content, nextPageKey);
      }

      LoggerUtils.info(
          'Page $pageKey loaded with ${result.content.length} requests');
    } catch (e) {
      LoggerUtils.error('Error fetching page $pageKey', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      pagingController.error = errorMessage;
    }
  }

  Future<void> refreshRequests() async {
    try {
      pagingController.refresh();
      LoggerUtils.info('Requests refreshed successfully');
    } catch (e) {
      LoggerUtils.error('Error refreshing requests', e);
    }
  }

  void setStatusFilter(RequestStatus? status) {
    selectedStatus.value = status;
    pagingController.refresh();
    LoggerUtils.info('Status filter set to: ${status?.name ?? 'ALL'}');
  }

  void onRequestTap(RequestModel request) {
    LoggerUtils.info('Request tapped: ${request.id}');
    // Use GoRouter to navigate to detail screen
    Get.context!.push('${AppRoutes.requestDetailRoute}/${request.id}');
  }

  void createNewRequest() {
    clearForm();
    CreateRequestModal.show(Get.context!);
  }

  void clearForm() {
    titleController.clear();
    commentController.clear();
  }

  String? validateTitle(String? value) {
    return ValidationUtils.validateMinLength(value, 3, fieldName: 'Item name');
  }

  String? validateComment(String? value) {
    return null;
  }

  Future<void> submitNewRequest() async {
    if (!formKey.currentState!.validate()) return;

    try {
      isCreating.value = true;

      final createRequest = CreateRequestModel(
        title: titleController.text.trim(),
        requestComment: commentController.text.trim(),
      );

      final newRequest = await _requestService.createRequest(createRequest);

      // Close modal using GoRouter context
      if (Get.context!.canPop()) {
        Get.context!.pop();
      }

      ToastUtils.showSuccess('Request submitted successfully');

      // Refresh the list to show the new request
      pagingController.refresh();
      clearForm();

      LoggerUtils.info('New request created: ${newRequest.title}');
    } catch (e) {
      LoggerUtils.error('Error creating request', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isCreating.value = false;
    }
  }

  void showFilterDialog() {
    Get.dialog(
      AlertDialog(
        title: const Text('Filter Requests'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Select status to filter:'),
            const SizedBox(height: 16),

            // All option
            Obx(() => RadioListTile<RequestStatus?>(
                  title: const Text('All'),
                  value: null,
                  // ignore: deprecated_member_use
                  groupValue: selectedStatus.value,
                  // ignore: deprecated_member_use
                  onChanged: (value) => selectedStatus.value = value,
                )),

            // Status options
            ...RequestStatus.values.map((status) {
              return Obx(() => RadioListTile<RequestStatus?>(
                    title: Text(status.displayName),
                    value: status,
                    // ignore: deprecated_member_use
                    groupValue: selectedStatus.value,
                    // ignore: deprecated_member_use
                    onChanged: (value) => selectedStatus.value = value,
                  ));
            }),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              if (Get.context!.canPop()) {
                Get.context!.pop();
              }
            },
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (Get.context!.canPop()) {
                Get.context!.pop();
              }
              pagingController.refresh();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }

  // Get available status filters for UI
  List<RequestStatus> get availableStatusFilters => RequestStatus.values;

  // Check if request can be edited (only pending requests)
  bool canEditRequest(RequestModel request) {
    return request.status == RequestStatus.pending;
  }

  // Get status color for UI
  Color getStatusColor(RequestStatus status) {
    switch (status) {
      case RequestStatus.pending:
        return Colors.orange;
      case RequestStatus.accepted:
        return Colors.blue;
      case RequestStatus.done:
        return Colors.green;
      case RequestStatus.rejected:
        return Colors.red;
      case RequestStatus.return_:
        return Colors.purple;
    }
  }

  // Get status icon for UI
  IconData getStatusIcon(RequestStatus status) {
    switch (status) {
      case RequestStatus.pending:
        return Icons.pending_outlined;
      case RequestStatus.accepted:
        return Icons.check_circle_outline;
      case RequestStatus.done:
        return Icons.done_all_outlined;
      case RequestStatus.rejected:
        return Icons.cancel_outlined;
      case RequestStatus.return_:
        return Icons.keyboard_return_outlined;
    }
  }
}
