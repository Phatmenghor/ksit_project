// lib/features/profile/screens/profile_view_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/features/profile/screens/staff_view_screen.dart';
import 'package:ksit_mobile/features/profile/screens/student_view_screen.dart';

import '../../../core/constants/app_colors.dart';

import '../controllers/profile_controller.dart';

class StduentViewScreen extends StatelessWidget {
  const StduentViewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final profileController = Get.find<ProfileController>();

    if (profileController.userRole.value == 'STUDENT') {
      return const StudentViewScreen();
    } else if (profileController.userRole.value == 'STAFF') {
      return const StaffViewScreen();
    }
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        centerTitle: false,
        title: const Text(
          'Profile',
          style: TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppColors.primary,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: Colors.white,
            size: 22,
          ),
          onPressed: () => context.pop(),
        ),
      ),
    );
  }
}
