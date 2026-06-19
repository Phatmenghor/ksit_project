// lib/features/profile/services/profile_service.dart
import 'package:get/get.dart';
import 'package:ksit_mobile/core/services/api_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/features/profile/models/student_profile_model.dart';
import 'package:ksit_mobile/features/profile/models/staff_profile_model.dart';

class ProfileService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  /// Get student profile by token
  Future<StudentProfileModel> getStudentProfile() async {
    try {
      final response = await _apiService.post('/v1/auth/student/token');

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        if (responseData['status'] == 'success' &&
            responseData['data'] != null) {
          return StudentProfileModel.fromJson(responseData['data']);
        } else {
          throw Exception(
              'API Error: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception(
            'Failed to fetch student profile: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to fetch student profile. Please try again.');
    }
  }

  /// Get staff profile by token
  Future<StaffProfileModel> getStaffProfile() async {
    try {
      final response = await _apiService.post('/v1/auth/staff/token');

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        if (responseData['status'] == 'success' &&
            responseData['data'] != null) {
          return StaffProfileModel.fromJson(responseData['data']);
        } else {
          throw Exception(
              'API Error: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception(
            'Failed to fetch staff profile: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to fetch staff profile. Please try again.');
    }
  }

  /// Update student profile
  Future<StudentProfileModel> updateStudentProfile(
      int studentId, Map<String, dynamic> updateData) async {
    try {
      final response =
          await _apiService.put('/v1/students/$studentId', data: updateData);

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        if (responseData['status'] == 'success' &&
            responseData['data'] != null) {
          return StudentProfileModel.fromJson(responseData['data']);
        } else {
          throw Exception(
              'API Error: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception(
            'Failed to update student profile: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to update student profile. Please try again.');
    }
  }

  /// Update staff profile
  Future<StaffProfileModel> updateStaffProfile(
      int staffId, Map<String, dynamic> updateData) async {
    try {
      final response =
          await _apiService.put('/v1/staff/$staffId', data: updateData);

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        if (responseData['status'] == 'success' &&
            responseData['data'] != null) {
          return StaffProfileModel.fromJson(responseData['data']);
        } else {
          throw Exception(
              'API Error: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception(
            'Failed to update staff profile: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to update staff profile. Please try again.');
    }
  }

  /// Upload profile image (if needed in future)
  Future<String> uploadProfileImage(String imagePath) async {
    try {
      final response = await _apiService.uploadFile(
        '/v1/upload/profile-image',
        imagePath,
        fileName: 'profile_image.jpg',
      );

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        if (responseData['status'] == 'success' &&
            responseData['data'] != null) {
          return responseData['data']['url'] as String;
        } else {
          throw Exception(
              'API Error: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception(
            'Failed to upload profile image: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to upload profile image. Please try again.');
    }
  }

  /// Update staff profile by token
  Future<StaffProfileModel> updateStaffProfileByToken(
      Map<String, dynamic> updateData) async {
    try {
      final response =
          await _apiService.put('/v1/staff/token', data: updateData);

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        if (responseData['data'] != null) {
          return StaffProfileModel.fromJson(responseData['data']);
        } else {
          throw Exception(
              'API Error: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception(
            'Failed to update staff profile: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to update staff profile. Please try again.');
    }
  }

  /// Update staff profile by token
  Future<StudentProfileModel> updateStudentProfileByToken(
      Map<String, dynamic> updateData) async {
    try {
      final response =
          await _apiService.put('/v1/students/token', data: updateData);

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        if (responseData['data'] != null) {
          return StudentProfileModel.fromJson(responseData['data']);
        } else {
          throw Exception(
              'API Error: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception(
            'Failed to update student profile: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to update student profile. Please try again.');
    }
  }
}
