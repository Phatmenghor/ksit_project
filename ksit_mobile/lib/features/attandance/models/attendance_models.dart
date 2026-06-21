// lib/features/attendance/models/attendance_models.dart
import 'package:ksit_mobile/core/utils/format_utils.dart';
import 'package:ksit_mobile/core/utils/date_time_formatter.dart';

class AttendanceHistoryModel {
  final int? id;
  final String? status;
  final String? attendanceType;
  final String? identifyNumber;
  final String? comment;
  final String? recordedTime;
  final String? finalizationStatus;
  final int? studentId;
  final String? studentName;
  final int? attendanceSessionId;
  final int? teacherId;
  final String? teacherName;
  final String? gender;
  final String? dateOfBirth;
  final int? scheduleId;
  final String? courseName;
  final String? courseNameKH;
  final String? courseNameEn;
  final String? courseCode;
  final int? credit;
  final int? theory;
  final int? execute;
  final int? apply;
  final int? totalHour;
  final String? startTime;
  final String? endTime;
  final String? day;
  final String? yearLevel;
  final int? roomId;
  final String? roomName;
  final int? classId;
  final String? classCode;
  final int? semesterId;
  final String? semester;
  final String? semesterName;
  final String? departmentImageUrl;
  final int? academyYear;
  final String? createdAt;

  // Score fields
  final double? attendanceScore;
  final double? attendancePercentage;
  final int? totalSessionsConducted;
  final int? sessionsAttended;
  final int? maxAttendanceScore;
  final String? attendanceScoreDescription;

  const AttendanceHistoryModel({
    this.id,
    this.status,
    this.attendanceType,
    this.identifyNumber,
    this.comment,
    this.recordedTime,
    this.finalizationStatus,
    this.studentId,
    this.studentName,
    this.attendanceSessionId,
    this.teacherId,
    this.teacherName,
    this.gender,
    this.dateOfBirth,
    this.scheduleId,
    this.courseName,
    this.courseNameKH,
    this.courseNameEn,
    this.courseCode,
    this.credit,
    this.theory,
    this.execute,
    this.apply,
    this.totalHour,
    this.startTime,
    this.endTime,
    this.day,
    this.yearLevel,
    this.roomId,
    this.roomName,
    this.classId,
    this.classCode,
    this.semesterId,
    this.semester,
    this.departmentImageUrl,
    this.semesterName,
    this.academyYear,
    this.createdAt,
    this.attendanceScore,
    this.attendancePercentage,
    this.totalSessionsConducted,
    this.sessionsAttended,
    this.maxAttendanceScore,
    this.attendanceScoreDescription,
  });

  factory AttendanceHistoryModel.fromJson(Map<String, dynamic> json) {
    return AttendanceHistoryModel(
      id: json['id'] as int?,
      status: json['status'] as String?,
      attendanceType: json['attendanceType'] as String?,
      identifyNumber: json['identifyNumber'] as String?,
      comment: json['comment'] as String?,
      recordedTime: json['recordedTime'] as String?,
      finalizationStatus: json['finalizationStatus'] as String?,
      studentId: json['studentId'] as int?,
      studentName: json['studentName'] as String?,
      attendanceSessionId: json['attendanceSessionId'] as int?,
      teacherId: json['teacherId'] as int?,
      teacherName: json['teacherName'] as String?,
      gender: json['gender'] as String?,
      dateOfBirth: json['dateOfBirth'] as String?,
      scheduleId: json['scheduleId'] as int?,
      courseName: json['courseName'] as String?,
      courseNameKH: json['courseNameKH'] as String?,
      courseNameEn: json['courseNameEn'] as String?,
      courseCode: json['courseCode'] as String?,
      credit: json['credit'] as int?,
      theory: json['theory'] as int?,
      execute: json['execute'] as int?,
      apply: json['apply'] as int?,
      totalHour: json['totalHour'] as int?,
      startTime: json['startTime'] as String?,
      endTime: json['endTime'] as String?,
      day: json['day'] as String?,
      yearLevel: json['yearLevel'] as String?,
      departmentImageUrl: json['departmentImageUrl'] as String?,
      roomId: json['roomId'] as int?,
      roomName: json['roomName'] as String?,
      classId: json['classId'] as int?,
      classCode: json['classCode'] as String?,
      semesterId: json['semesterId'] as int?,
      semester: json['semester'] as String?,
      semesterName: json['semesterName'] as String?,
      academyYear: json['academyYear'] as int?,
      createdAt: json['createdAt'] as String?,
      attendanceScore: (json['attendanceScore'] as num?)?.toDouble(),
      attendancePercentage: (json['attendancePercentage'] as num?)?.toDouble(),
      totalSessionsConducted: json['totalSessionsConducted'] as int?,
      sessionsAttended: json['sessionsAttended'] as int?,
      maxAttendanceScore: json['maxAttendanceScore'] as int?,
      attendanceScoreDescription: json['attendanceScoreDescription'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'status': status,
      'attendanceType': attendanceType,
      'identifyNumber': identifyNumber,
      'comment': comment,
      'recordedTime': recordedTime,
      'finalizationStatus': finalizationStatus,
      'studentId': studentId,
      'studentName': studentName,
      'attendanceSessionId': attendanceSessionId,
      'teacherId': teacherId,
      'teacherName': teacherName,
      'gender': gender,
      'dateOfBirth': dateOfBirth,
      'scheduleId': scheduleId,
      'courseName': courseName,
      'courseNameKH': courseNameKH,
      'courseNameEn': courseNameEn,
      'courseCode': courseCode,
      'credit': credit,
      'theory': theory,
      'execute': execute,
      'apply': apply,
      'departmentImageUrl': departmentImageUrl,
      'totalHour': totalHour,
      'startTime': startTime,
      'endTime': endTime,
      'day': day,
      'yearLevel': yearLevel,
      'roomId': roomId,
      'roomName': roomName,
      'classId': classId,
      'classCode': classCode,
      'semesterId': semesterId,
      'semester': semester,
      'semesterName': semesterName,
      'academyYear': academyYear,
      'createdAt': createdAt,
      'attendanceScore': attendanceScore,
      'attendancePercentage': attendancePercentage,
      'totalSessionsConducted': totalSessionsConducted,
      'sessionsAttended': sessionsAttended,
      'maxAttendanceScore': maxAttendanceScore,
      'attendanceScoreDescription': attendanceScoreDescription,
    };
  }

  // Helper getters for display (updated based on backend enums)
  String get displayStatus {
    switch (status?.toUpperCase()) {
      case 'PRESENT':
        return 'Present';
      case 'ABSENT':
        return 'Absent';
      default:
        return status ?? 'Unknown';
    }
  }

  String get displayAttendanceType {
    switch (attendanceType?.toUpperCase()) {
      case 'NONE':
        return 'Regular';
      case 'LATE':
        return 'Late';
      case 'PERMISSION':
        return 'Permission';
      default:
        return attendanceType ?? 'Unknown';
    }
  }

  String get displayFinalizationStatus {
    switch (finalizationStatus?.toUpperCase()) {
      case 'DRAFT':
        return 'Draft';
      case 'FINAL':
        return 'Final';
      default:
        return finalizationStatus ?? 'Unknown';
    }
  }

  String get displayDay {
    switch (day?.toUpperCase()) {
      case 'MONDAY':
        return 'Monday';
      case 'TUESDAY':
        return 'Tuesday';
      case 'WEDNESDAY':
        return 'Wednesday';
      case 'THURSDAY':
        return 'Thursday';
      case 'FRIDAY':
        return 'Friday';
      case 'SATURDAY':
        return 'Saturday';
      case 'SUNDAY':
        return 'Sunday';
      default:
        return day ?? 'Unknown';
    }
  }

  String get displaySemester {
    switch (semester?.toUpperCase()) {
      case 'SEMESTER_1':
        return 'Semester 1';
      case 'SEMESTER_2':
        return 'Semester 2';
      default:
        return semester ?? 'Unknown';
    }
  }

  String get displayCourseName => courseName ?? 'Unknown Course';
  String get displayCourseNameKH =>
      courseNameKH ?? courseName ?? 'Unknown Course';
  String get displayCourseNameEn =>
      courseNameEn ?? courseName ?? 'Unknown Course';
  String get displayTeacherName => teacherName ?? 'Unknown Teacher';
  String get displayRoomName => roomName ?? 'Unknown Room';
  String get displayClassCode => classCode ?? 'Unknown Class';
  String get displaySemesterName => semesterName ?? 'Unknown Semester';
  String get displayDate => FormatUtils.formatRelativeDate(
      DateTime.tryParse(createdAt ?? '') ?? DateTime.now());

  // Use external DateTimeFormatter for recordedTime
  String get displayRecordedTime =>
      DateTimeFormatter.formatDateTime(recordedTime);

  // Format time display
  String get displayStartTime => startTime ?? 'Unknown';
  String get displayEndTime => endTime ?? 'Unknown';
  String get displayTimeRange => '$displayStartTime - $displayEndTime';

  // Status colors (updated for 2 statuses only)
  String get statusColor {
    switch (status?.toUpperCase()) {
      case 'PRESENT':
        return 'success';
      case 'ABSENT':
        return 'error';
      default:
        return 'secondary';
    }
  }

  // Attendance type colors
  String get attendanceTypeColor {
    switch (attendanceType?.toUpperCase()) {
      case 'NONE':
        return 'info';
      case 'LATE':
        return 'warning';
      case 'PERMISSION':
        return 'success';
      default:
        return 'secondary';
    }
  }

  bool get isPresent => status?.toUpperCase() == 'PRESENT';
  bool get isAbsent => status?.toUpperCase() == 'ABSENT';
  bool get isLate => attendanceType?.toUpperCase() == 'LATE';
  bool get hasPermission => attendanceType?.toUpperCase() == 'PERMISSION';
  bool get isRegular => attendanceType?.toUpperCase() == 'NONE';
  bool get isFinal => finalizationStatus?.toUpperCase() == 'FINAL';
  bool get isDraft => finalizationStatus?.toUpperCase() == 'DRAFT';
}
