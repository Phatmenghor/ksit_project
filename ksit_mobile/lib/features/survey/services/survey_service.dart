// lib/features/survey/services/survey_service.dart
import 'package:get/get.dart';
import 'package:ksit_mobile/core/services/api_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/features/survey/models/survey_models.dart';

class SurveyService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  /// Get main survey data
  Future<SurveyModel> getMainSurvey() async {
    try {
      final response = await _apiService.get('/v1/surveys/main');

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        if (responseData['status'] == 'success' &&
            responseData['data'] != null) {
          return SurveyModel.fromJson(responseData['data']);
        } else {
          throw Exception(
              'API Error: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception('Failed to fetch survey: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to fetch survey. Please try again.');
    }
  }

  /// Submit survey answers for a specific schedule
  Future<bool> submitSurvey({
    required int scheduleId,
    required SurveySubmissionModel submission,
  }) async {
    try {
      final response = await _apiService.post(
        '/v1/surveys/schedule/$scheduleId/submit',
        data: submission.toJson(),
      );

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        if (responseData['status'] == 'success') {
          return true;
        } else {
          throw Exception(
              'Submission Error: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception('Failed to submit survey: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to submit survey. Please try again.');
    }
  }
}
