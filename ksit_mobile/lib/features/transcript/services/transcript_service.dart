import 'package:get/get.dart';
import 'package:ksit_mobile/core/services/api_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/features/transcript/models/transcript_model.dart';

class TranscriptService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  /// Get student transcript by token
  Future<TranscriptModel> getStudentTranscript() async {
    try {
      final response = await _apiService.get('/v1/transcript/my-transcript');

      if (response.statusCode == 200 && response.data != null) {
        final responseData = response.data;

        if (responseData['data'] != null) {
          return TranscriptModel.fromJson(responseData['data']);
        } else {
          throw Exception(
              'API Error: ${responseData['message'] ?? 'Failed to fetch transcript'}');
        }
      } else {
        throw Exception('Failed to fetch transcript: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to fetch transcript. Please try again.');
    }
  }
}
