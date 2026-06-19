// lib/core/utils/format_utils.dart
import 'package:intl/intl.dart';
import 'enums_utils.dart';

class FormatUtils {
  // Private constructor to prevent instantiation
  FormatUtils._();

  /// Format time range
  static String formatTimeRange(String? startTime, String? endTime) {
    if (startTime == null || endTime == null) return 'N/A';

    try {
      final start = DateFormat('HH:mm').parse(startTime);
      final end = DateFormat('HH:mm').parse(endTime);

      final startFormatted = DateFormat('h:mm a').format(start);
      final endFormatted = DateFormat('h:mm a').format(end);

      return '$startFormatted - $endFormatted';
    } catch (e) {
      return '$startTime - $endTime';
    }
  }

  /// Calculate duration between two times
  static String calculateDuration(String? startTime, String? endTime) {
    if (startTime == null || endTime == null) return 'N/A';

    try {
      final start = DateFormat('HH:mm').parse(startTime);
      final end = DateFormat('HH:mm').parse(endTime);

      final duration = end.difference(start);
      final hours = duration.inHours;
      final minutes = duration.inMinutes % 60;

      if (hours > 0 && minutes > 0) {
        return '${hours}h ${minutes}m';
      } else if (hours > 0) {
        return '${hours}h';
      } else {
        return '${minutes}m';
      }
    } catch (e) {
      return 'N/A';
    }
  }

  /// Format year level
  static String formatYearLevel(String? yearLevel) {
    if (yearLevel == null) return 'N/A';

    switch (yearLevel.toUpperCase()) {
      case 'FIRST_YEAR':
        return 'First Year';
      case 'SECOND_YEAR':
        return 'Second Year';
      case 'THIRD_YEAR':
        return 'Third Year';
      case 'FOURTH_YEAR':
        return 'Fourth Year';
      default:
        return yearLevel;
    }
  }

  /// Format degree
  static String formatDegree(String? degree) {
    if (degree == null) return 'N/A';

    switch (degree.toUpperCase()) {
      case 'BACHELOR':
        return 'Bachelor Degree';
      case 'MASTER':
        return 'Master Degree';
      case 'DOCTORATE':
        return 'Doctorate Degree';
      case 'ASSOCIATE':
        return 'Associate Degree';
      default:
        return degree;
    }
  }

  /// Format status
  static String formatStatus(String? status) {
    if (status == null) return 'N/A';

    try {
      return StatusExtension.fromString(status).displayName;
    } catch (e) {
      return status;
    }
  }

  /// Format relative date
  static String formatRelativeDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 7) {
      return DateFormat('dd/MM/yyyy').format(date);
    } else if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  /// Format date with time
  static String formatDateTime(DateTime dateTime) {
    return DateFormat('dd/MM/yyyy HH:mm').format(dateTime);
  }

  /// Format bytes to human readable
  static String formatBytes(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }

  /// Format phone number
  static String formatPhoneNumber(String? phone) {
    if (phone == null || phone.isEmpty) return 'N/A';

    // Simple formatting for display
    if (phone.length >= 10) {
      return '${phone.substring(0, 3)} ${phone.substring(3, 6)} ${phone.substring(6)}';
    }
    return phone;
  }

  /// Format credit structure (theory.execute.apply)
  static String formatCreditStructure(int? theory, int? execute, int? apply) {
    return '${theory ?? 0}.${execute ?? 0}.${apply ?? 0}';
  }

  /// Format course display name with credits
  static String formatCourseWithCredits({
    required String? courseName,
    required int? credits,
    required int? theory,
    required int? execute,
    required int? apply,
  }) {
    final name = courseName ?? 'Unknown Course';
    final credit = credits ?? 0;
    final structure = formatCreditStructure(theory, execute, apply);
    return '$name - $credit($structure)';
  }

  /// Format teacher display name
  static String formatTeacherName({
    String? englishFirstName,
    String? englishLastName,
    String? khmerFirstName,
    String? khmerLastName,
    String? username,
    String? email,
  }) {
    if (englishFirstName != null && englishLastName != null) {
      return '$englishFirstName $englishLastName';
    }
    if (khmerFirstName != null && khmerLastName != null) {
      return '$khmerFirstName $khmerLastName';
    }
    return username ?? email ?? 'Unknown Teacher';
  }

  /// Format display name with fallbacks
  static String formatDisplayName(String? name, {String fallback = 'Unknown'}) {
    return name?.isNotEmpty == true ? name! : fallback;
  }

  /// Capitalize first letter
  static String capitalize(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1).toLowerCase();
  }

  /// Format enum display name
  static String formatEnumDisplayName(String enumValue) {
    return enumValue.split('_').map((word) => capitalize(word)).join(' ');
  }
}
