// lib/core/utils/enums_utils.dart
import 'package:flutter/material.dart';

enum DayOfWeek {
  monday,
  tuesday,
  wednesday,
  thursday,
  friday,
  saturday,
  sunday,
}

enum GenderEnum { male, female, other }

extension DayOfWeekExtension on DayOfWeek {
  String get name {
    switch (this) {
      case DayOfWeek.monday:
        return 'MONDAY';
      case DayOfWeek.tuesday:
        return 'TUESDAY';
      case DayOfWeek.wednesday:
        return 'WEDNESDAY';
      case DayOfWeek.thursday:
        return 'THURSDAY';
      case DayOfWeek.friday:
        return 'FRIDAY';
      case DayOfWeek.saturday:
        return 'SATURDAY';
      case DayOfWeek.sunday:
        return 'SUNDAY';
    }
  }

  String get displayName {
    switch (this) {
      case DayOfWeek.monday:
        return 'Monday';
      case DayOfWeek.tuesday:
        return 'Tuesday';
      case DayOfWeek.wednesday:
        return 'Wednesday';
      case DayOfWeek.thursday:
        return 'Thursday';
      case DayOfWeek.friday:
        return 'Friday';
      case DayOfWeek.saturday:
        return 'Saturday';
      case DayOfWeek.sunday:
        return 'Sunday';
    }
  }

  static DayOfWeek fromString(String? value) {
    if (value == null) return DayOfWeek.monday;
    switch (value.toUpperCase()) {
      case 'MONDAY':
        return DayOfWeek.monday;
      case 'TUESDAY':
        return DayOfWeek.tuesday;
      case 'WEDNESDAY':
        return DayOfWeek.wednesday;
      case 'THURSDAY':
        return DayOfWeek.thursday;
      case 'FRIDAY':
        return DayOfWeek.friday;
      case 'SATURDAY':
        return DayOfWeek.saturday;
      case 'SUNDAY':
        return DayOfWeek.sunday;
      default:
        return DayOfWeek.monday;
    }
  }

  static DayOfWeek getCurrentDay() {
    final weekday = DateTime.now().weekday;
    switch (weekday) {
      case 1:
        return DayOfWeek.monday;
      case 2:
        return DayOfWeek.tuesday;
      case 3:
        return DayOfWeek.wednesday;
      case 4:
        return DayOfWeek.thursday;
      case 5:
        return DayOfWeek.friday;
      case 6:
        return DayOfWeek.saturday;
      case 7:
        return DayOfWeek.sunday;
      default:
        return DayOfWeek.monday;
    }
  }
}

enum Semester {
  semester1,
  semester2,
}

extension SemesterExtension on Semester {
  String get name {
    switch (this) {
      case Semester.semester1:
        return 'SEMESTER_1';
      case Semester.semester2:
        return 'SEMESTER_2';
    }
  }

  String get displayName {
    switch (this) {
      case Semester.semester1:
        return 'Semester 1';
      case Semester.semester2:
        return 'Semester 2';
    }
  }

  static Semester fromString(String? value) {
    if (value == null) return Semester.semester1;
    switch (value.toUpperCase()) {
      case 'SEMESTER_1':
        return Semester.semester1;
      case 'SEMESTER_2':
        return Semester.semester2;
      default:
        return Semester.semester1;
    }
  }
}

enum Status {
  active,
  inactive,
  deleted,
}

enum FilterType { all, today }

extension StatusExtension on Status {
  String get name {
    switch (this) {
      case Status.active:
        return 'ACTIVE';
      case Status.inactive:
        return 'INACTIVE';
      case Status.deleted:
        return 'DELETED';
    }
  }

  String get displayName {
    switch (this) {
      case Status.active:
        return 'Active';
      case Status.inactive:
        return 'Inactive';
      case Status.deleted:
        return 'Deleted';
    }
  }

  static Status fromString(String? value) {
    if (value == null) return Status.active;
    switch (value.toUpperCase()) {
      case 'ACTIVE':
        return Status.active;
      case 'INACTIVE':
        return Status.inactive;
      case 'DELETED':
        return Status.deleted;
      default:
        return Status.active;
    }
  }
}

enum RequestStatus {
  pending,
  accepted,
  done,
  rejected,
  return_,
}

enum RequestPriority {
  low,
  medium,
  high,
  urgent,
}

extension RequestPriorityExtension on RequestPriority {
  String get name {
    switch (this) {
      case RequestPriority.low:
        return 'low';
      case RequestPriority.medium:
        return 'medium';
      case RequestPriority.high:
        return 'high';
      case RequestPriority.urgent:
        return 'urgent';
    }
  }

  String get displayName {
    switch (this) {
      case RequestPriority.low:
        return 'Low';
      case RequestPriority.medium:
        return 'Medium';
      case RequestPriority.high:
        return 'High';
      case RequestPriority.urgent:
        return 'Urgent';
    }
  }

  static RequestPriority fromString(String value) {
    switch (value.toLowerCase()) {
      case 'low':
        return RequestPriority.low;
      case 'medium':
        return RequestPriority.medium;
      case 'high':
        return RequestPriority.high;
      case 'urgent':
        return RequestPriority.urgent;
      default:
        throw ArgumentError('Invalid RequestPriority: $value');
    }
  }
}

enum SurveyStatus {
  none,
  notStarted,
  completed,
}

extension SurveyStatusExtension on SurveyStatus {
  String get name {
    switch (this) {
      case SurveyStatus.none:
        return 'NONE';
      case SurveyStatus.notStarted:
        return 'NOT_STARTED';
      case SurveyStatus.completed:
        return 'COMPLETED';
    }
  }

  String get displayName {
    switch (this) {
      case SurveyStatus.none:
        return 'No Survey';
      case SurveyStatus.notStarted:
        return 'Survey Available';
      case SurveyStatus.completed:
        return 'Survey Completed';
    }
  }

  static SurveyStatus fromString(String? value) {
    if (value == null) return SurveyStatus.none;
    switch (value.toUpperCase()) {
      case 'NONE':
        return SurveyStatus.none;
      case 'NOT_STARTED':
        return SurveyStatus.notStarted;
      case 'COMPLETED':
        return SurveyStatus.completed;
      default:
        return SurveyStatus.none;
    }
  }

  /// Check if survey button should be shown
  bool get shouldShowSurveyButton => this == SurveyStatus.notStarted;

  /// Get survey button text
  String get surveyButtonText {
    switch (this) {
      case SurveyStatus.notStarted:
        return 'Take Survey Now';
      case SurveyStatus.completed:
        return 'Survey Completed';
      default:
        return 'No Survey Available';
    }
  }

  /// Get survey status color
  Color get statusColor {
    switch (this) {
      case SurveyStatus.none:
        return const Color(0xFF757575); // Gray
      case SurveyStatus.notStarted:
        return const Color(0xFFE4A11C); // Blue
      case SurveyStatus.completed:
        return const Color(0xFF4CAF50); // Green
    }
  }

  /// Get survey status icon
  IconData get statusIcon {
    switch (this) {
      case SurveyStatus.none:
        return Icons.info_outline;
      case SurveyStatus.notStarted:
        return Icons.assignment_outlined;
      case SurveyStatus.completed:
        return Icons.assignment_turned_in;
    }
  }
}
