// lib/features/auth/services/auth_service.dart
import 'package:get/get.dart';
import 'package:ksit_mobile/core/services/api_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/features/auth/models/change_password_request_models.dart';
import 'package:ksit_mobile/features/auth/models/change_password_response_model.dart';
import 'package:ksit_mobile/features/auth/models/login_request_model.dart';
import 'package:ksit_mobile/features/auth/models/login_response_model.dart';

class AuthService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  /// Login user with email and password
  Future<LoginResponseModel> login(LoginRequestModel request) async {
    try {
      final response = await _apiService.post(
        '/v1/auth/login',
        data: request.toJson(),
      );

      // Check if response data contains the expected structure
      if (response.statusCode == 200) {
        final responseData = response.data as Map<String, dynamic>;

        if (responseData['data'] != null) {
          final loginResponse =
              LoginResponseModel.fromJson(responseData['data']);
          return loginResponse;
        } else {
          throw Exception('Invalid response format: missing data field');
        }
      } else {
        throw Exception('Login failed with status: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(e, 'Login failed. Please try again.');
    }
  }

  /// Logout user
  Future<Map<String, dynamic>> logout() async {
    try {
      final response = await _apiService.post('/v1/auth/logout');

      if (response.statusCode == 200) {
        return response.data ?? {'message': 'Logged out successfully'};
      } else {
        throw Exception('Logout failed with status: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(e, 'Logout failed. Please try again.');
    }
  }

  /// Get user profile

  Future<Map<String, dynamic>> deleteAccount() async {
    try {
      final response = await _apiService.post('/v1/auth/delete-account/token');

      if (response.statusCode == 200) {
        return {'message': 'Account deleted successfully'};
      } else {
        throw Exception(
            'Delete account failed with status: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Delete account failed. Please try again.');
    }
  }

  Future<ChangePasswordResponse> changePassword(
      ChangePasswordRequest request) async {
    try {
      final response = await _apiService.post(
        '/v1/auth/change-password',
        data: request.toJson(),
      );

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        return ChangePasswordResponse(
          status: responseData['status'] ?? 'success',
          message: responseData['message'] ?? 'Password changed successfully',
        );
      } else {
        throw Exception('Failed to change password: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to change password. Please try again.');
    }
  }
}
