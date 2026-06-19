// lib/features/home/models/schedule_models.dart

// Import the new utils instead of defining enums here

import 'package:flutter/material.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/core/utils/format_utils.dart';
import 'package:ksit_mobile/core/utils/schedule_utils.dart';

class DepartmentModel {
  final int? id;
  final String? code;
  final String? name;
  final String? urlLogo;
  final String? status;
  final String? createdAt;

  const DepartmentModel({
    this.id,
    this.code,
    this.name,
    this.urlLogo,
    this.status,
    this.createdAt,
  });

  factory DepartmentModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const DepartmentModel();

    return DepartmentModel(
      id: json['id'] as int?,
      code: json['code'] as String?,
      name: json['name'] as String?,
      urlLogo: json['urlLogo'] as String?,
      status: json['status'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'urlLogo': urlLogo,
      'status': status,
      'createdAt': createdAt,
    };
  }

  String get displayName =>
      FormatUtils.formatDisplayName(name, fallback: 'Unknown Department');
}

class MajorModel {
  final int? id;
  final String? code;
  final String? name;
  final String? status;
  final DepartmentModel? department;
  final String? createdAt;

  const MajorModel({
    this.id,
    this.code,
    this.name,
    this.status,
    this.department,
    this.createdAt,
  });

  factory MajorModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const MajorModel();

    return MajorModel(
      id: json['id'] as int?,
      code: json['code'] as String?,
      name: json['name'] as String?,
      status: json['status'] as String?,
      department: json['department'] != null
          ? DepartmentModel.fromJson(
              json['department'] as Map<String, dynamic>?)
          : null,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'status': status,
      'department': department?.toJson(),
      'createdAt': createdAt,
    };
  }

  String get displayName =>
      FormatUtils.formatDisplayName(name, fallback: 'Unknown Major');
}

class ClassModel {
  final int? id;
  final String? code;
  final int? academyYear;
  final String? degree;
  final String? yearLevel;
  final String? status;
  final MajorModel? major;
  final String? createdAt;

  const ClassModel({
    this.id,
    this.code,
    this.academyYear,
    this.degree,
    this.yearLevel,
    this.status,
    this.major,
    this.createdAt,
  });

  factory ClassModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const ClassModel();

    return ClassModel(
      id: json['id'] as int?,
      code: json['code'] as String?,
      academyYear: json['academyYear'] as int?,
      degree: json['degree'] as String?,
      yearLevel: json['yearLevel'] as String?,
      status: json['status'] as String?,
      major: json['major'] != null
          ? MajorModel.fromJson(json['major'] as Map<String, dynamic>?)
          : null,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'academyYear': academyYear,
      'degree': degree,
      'yearLevel': yearLevel,
      'status': status,
      'major': major?.toJson(),
      'createdAt': createdAt,
    };
  }

  String get displayCode =>
      FormatUtils.formatDisplayName(code, fallback: 'Unknown Class');
}

class TeacherModel {
  final int? id;
  final String? username;
  final String? email;
  final List<String>? roles;
  final String? status;
  final DepartmentModel? department;
  final String? khmerFirstName;
  final String? profileUrl;
  final String? khmerLastName;
  final String? englishFirstName;
  final String? englishLastName;
  final String? gender;
  final String? dateOfBirth;
  final String? phoneNumber;
  final String? identifyNumber;
  final String? staffId;
  final String? createdAt;

  const TeacherModel({
    this.id,
    this.username,
    this.email,
    this.roles,
    this.status,
    this.department,
    this.khmerFirstName,
    this.profileUrl,
    this.khmerLastName,
    this.englishFirstName,
    this.englishLastName,
    this.gender,
    this.dateOfBirth,
    this.phoneNumber,
    this.identifyNumber,
    this.staffId,
    this.createdAt,
  });

  factory TeacherModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const TeacherModel();

    return TeacherModel(
      id: json['id'] as int?,
      username: json['username'] as String?,
      email: json['email'] as String?,
      roles: json['roles'] != null
          ? (json['roles'] as List<dynamic>)
              .map((e) => e?.toString() ?? '')
              .toList()
          : null,
      status: json['status'] as String?,
      department: json['department'] != null
          ? DepartmentModel.fromJson(
              json['department'] as Map<String, dynamic>?)
          : null,
      khmerFirstName: json['khmerFirstName'] as String?,
      profileUrl: json['profileUrl'] as String?,
      khmerLastName: json['khmerLastName'] as String?,
      englishFirstName: json['englishFirstName'] as String?,
      englishLastName: json['englishLastName'] as String?,
      gender: json['gender'] as String?,
      dateOfBirth: json['dateOfBirth'] as String?,
      phoneNumber: json['phoneNumber'] as String?,
      identifyNumber: json['identifyNumber'] as String?,
      staffId: json['staffId'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'roles': roles,
      'status': status,
      'department': department?.toJson(),
      'khmerFirstName': khmerFirstName,
      'profileUrl': profileUrl,
      'khmerLastName': khmerLastName,
      'englishFirstName': englishFirstName,
      'englishLastName': englishLastName,
      'gender': gender,
      'dateOfBirth': dateOfBirth,
      'phoneNumber': phoneNumber,
      'identifyNumber': identifyNumber,
      'staffId': staffId,
      'createdAt': createdAt,
    };
  }

  // Updated to use FormatUtils
  String get displayName => FormatUtils.formatTeacherName(
        englishFirstName: englishFirstName,
        englishLastName: englishLastName,
        khmerFirstName: khmerFirstName,
        khmerLastName: khmerLastName,
        username: username,
        email: email,
      );
}

class SubjectModel {
  final int? id;
  final String? name;
  final String? status;
  final String? createdAt;

  const SubjectModel({
    this.id,
    this.name,
    this.status,
    this.createdAt,
  });

  factory SubjectModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const SubjectModel();

    return SubjectModel(
      id: json['id'] as int?,
      name: json['name'] as String?,
      status: json['status'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'status': status,
      'createdAt': createdAt,
    };
  }

  String get displayName =>
      FormatUtils.formatDisplayName(name, fallback: 'Unknown Subject');
}

class CourseModel {
  final int? id;
  final String? code;
  final String? nameKH;
  final String? nameEn;
  final int? credit;
  final int? theory;
  final int? execute;
  final int? apply;
  final int? totalHour;
  final String? description;
  final String? purpose;
  final String? expectedOutcome;
  final String? status;
  final DepartmentModel? department;
  final SubjectModel? subject;
  final String? createdAt;

  const CourseModel({
    this.id,
    this.code,
    this.nameKH,
    this.nameEn,
    this.credit,
    this.theory,
    this.execute,
    this.apply,
    this.totalHour,
    this.description,
    this.purpose,
    this.expectedOutcome,
    this.status,
    this.department,
    this.subject,
    this.createdAt,
  });

  factory CourseModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const CourseModel();

    return CourseModel(
      id: json['id'] as int?,
      code: json['code'] as String?,
      nameKH: json['nameKH'] as String?,
      nameEn: json['nameEn'] as String?,
      credit: json['credit'] as int?,
      theory: json['theory'] as int?,
      execute: json['execute'] as int?,
      apply: json['apply'] as int?,
      totalHour: json['totalHour'] as int?,
      description: json['description'] as String?,
      purpose: json['purpose'] as String?,
      expectedOutcome: json['expectedOutcome'] as String?,
      status: json['status'] as String?,
      department: json['department'] != null
          ? DepartmentModel.fromJson(
              json['department'] as Map<String, dynamic>?)
          : null,
      subject: json['subject'] != null
          ? SubjectModel.fromJson(json['subject'] as Map<String, dynamic>?)
          : null,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'nameKH': nameKH,
      'nameEn': nameEn,
      'credit': credit,
      'theory': theory,
      'execute': execute,
      'apply': apply,
      'totalHour': totalHour,
      'description': description,
      'purpose': purpose,
      'expectedOutcome': expectedOutcome,
      'status': status,
      'department': department?.toJson(),
      'subject': subject?.toJson(),
      'createdAt': createdAt,
    };
  }

  String get displayName => nameEn ?? nameKH ?? 'Unknown Course';
  int get displayCredit => credit ?? 0;

  // Updated to use FormatUtils
  String get displayWithCredits => FormatUtils.formatCourseWithCredits(
        courseName: displayName,
        credits: credit,
        theory: theory,
        execute: execute,
        apply: apply,
      );
}

class RoomModel {
  final int? id;
  final String? name;
  final String? status;
  final String? createdAt;

  const RoomModel({
    this.id,
    this.name,
    this.status,
    this.createdAt,
  });

  factory RoomModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const RoomModel();

    return RoomModel(
      id: json['id'] as int?,
      name: json['name'] as String?,
      status: json['status'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'status': status,
      'createdAt': createdAt,
    };
  }

  String get displayName =>
      FormatUtils.formatDisplayName(name, fallback: 'Unknown Room');
}

class SemesterModel {
  final int? id;
  final String? semester;
  final String? startDate;
  final String? endDate;
  final int? academyYear;
  final String? semesterType;
  final String? status;
  final String? createdAt;

  const SemesterModel({
    this.id,
    this.semester,
    this.startDate,
    this.endDate,
    this.academyYear,
    this.semesterType,
    this.status,
    this.createdAt,
  });

  factory SemesterModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const SemesterModel();

    return SemesterModel(
      id: json['id'] as int?,
      semester: json['semester'] as String?,
      startDate: json['startDate'] as String?,
      endDate: json['endDate'] as String?,
      academyYear: json['academyYear'] as int?,
      semesterType: json['semesterType'] as String?,
      status: json['status'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'semester': semester,
      'startDate': startDate,
      'endDate': endDate,
      'academyYear': academyYear,
      'semesterType': semesterType,
      'status': status,
      'createdAt': createdAt,
    };
  }

  // Updated to use SemesterExtension
  String get displayName {
    try {
      return SemesterExtension.fromString(semester).displayName;
    } catch (e) {
      return semester ?? 'Unknown Semester';
    }
  }
}

class ScheduleModel {
  final int? id;
  final String? startTime;
  final String? endTime;
  final int? academyYear;
  final String? yearLevel;
  final String? day;
  final String? status;
  final ClassModel? classes;
  final TeacherModel? teacher;
  final CourseModel? course;
  final RoomModel? room;
  final SemesterModel? semester;
  final String? surveyStatus;
  final String? surveySubmittedAt;
  final int? surveyResponseId;
  final String? createdAt;

  const ScheduleModel({
    this.id,
    this.startTime,
    this.endTime,
    this.academyYear,
    this.yearLevel,
    this.day,
    this.status,
    this.classes,
    this.teacher,
    this.course,
    this.room,
    this.semester,
    this.surveyStatus,
    this.surveySubmittedAt,
    this.surveyResponseId,
    this.createdAt,
  });

  factory ScheduleModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const ScheduleModel();

    return ScheduleModel(
      id: json['id'] as int?,
      startTime: json['startTime'] as String?,
      endTime: json['endTime'] as String?,
      academyYear: json['academyYear'] as int?,
      yearLevel: json['yearLevel'] as String?,
      day: json['day'] as String?,
      status: json['status'] as String?,
      classes: json['classes'] != null
          ? ClassModel.fromJson(json['classes'] as Map<String, dynamic>?)
          : null,
      teacher: json['teacher'] != null
          ? TeacherModel.fromJson(json['teacher'] as Map<String, dynamic>?)
          : null,
      course: json['course'] != null
          ? CourseModel.fromJson(json['course'] as Map<String, dynamic>?)
          : null,
      room: json['room'] != null
          ? RoomModel.fromJson(json['room'] as Map<String, dynamic>?)
          : null,
      semester: json['semester'] != null
          ? SemesterModel.fromJson(json['semester'] as Map<String, dynamic>?)
          : null,
      surveyStatus: json['surveyStatus'] as String?,
      surveySubmittedAt: json['surveySubmittedAt'] as String?,
      surveyResponseId: json['surveyResponseId'] as int?,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'startTime': startTime,
      'endTime': endTime,
      'academyYear': academyYear,
      'yearLevel': yearLevel,
      'day': day,
      'status': status,
      'classes': classes?.toJson(),
      'teacher': teacher?.toJson(),
      'course': course?.toJson(),
      'room': room?.toJson(),
      'semester': semester?.toJson(),
      'surveyStatus': surveyStatus,
      'surveySubmittedAt': surveySubmittedAt,
      'surveyResponseId': surveyResponseId,
      'createdAt': createdAt,
    };
  }

  // Updated getters to use utils
  String get timeRange => FormatUtils.formatTimeRange(startTime, endTime);

  String get dayDisplayName {
    try {
      return DayOfWeekExtension.fromString(day).displayName;
    } catch (e) {
      return day ?? 'Unknown Day';
    }
  }

  bool get isToday => ScheduleUtils.isScheduleToday(day);

  String get statusText => ScheduleUtils.getScheduleStatusText(
        startTime: startTime,
        endTime: endTime,
        day: day,
      );

  // Additional utility getters
  bool get isUpcoming => ScheduleUtils.isScheduleUpcoming(
        startTime: startTime,
        day: day,
      );

  bool get isOngoing => ScheduleUtils.isScheduleOngoing(
        startTime: startTime,
        endTime: endTime,
        day: day,
      );

  bool get isCompleted => ScheduleUtils.isScheduleCompleted(
        endTime: endTime,
        day: day,
      );

  double get progress => ScheduleUtils.getScheduleProgress(
        startTime: startTime,
        endTime: endTime,
        day: day,
      );

  // Survey-related getters
  SurveyStatus get surveyStatusEnum =>
      SurveyStatusExtension.fromString(surveyStatus);

  bool get shouldShowSurveyButton => surveyStatusEnum.shouldShowSurveyButton;

  String get surveyButtonText => surveyStatusEnum.surveyButtonText;

  Color get surveyStatusColor => surveyStatusEnum.statusColor;

  IconData get surveyStatusIcon => surveyStatusEnum.statusIcon;

  bool get hasSurveyCompleted => surveyStatusEnum == SurveyStatus.completed;

  bool get hasSurveyAvailable => surveyStatusEnum == SurveyStatus.notStarted;
}
