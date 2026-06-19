// lib/features/profile/screens/edit_profile_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/features/profile/controllers/profile_controller.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/features/profile/screens/edit_staff_profile_screen.dart';
import 'package:ksit_mobile/features/profile/screens/edit_student_profile_screen.dart';

class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final profileController = Get.find<ProfileController>();

    return Obx(() {
      if (profileController.userRole.value == 'STUDENT') {
        return const EditStudentProfileFullScreen();
      } else if (profileController.userRole.value == 'STAFF') {
        return const EditStaffProfileFullScreen();
      }

      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          centerTitle: false,
          title: const Text(
            'Edit Profile',
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
        body: const Center(
          child: Text('Profile type not supported'),
        ),
      );
    });
  }
}
