import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFF024D3E);
  static const Color primaryAccent = Color(0xFF036B56);

  // Secondary Colors
  static const Color secondary = Color(0xFF4CAF50);
  static const Color secondaryAccent = Color(0xFF388E3C);

  // Bac`kground Colors
  static const Color background = Color(0xFFFFFFFF);
  static const Color body = Color(0xFFF8F8F8);
  static const Color surface = Colors.white;
  static const Color cardBackground = Colors.white;

  // Text Colors
  static const Color textPrimary = Color(0xFF000000);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textHint = Color(0xFFBDBDBD);
  static const Color white = Colors.white;

  // Status Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFE4A11C);
  static const Color error = Color(0xFFF44336);
  static const Color info = Color(0xFF2196F3);

  // Border Colors
  static const Color border = Color(0xFFE0E0E0);
  static const Color borderAccent = Color(0xFFBDBDBD);

  // Icon Colors
  static const Color iconPrimary = Color(0xFF757575);
  static const Color iconSecondary = Color(0xFFBDBDBD);
  static const Color iconActive = primary;
  static const Color iconInactive = Color(0xFFBDBDBD);

  // Shadow Colors
  static const Color shadowLight = Color(0x1A000000);
  static const Color shadowMedium = Color(0x33000000);
  static const Color shadowDark = Color(0x4D000000);

  // Overlay Colors
  static const Color overlay = Color(0x80000000);
  static const Color overlayLight = Color(0x33000000);

  // Bottom Navigation Colors
  static const Color bottomNavBackground = Colors.white;
  static const Color bottomNavSelected = primary;
  static const Color bottomNavUnselected = Color(0xFFBDBDBD);

  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryAccent],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondary, secondaryAccent],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
