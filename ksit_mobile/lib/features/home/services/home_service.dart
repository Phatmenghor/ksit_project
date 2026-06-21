// lib/features/home/services/home_service.dart
import 'package:get/get.dart';
import 'package:ksit_mobile/core/services/api_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/shared/models/api_response_model.dart';

// Import the new utils
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/core/utils/schedule_utils.dart';

import '../models/schedule_models.dart';

class HomeService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  /// Get my schedules with pagination
  Future<PaginatedResponse<ScheduleModel>> getMySchedules({
    int? academyYear,
    Semester? semester,
    DayOfWeek? dayOfWeek,
    Status status = Status.active,
    int pageNo = 1,
    int pageSize = 10,
  }) async {
    try {
      // Build request data dynamically based on provided parameters
      final Map<String, dynamic> requestData = {
        'status': status.apiValue,
        'pageNo': pageNo,
        'pageSize': pageSize,
      };

      // Only add parameters if they are not null
      if (academyYear != null) {
        requestData['academyYear'] = academyYear;
      }

      if (semester != null) {
        requestData['semester'] = semester.apiValue;
      }

      if (dayOfWeek != null) {
        requestData['dayOfWeek'] = dayOfWeek.apiValue;
      }

      final response = await _apiService.post(
        '/v1/schedules/my-schedules',
        data: requestData,
      );

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        // Handle the new API response structure with status, message, and data
        if (responseData['status'] == 'success' &&
            responseData['data'] != null) {
          final paginatedResponse = PaginatedResponse<ScheduleModel>.fromJson(
            responseData['data'],
            (json) => ScheduleModel.fromJson(json),
          );

          return paginatedResponse;
        } else {
          throw Exception(
              'API Error: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception('Failed to fetch schedules: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to fetch schedules. Please try again.');
    }
  }

  /// Get all schedules (paginated)
  Future<PaginatedResponse<ScheduleModel>> getAllSchedules({
    int? academyYear,
    Semester? semester,
    int pageNo = 1,
    int pageSize = 10,
  }) async {
    try {
      return await getMySchedules(
        academyYear: academyYear,
        semester: semester,
        dayOfWeek: null, // No day filter for all schedules
        pageNo: pageNo,
        pageSize: pageSize,
      );
    } catch (e) {
      rethrow;
    }
  }

  /// Get available academy years (all years from 2000 to current + 10 years)
  List<int> getAvailableAcademyYears() {
    return ScheduleUtils.generateAcademyYears();
  }

  /// Get available semesters
  List<Semester> getAvailableSemesters() {
    return ScheduleUtils.getAvailableSemesters();
  }

  /// Get home statistics (for dashboard)
  Future<Map<String, int>> getHomeStats() async {
    try {
      // Get all schedules for total count
      final allSchedules = await getAllSchedules(
        pageSize: 1, // Just get total count
      );

      // Get today's schedules count
      final currentDay = DayOfWeekExtension.getCurrentDay();
      final todaySchedules = await getMySchedules(
        dayOfWeek: currentDay,
        pageSize: 50,
      );

      return {
        'today': todaySchedules.content.length,
        'total': allSchedules.totalElements,
        'active':
            todaySchedules.content.where((s) => s.status == 'ACTIVE').length,
        'completed':
            todaySchedules.content.where((s) => _isCompleted(s)).length,
      };
    } catch (e) {
      return {
        'today': 0,
        'total': 0,
        'active': 0,
        'completed': 0,
      };
    }
  }

  /// Check if schedule is completed (for stats)
  bool _isCompleted(ScheduleModel schedule) {
    return ScheduleUtils.isScheduleCompleted(
      endTime: schedule.endTime,
      day: schedule.day,
    );
  }

  /// Get schedule by ID
  Future<ScheduleModel?> getScheduleById(int id) async {
    try {
      final response = await _apiService.get('/v1/schedules/$id');

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        if (responseData['data'] != null) {
          return ScheduleModel.fromJson(responseData['data']);
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
