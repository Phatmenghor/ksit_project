// lib/core/utils/date_time_formatter.dart
import 'package:intl/intl.dart';

class DateTimeFormatter {
  // Private constructor to prevent instantiation
  DateTimeFormatter._();

  /// Formats timestamp similar to TypeScript DateTimeFormatter
  /// Converts timestamp to Asia/Phnom_Penh timezone and formats as:
  /// MM/dd/yyyy h:mm:ss a
  static String formatDateTime(String? timestamp) {
    if (timestamp == null || timestamp.isEmpty) {
      return '';
    }

    try {
      // Parse the timestamp
      final date = DateTime.parse(timestamp);

      // Convert to Cambodia timezone (UTC+7)
      final cambodiaTime = date.add(const Duration(hours: 7));

      // Create formatter similar to TypeScript version
      // Month/Day/Year Hour:Minute:Second AM/PM
      final formatter = DateFormat('M/d/yyyy h:mm:ss a');

      return formatter.format(cambodiaTime);
    } catch (e) {
      // If parsing fails, return the original string
      return timestamp;
    }
  }

  /// Format timestamp for display in UI (shorter version)
  static String formatShort(String? timestamp) {
    if (timestamp == null || timestamp.isEmpty) {
      return 'Not recorded';
    }

    try {
      final date = DateTime.parse(timestamp);
      final cambodiaTime = date.add(const Duration(hours: 7));

      // Shorter format: MM/dd h:mm a
      final formatter = DateFormat('M/d h:mm a');

      return formatter.format(cambodiaTime);
    } catch (e) {
      return 'Invalid time';
    }
  }

  /// Format date only
  static String formatDateOnly(String? timestamp) {
    if (timestamp == null || timestamp.isEmpty) {
      return '';
    }

    try {
      final date = DateTime.parse(timestamp);
      final cambodiaTime = date.add(const Duration(hours: 7));

      // Date only: MM/dd/yyyy
      final formatter = DateFormat('M/d/yyyy');

      return formatter.format(cambodiaTime);
    } catch (e) {
      return timestamp;
    }
  }

  /// Format time only
  static String formatTimeOnly(String? timestamp) {
    if (timestamp == null || timestamp.isEmpty) {
      return '';
    }

    try {
      final date = DateTime.parse(timestamp);
      final cambodiaTime = date.add(const Duration(hours: 7));

      // Time only: h:mm:ss a
      final formatter = DateFormat('h:mm:ss a');

      return formatter.format(cambodiaTime);
    } catch (e) {
      return timestamp;
    }
  }

  /// Check if timestamp is today (Cambodia timezone)
  static bool isToday(String? timestamp) {
    if (timestamp == null || timestamp.isEmpty) {
      return false;
    }

    try {
      final date = DateTime.parse(timestamp);
      final cambodiaTime = date.add(const Duration(hours: 7));
      final now = DateTime.now().add(const Duration(hours: 7));

      return cambodiaTime.year == now.year &&
          cambodiaTime.month == now.month &&
          cambodiaTime.day == now.day;
    } catch (e) {
      return false;
    }
  }

  /// Get relative time (e.g., "2 hours ago", "Yesterday")
  static String getRelativeTime(String? timestamp) {
    if (timestamp == null || timestamp.isEmpty) {
      return '';
    }

    try {
      final date = DateTime.parse(timestamp);
      final cambodiaTime = date.add(const Duration(hours: 7));
      final now = DateTime.now().add(const Duration(hours: 7));
      final difference = now.difference(cambodiaTime);

      if (difference.inDays > 7) {
        // More than a week ago, show full date
        return formatDateOnly(timestamp);
      } else if (difference.inDays > 0) {
        if (difference.inDays == 1) {
          return 'Yesterday';
        } else {
          return '${difference.inDays} days ago';
        }
      } else if (difference.inHours > 0) {
        if (difference.inHours == 1) {
          return '1 hour ago';
        } else {
          return '${difference.inHours} hours ago';
        }
      } else if (difference.inMinutes > 0) {
        if (difference.inMinutes == 1) {
          return '1 minute ago';
        } else {
          return '${difference.inMinutes} minutes ago';
        }
      } else {
        return 'Just now';
      }
    } catch (e) {
      return timestamp;
    }
  }
}
