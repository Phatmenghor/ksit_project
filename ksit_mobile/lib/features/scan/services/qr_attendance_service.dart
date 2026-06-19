// lib/features/scan/services/qr_attendance_service.dart
import 'package:get/get.dart';
import 'package:ksit_mobile/core/services/api_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/features/scan/models/qr_attendance_request_models.dart';
import 'package:ksit_mobile/features/scan/models/qr_attendance_response_models.dart';

class QrAttendanceService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();

  /// Mark attendance using QR code with JWT token
  Future<QrAttendanceResponse> markAttendanceByQr(String qrCode) async {
    try {
      final request = QrAttendanceRequest(qrCode: qrCode);

      final response = await _apiService.post(
        '/v1/attendance/token/mark-by-qr',
        data: request.toJson(),
      );

      if (response.statusCode == 200 && response.data != null) {
        return QrAttendanceResponse.fromJson(response.data);
      } else {
        throw Exception('Failed to mark attendance: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(e, 'Failed to mark attendance');
    }
  }
}
