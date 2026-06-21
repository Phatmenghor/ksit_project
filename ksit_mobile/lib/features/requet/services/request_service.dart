// lib/features/request/services/request_service.dart

import 'package:get/get.dart';
import 'package:ksit_mobile/core/services/api_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import '../models/request_model.dart';

class RequestService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  /// Get paginated requests with optional status filter
  Future<RequestPaginatedData> getRequests({
    RequestStatus? status,
    int pageNo = 1,
    int pageSize = 10,
  }) async {
    try {
      final requestData = <String, dynamic>{
        'pageNo': pageNo,
        'pageSize': pageSize,
      };

      // Add status filter if provided
      if (status != null) {
        requestData['status'] = status.apiValue;
      }

      final response = await _apiService.post(
        '/v1/requests/all/token',
        data: requestData,
      );

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data as Map<String, dynamic>;

        if (responseData['status'] == 'success' &&
            responseData['data'] != null) {
          return RequestPaginatedData.fromJson(responseData['data']);
        } else {
          throw Exception(
              responseData['message'] ?? 'Failed to fetch requests');
        }
      } else {
        throw Exception('Failed to fetch requests: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to fetch requests. Please try again.');
    }
  }

  /// Create a new request
  Future<RequestModel> createRequest(CreateRequestModel request) async {
    try {
      final response = await _apiService.post(
        '/v1/requests',
        data: request.toJson(),
      );

      if ((response.statusCode == 200 || response.statusCode == 201) &&
          response.data != null) {
        final responseData = response.data as Map<String, dynamic>;

        if (responseData['status'] == 'success' &&
            responseData['data'] != null) {
          return RequestModel.fromJson(responseData['data']);
        } else {
          throw Exception(
              responseData['message'] ?? 'Failed to create request');
        }
      } else {
        throw Exception('Failed to create request: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to create request. Please try again.');
    }
  }

  /// Get request by ID (if needed)
  Future<RequestModel> getRequestById(int requestId) async {
    try {
      final response = await _apiService.get('/v1/requests/$requestId');

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data as Map<String, dynamic>;

        if (responseData['status'] == 'success' &&
            responseData['data'] != null) {
          return RequestModel.fromJson(responseData['data']);
        } else {
          throw Exception(responseData['message'] ?? 'Failed to fetch request');
        }
      } else {
        throw Exception('Failed to fetch request: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to fetch request details. Please try again.');
    }
  }
}
