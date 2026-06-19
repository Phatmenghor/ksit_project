// lib/features/scan/models/qr_attendance_models.dart
class QrAttendanceRequest {
  final String qrCode;

  const QrAttendanceRequest({
    required this.qrCode,
  });

  Map<String, dynamic> toJson() {
    return {
      'qrCode': qrCode,
    };
  }

  factory QrAttendanceRequest.fromJson(Map<String, dynamic> json) {
    return QrAttendanceRequest(
      qrCode: json['qrCode'] as String,
    );
  }

  @override
  String toString() => 'QrAttendanceRequest(qrCode: $qrCode)';
}
