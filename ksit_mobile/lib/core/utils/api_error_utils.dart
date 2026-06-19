// lib/core/utils/api_error_utils.dart
import 'package:dio/dio.dart';

class ApiErrorUtils {
  /// Extract clean error message from API response
  static String extractApiErrorMessage(dynamic error) {
    try {
      // Handle DioException (API errors)
      if (error is DioException) {
        final response = error.response;

        // Check if error.response && error.response.data && error.response.data.message
        if (response != null &&
            response.data != null &&
            response.data is Map<String, dynamic>) {
          final data = response.data as Map<String, dynamic>;

          // Get message from API response
          if (data['message'] != null) {
            return data['message'].toString();
          }

          // Try other common error fields
          if (data['error'] != null) {
            return data['error'].toString();
          }

          if (data['detail'] != null) {
            return data['detail'].toString();
          }
        }

        // Handle string response data
        if (response != null && response.data is String) {
          return response.data as String;
        }

        // Fallback to HTTP status message
        switch (response?.statusCode) {
          case 400:
            return 'Bad request. Please check your input.';
          case 401:
            return 'Invalid username or password.';
          case 403:
            return 'Access forbidden.';
          case 404:
            return 'Service not available.';
          case 500:
            return 'Server error. Please try again later.';
          default:
            return 'Fail to login. Please try again or contact support.';
        }
      }

      // Handle other exceptions
      final errorString = error.toString();

      // Clean up common exception prefixes
      if (errorString.contains('Exception: ')) {
        return errorString.replaceFirst('Exception: ', '');
      }
      if (errorString.contains('Error: ')) {
        return errorString.replaceFirst('Error: ', '');
      }

      return errorString;
    } catch (e) {
      return 'An unexpected error occurred.';
    }
  }

  /// Throw clean exception with API error message
  static Never throwApiError(dynamic error, [String? fallbackMessage]) {
    final message = extractApiErrorMessage(error);
    throw Exception(
        message.isNotEmpty ? message : (fallbackMessage ?? 'Operation failed'));
  }
}
