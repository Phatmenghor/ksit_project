class QrAttendanceResponse {
  final String status;
  final String message;
  final AttendanceSessionData? data;

  const QrAttendanceResponse({
    required this.status,
    required this.message,
    this.data,
  });

  factory QrAttendanceResponse.fromJson(Map<String, dynamic> json) {
    return QrAttendanceResponse(
      status: json['status'] as String,
      message: json['message'] as String,
      data: json['data'] != null
          ? AttendanceSessionData.fromJson(json['data'])
          : null,
    );
  }

  bool get isSuccess => status == 'success';
}

class AttendanceSessionData {
  final int id;
  final String sessionDate;
  final String finalizationStatus;
  final String status;
  final int scheduleId;
  final String roomName;
  final String classCode;
  final int teacherId;
  final String teacherName;
  final int totalStudents;
  final int totalPresent;
  final int totalAbsent;
  final String? subject;
  final String? courseName;
  final String? day;
  final String? startTime;
  final String? endTime;

  const AttendanceSessionData({
    required this.id,
    required this.sessionDate,
    required this.finalizationStatus,
    required this.status,
    required this.scheduleId,
    required this.roomName,
    required this.classCode,
    required this.teacherId,
    required this.teacherName,
    required this.totalStudents,
    required this.totalPresent,
    required this.totalAbsent,
    this.subject,
    this.courseName,
    this.day,
    this.startTime,
    this.endTime,
  });

  factory AttendanceSessionData.fromJson(Map<String, dynamic> json) {
    return AttendanceSessionData(
      id: (json['id'] as num).toInt(),
      sessionDate: json['sessionDate'] as String? ?? '',
      finalizationStatus: json['finalizationStatus'] as String? ?? '',
      status: json['status'] as String? ?? '',
      scheduleId: (json['scheduleId'] as num?)?.toInt() ?? 0,
      roomName: json['roomName'] as String? ?? '',
      classCode: json['classCode'] as String? ?? '',
      teacherId: (json['teacherId'] as num?)?.toInt() ?? 0,
      teacherName: json['teacherName'] as String? ?? '',
      totalStudents: (json['totalStudents'] as num?)?.toInt() ?? 0,
      totalPresent: (json['totalPresent'] as num?)?.toInt() ?? 0,
      totalAbsent: (json['totalAbsent'] as num?)?.toInt() ?? 0,
      subject: json['subject'] as String?,
      courseName: json['courseName'] as String?,
      day: json['day'] as String?,
      startTime: json['startTime'] as String?,
      endTime: json['endTime'] as String?,
    );
  }
}
