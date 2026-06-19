// lib/core/utils/schedule_utils.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants/app_colors.dart';
import 'enums_utils.dart';

class ScheduleUtils {
  // Private constructor to prevent instantiation
  ScheduleUtils._();

  /// Parse time string to DateTime
  static DateTime parseTimeString(String? timeString) {
    if (timeString == null) return DateTime.now();
    try {
      final parts = timeString.split(':');
      final now = DateTime.now();
      return DateTime(
        now.year,
        now.month,
        now.day,
        int.tryParse(parts[0]) ?? 0,
        parts.length > 1 ? (int.tryParse(parts[1]) ?? 0) : 0,
      );
    } catch (e) {
      return DateTime.now();
    }
  }

  /// Get schedule status text
  static String getScheduleStatusText({
    required String? startTime,
    required String? endTime,
    required String? day,
  }) {
    if (startTime == null || endTime == null || day == null) {
      return 'Scheduled';
    }

    final scheduleDay = DayOfWeekExtension.fromString(day);
    final currentDay = DayOfWeekExtension.getCurrentDay();

    if (scheduleDay == currentDay) {
      final now = DateTime.now();
      final scheduleStartTime = parseTimeString(startTime);
      final scheduleEndTime = parseTimeString(endTime);

      if (now.isBefore(scheduleStartTime)) {
        return 'Upcoming';
      } else if (now.isAfter(scheduleEndTime)) {
        return 'Completed';
      } else {
        return 'Ongoing';
      }
    }
    return 'Scheduled';
  }

  /// Get schedule status color
  static Color getScheduleStatusColor({
    required String? startTime,
    required String? endTime,
    required String? day,
  }) {
    final status = getScheduleStatusText(
      startTime: startTime,
      endTime: endTime,
      day: day,
    );

    switch (status) {
      case 'Upcoming':
        return AppColors.info;
      case 'Ongoing':
        return AppColors.success;
      case 'Completed':
        return AppColors.textSecondary;
      default:
        return AppColors.warning;
    }
  }

  /// Check if schedule is today
  static bool isScheduleToday(String? day) {
    if (day == null) return false;
    final scheduleDay = DayOfWeekExtension.fromString(day);
    final currentDay = DayOfWeekExtension.getCurrentDay();
    return scheduleDay == currentDay;
  }

  /// Check if schedule is upcoming
  static bool isScheduleUpcoming({
    required String? startTime,
    required String? day,
  }) {
    if (!isScheduleToday(day) || startTime == null) return false;

    final now = DateTime.now();
    final scheduleStartTime = parseTimeString(startTime);
    return now.isBefore(scheduleStartTime);
  }

  /// Check if schedule is ongoing
  static bool isScheduleOngoing({
    required String? startTime,
    required String? endTime,
    required String? day,
  }) {
    if (!isScheduleToday(day) || startTime == null || endTime == null) {
      return false;
    }

    final now = DateTime.now();
    final scheduleStartTime = parseTimeString(startTime);
    final scheduleEndTime = parseTimeString(endTime);

    return now.isAfter(scheduleStartTime) && now.isBefore(scheduleEndTime);
  }

  /// Check if schedule is completed
  static bool isScheduleCompleted({
    required String? endTime,
    required String? day,
  }) {
    if (!isScheduleToday(day) || endTime == null) return false;

    final now = DateTime.now();
    final scheduleEndTime = parseTimeString(endTime);
    return now.isAfter(scheduleEndTime);
  }

  /// Get time until schedule starts (in minutes)
  static int? getMinutesUntilStart({
    required String? startTime,
    required String? day,
  }) {
    if (!isScheduleToday(day) || startTime == null) return null;

    final now = DateTime.now();
    final scheduleStartTime = parseTimeString(startTime);

    if (now.isBefore(scheduleStartTime)) {
      return scheduleStartTime.difference(now).inMinutes;
    }
    return null;
  }

  /// Get time remaining in schedule (in minutes)
  static int? getMinutesRemaining({
    required String? endTime,
    required String? day,
  }) {
    if (!isScheduleToday(day) || endTime == null) return null;

    final now = DateTime.now();
    final scheduleEndTime = parseTimeString(endTime);

    if (now.isBefore(scheduleEndTime)) {
      return scheduleEndTime.difference(now).inMinutes;
    }
    return null;
  }

  /// Get next upcoming schedule from a list
  static T? getNextUpcomingSchedule<T>(
    List<T> schedules,
    String? Function(T) getDayOfWeek,
    String? Function(T) getStartTime,
  ) {
    final now = DateTime.now();
    final currentDay = DayOfWeekExtension.getCurrentDay();

    // First, check for today's upcoming schedules
    final todaySchedules = schedules.where((schedule) {
      final day = getDayOfWeek(schedule);
      return day != null && DayOfWeekExtension.fromString(day) == currentDay;
    }).toList();

    for (final schedule in todaySchedules) {
      final startTime = getStartTime(schedule);
      if (startTime != null) {
        final scheduleStartTime = parseTimeString(startTime);
        if (now.isBefore(scheduleStartTime)) {
          return schedule;
        }
      }
    }

    // If no today's upcoming schedules, find next day's first schedule
    final sortedSchedules = List<T>.from(schedules);
    sortedSchedules.sort((a, b) {
      final dayA = getDayOfWeek(a);
      final dayB = getDayOfWeek(b);
      final startTimeA = getStartTime(a);
      final startTimeB = getStartTime(b);

      if (dayA == null || dayB == null) return 0;

      final dayValueA = DayOfWeekExtension.fromString(dayA).index;
      final dayValueB = DayOfWeekExtension.fromString(dayB).index;

      if (dayValueA != dayValueB) {
        return dayValueA.compareTo(dayValueB);
      }

      if (startTimeA == null || startTimeB == null) return 0;
      return startTimeA.compareTo(startTimeB);
    });

    return sortedSchedules.isNotEmpty ? sortedSchedules.first : null;
  }

  /// Generate available academy years
  static List<int> generateAcademyYears({
    int startYear = 2000,
    int yearsAhead = 10,
  }) {
    final currentYear = DateTime.now().year;
    final endYear = currentYear + yearsAhead;

    return List.generate(
      endYear - startYear + 1,
      (index) => endYear - index,
    );
  }

  /// Get available semesters
  static List<Semester> getAvailableSemesters() {
    return [Semester.semester1, Semester.semester2];
  }

  /// Check if time is within range
  static bool isTimeInRange({
    required String currentTime,
    required String startTime,
    required String endTime,
  }) {
    try {
      final current = DateFormat('HH:mm').parse(currentTime);
      final start = DateFormat('HH:mm').parse(startTime);
      final end = DateFormat('HH:mm').parse(endTime);

      return current.isAfter(start) && current.isBefore(end);
    } catch (e) {
      return false;
    }
  }

  /// Get schedule progress percentage (0-100)
  static double getScheduleProgress({
    required String? startTime,
    required String? endTime,
    required String? day,
  }) {
    if (!isScheduleToday(day) || startTime == null || endTime == null) {
      return 0.0;
    }

    final now = DateTime.now();
    final scheduleStartTime = parseTimeString(startTime);
    final scheduleEndTime = parseTimeString(endTime);

    if (now.isBefore(scheduleStartTime)) {
      return 0.0;
    } else if (now.isAfter(scheduleEndTime)) {
      return 100.0;
    } else {
      final totalDuration =
          scheduleEndTime.difference(scheduleStartTime).inMinutes;
      final elapsedDuration = now.difference(scheduleStartTime).inMinutes;
      return (elapsedDuration / totalDuration * 100).clamp(0.0, 100.0);
    }
  }
}
