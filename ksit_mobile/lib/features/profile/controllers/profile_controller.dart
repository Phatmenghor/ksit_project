// lib/features/profile/controllers/profile_controller.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ksit_mobile/core/constants/app_storages.dart';
import 'package:ksit_mobile/core/services/storage_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/features/auth/controllers/auth_controller.dart';
import 'package:ksit_mobile/features/profile/models/student_profile_model.dart';
import 'package:ksit_mobile/features/profile/models/staff_profile_model.dart';
import 'package:ksit_mobile/features/profile/services/profile_service.dart';
import 'package:ksit_mobile/features/profile/widgets/logout_modal_bottom_sheet.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/logger_utils.dart';

class ProfileController extends GetxController {
  final AuthController _authController = Get.find<AuthController>();
  final ProfileService _profileService = Get.put(ProfileService());
  final StorageService _storageService = Get.find<StorageService>();

  // Observables
  final RxBool isLoading = false.obs;
  final RxBool isUpdating = false.obs;
  final RxBool isLoggingOut = false.obs;
  final RxString userRole = ''.obs;

  // Profile data
  final Rx<StudentProfileModel?> studentProfile =
      Rx<StudentProfileModel?>(null);
  final Rx<StaffProfileModel?> staffProfile = Rx<StaffProfileModel?>(null);

  // Stats (can be extended based on API)
  final RxInt totalRequests = 0.obs;
  final RxInt completedRequests = 0.obs;
  final RxInt totalScans = 0.obs;

  @override
  void onInit() {
    super.onInit();
    _determineUserRole();
    _loadProfileData();
  }

  /// Determine user role from stored data
  void _determineUserRole() {
    try {
      final rolesJson = _storageService.getString(AppStorages.rolesKey);
      if (rolesJson != null) {
        final roles = List<String>.from(jsonDecode(rolesJson));
        if (roles.contains('STUDENT')) {
          userRole.value = 'STUDENT';
        } else if (roles.any((role) =>
            ['ADMIN', 'TEACHER', 'DEVELOPER', 'STAFF'].contains(role))) {
          userRole.value = 'STAFF';
        } else {
          userRole.value = 'UNKNOWN';
        }
      }
      LoggerUtils.info('User role determined: ${userRole.value}');
    } catch (e) {
      LoggerUtils.error('Error determining user role', e);
      userRole.value = 'UNKNOWN';
    }
  }

  Future<void> logout() async {
    if (Get.context != null) {
      showModalLogout(Get.context!, performLogout);
    }
  }

  Future<void> performLogout() async {
    try {
      isLoggingOut.value = true;
      await _authController.logout();
    } catch (e) {
      LoggerUtils.error('Error during logout', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isLoggingOut.value = false;
    }
  }

  /// Load profile data based on user role
  Future<void> _loadProfileData() async {
    try {
      isLoading.value = true;

      if (userRole.value == 'STUDENT') {
        await _loadStudentProfile();
      } else if (userRole.value == 'STAFF') {
        await _loadStaffProfile();
      } else {
        LoggerUtils.warning('Unknown user role: ${userRole.value}');
      }

      LoggerUtils.info('Profile data loaded successfully');
    } catch (e) {
      LoggerUtils.error('Error loading profile data', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }

  /// Load student profile
  Future<void> _loadStudentProfile() async {
    try {
      final profile = await _profileService.getStudentProfile();
      studentProfile.value = profile;
      LoggerUtils.info('Student profile loaded: ${profile.displayName}');
    } catch (e) {
      LoggerUtils.error('Error loading student profile', e);
      rethrow;
    }
  }

  /// Load staff profile
  Future<void> _loadStaffProfile() async {
    try {
      final profile = await _profileService.getStaffProfile();
      staffProfile.value = profile;
      LoggerUtils.info('Staff profile loaded: ${profile.displayName}');
    } catch (e) {
      LoggerUtils.error('Error loading staff profile', e);
      rethrow;
    }
  }

  /// Refresh all profile data
  Future<void> refreshProfile() async {
    await Future.wait([
      _loadProfileData(),
    ]);
    ToastUtils.showSuccess('Profile refreshed successfully');
  }

  /// Update student profile
  Future<void> updateStudentProfile(Map<String, dynamic> updateData) async {
    if (studentProfile.value?.id == null) {
      ToastUtils.showError('Student ID not found');
      return;
    }

    try {
      isUpdating.value = true;

      final updatedProfile = await _profileService.updateStudentProfile(
        studentProfile.value!.id!,
        updateData,
      );

      studentProfile.value = updatedProfile;
      ToastUtils.showSuccess('Profile updated successfully');
      LoggerUtils.info('Student profile updated successfully');
    } catch (e) {
      LoggerUtils.error('Error updating student profile', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isUpdating.value = false;
    }
  }

  /// Update staff profile
  Future<void> updateStaffProfile(Map<String, dynamic> updateData) async {
    if (staffProfile.value?.id == null) {
      ToastUtils.showError('Staff ID not found');
      return;
    }

    try {
      isUpdating.value = true;

      final updatedProfile = await _profileService.updateStaffProfile(
        staffProfile.value!.id!,
        updateData,
      );

      staffProfile.value = updatedProfile;
      ToastUtils.showSuccess('Profile updated successfully');
      LoggerUtils.info('Staff profile updated successfully');
    } catch (e) {
      LoggerUtils.error('Error updating staff profile', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isUpdating.value = false;
    }
  }

  /// Get current user's display name
  String get currentUserDisplayName {
    if (userRole.value == 'STUDENT') {
      return studentProfile.value?.displayName ?? 'Unknown Student';
    } else if (userRole.value == 'STAFF') {
      return staffProfile.value?.displayName ?? 'Unknown Staff';
    }
    return 'Unknown User';
  }

  /// Get current user's email
  String get currentUserEmail {
    if (userRole.value == 'STUDENT') {
      return studentProfile.value?.email ?? 'unknown@example.com';
    } else if (userRole.value == 'STAFF') {
      return staffProfile.value?.email ?? 'unknown@example.com';
    }
    return 'unknown@example.com';
  }

  /// Get current user's profile URL
  String? get currentUserProfileUrl {
    if (userRole.value == 'STUDENT') {
      return studentProfile.value?.profileUrl;
    } else if (userRole.value == 'STAFF') {
      return staffProfile.value?.profileUrl;
    }
    return null;
  }

  /// Time-based greeting
  String get greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  }

  /// Get current user's role display text
  String get currentUserRoleDisplay {
    if (userRole.value == 'STUDENT') {
      return 'Student';
    } else if (userRole.value == 'STAFF') {
      if (staffProfile.value?.roles != null &&
          staffProfile.value!.roles!.isNotEmpty) {
        // Show primary role
        final role = staffProfile.value!.roles!.first;
        switch (role) {
          case 'ADMIN':
            return 'Administrator';
          case 'TEACHER':
            return 'Teacher';
          case 'DEVELOPER':
            return 'Developer';
          case 'STAFF':
            return 'Staff';
          default:
            return role;
        }
      }
      return 'Staff';
    }
    return 'User';
  }

  /// Show edit profile dialog/screen
  void editProfile() {
    if (userRole.value == 'STUDENT') {
      _showStudentEditDialog();
    } else if (userRole.value == 'STAFF') {
      _showStaffEditDialog();
    } else {
      ToastUtils.showError('Unable to edit profile for this user type');
    }
  }

  /// Check if user has profile image
  bool get hasProfileImage {
    final imageUrl = currentUserProfileUrl;
    return imageUrl != null && imageUrl.isNotEmpty;
  }

  /// Get profile image with fallback
  String get profileImageWithFallback {
    final imageUrl = currentUserProfileUrl;
    if (imageUrl != null && imageUrl.isNotEmpty) {
      return imageUrl;
    }
    // Return default avatar URL or empty string
    return '';
  }

  /// Get user initials for placeholder
  String get userInitials {
    final name = currentUserDisplayName;
    if (name.isEmpty) return 'U';

    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    } else if (parts.isNotEmpty) {
      return parts[0][0].toUpperCase();
    }
    return 'U';
  }

  /// Show student edit dialog
  void _showStudentEditDialog() {
    final student = studentProfile.value;
    if (student == null) return;

    // Create form controllers
    final firstNameController =
        TextEditingController(text: student.englishFirstName ?? '');
    final lastNameController =
        TextEditingController(text: student.englishLastName ?? '');
    final phoneController =
        TextEditingController(text: student.phoneNumber ?? '');
    final addressController =
        TextEditingController(text: student.currentAddress ?? '');

    Get.dialog(
      AlertDialog(
        title: const Text('Edit Profile'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: firstNameController,
                decoration: const InputDecoration(
                  labelText: 'First Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: lastNameController,
                decoration: const InputDecoration(
                  labelText: 'Last Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: phoneController,
                decoration: const InputDecoration(
                  labelText: 'Phone Number',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: addressController,
                decoration: const InputDecoration(
                  labelText: 'Address',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              firstNameController.dispose();
              lastNameController.dispose();
              phoneController.dispose();
              addressController.dispose();
              Get.back();
            },
            child: const Text('Cancel'),
          ),
          Obx(() => ElevatedButton(
                onPressed: isUpdating.value
                    ? null
                    : () {
                        final updateData = {
                          'englishFirstName': firstNameController.text.trim(),
                          'englishLastName': lastNameController.text.trim(),
                          'phoneNumber': phoneController.text.trim(),
                          'currentAddress': addressController.text.trim(),
                        };

                        updateStudentProfile(updateData).then((_) {
                          firstNameController.dispose();
                          lastNameController.dispose();
                          phoneController.dispose();
                          addressController.dispose();
                          Get.back();
                        });
                      },
                child: isUpdating.value
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Save'),
              )),
        ],
      ),
    );
  }

  /// Show staff edit dialog
  void _showStaffEditDialog() {
    final staff = staffProfile.value;
    if (staff == null) return;

    // Create form controllers
    final firstNameController =
        TextEditingController(text: staff.englishFirstName ?? '');
    final lastNameController =
        TextEditingController(text: staff.englishLastName ?? '');
    final phoneController =
        TextEditingController(text: staff.phoneNumber ?? '');
    final addressController =
        TextEditingController(text: staff.currentAddress ?? '');

    Get.dialog(
      AlertDialog(
        title: const Text('Edit Profile'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: firstNameController,
                decoration: const InputDecoration(
                  labelText: 'First Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: lastNameController,
                decoration: const InputDecoration(
                  labelText: 'Last Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: phoneController,
                decoration: const InputDecoration(
                  labelText: 'Phone Number',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: addressController,
                decoration: const InputDecoration(
                  labelText: 'Address',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              firstNameController.dispose();
              lastNameController.dispose();
              phoneController.dispose();
              addressController.dispose();
              Get.back();
            },
            child: const Text('Cancel'),
          ),
          Obx(() => ElevatedButton(
                onPressed: isUpdating.value
                    ? null
                    : () {
                        final updateData = {
                          'englishFirstName': firstNameController.text.trim(),
                          'englishLastName': lastNameController.text.trim(),
                          'phoneNumber': phoneController.text.trim(),
                          'currentAddress': addressController.text.trim(),
                        };

                        updateStaffProfile(updateData).then((_) {
                          firstNameController.dispose();
                          lastNameController.dispose();
                          phoneController.dispose();
                          addressController.dispose();
                          Get.back();
                        });
                      },
                child: isUpdating.value
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Save'),
              )),
        ],
      ),
    );
  }

  void openSettings() {
    Get.snackbar(
      'Settings',
      'Settings functionality coming soon',
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 2),
    );
  }

  void openNotificationSettings() {
    Get.dialog(
      AlertDialog(
        title: const Text('Notification Settings'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Push Notifications'),
              trailing: Switch(
                value: true,
                onChanged: (value) {
                  ToastUtils.showInfo(
                      'Push notifications ${value ? 'enabled' : 'disabled'}');
                },
              ),
            ),
            ListTile(
              title: const Text('Email Notifications'),
              trailing: Switch(
                value: false,
                onChanged: (value) {
                  ToastUtils.showInfo(
                      'Email notifications ${value ? 'enabled' : 'disabled'}');
                },
              ),
            ),
            ListTile(
              title: const Text('Sound'),
              trailing: Switch(
                value: true,
                onChanged: (value) {
                  ToastUtils.showInfo(
                      'Sound ${value ? 'enabled' : 'disabled'}');
                },
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void openSecuritySettings() {
    Get.dialog(
      AlertDialog(
        title: const Text('Privacy & Security'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ListTile(
              leading: Icon(Icons.lock_outline),
              title: Text('Change Password'),
              trailing: Icon(Icons.chevron_right),
            ),
            ListTile(
              leading: Icon(Icons.fingerprint),
              title: Text('Biometric Authentication'),
              trailing: Icon(Icons.chevron_right),
            ),
            ListTile(
              leading: Icon(Icons.visibility_off_outlined),
              title: Text('Privacy Settings'),
              trailing: Icon(Icons.chevron_right),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Get.back();
              ToastUtils.showInfo(
                  'Security settings functionality coming soon');
            },
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void openHelp() {
    Get.dialog(
      AlertDialog(
        title: const Text('Help & Support'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ListTile(
              leading: Icon(Icons.help_outline),
              title: Text('FAQ'),
              subtitle: Text('Frequently asked questions'),
            ),
            ListTile(
              leading: Icon(Icons.contact_support),
              title: Text('Contact Support'),
              subtitle: Text('Get help from our team'),
            ),
            ListTile(
              leading: Icon(Icons.bug_report_outlined),
              title: Text('Report a Bug'),
              subtitle: Text('Help us improve the app'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Get.back();
              ToastUtils.showInfo('Help & support functionality coming soon');
            },
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void showAbout() {
    if (Get.context != null) {
      showAboutDialog(
        context: Get.context!,
        applicationName: AppConstants.appName,
        applicationVersion: AppConstants.appVersion,
        applicationLegalese:
            '© 2024 ${AppConstants.appName}. All rights reserved.',
        children: [
          const SizedBox(height: 16),
          const Text(
            'A modern Flutter application built with GetX, Go Router, and Firebase.',
            style: TextStyle(fontSize: 14),
          ),
          const SizedBox(height: 8),
          const Text(
            'Features include authentication, real-time notifications, QR code scanning, and request management.',
            style: TextStyle(fontSize: 14),
          ),
        ],
      );
    }
  }

  /// Get additional profile info for students
  String? get studentClassInfo {
    if (userRole.value == 'STUDENT' &&
        studentProfile.value?.studentClass != null) {
      final studentClass = studentProfile.value!.studentClass!;
      return 'Class ${studentClass.code ?? 'Unknown'}';
    }
    return null;
  }

  /// Get additional profile info for staff
  String? get staffDepartmentInfo {
    if (userRole.value == 'STAFF' && staffProfile.value?.department != null) {
      return staffProfile.value!.department!.name;
    }
    return null;
  }

  /// Get staff ID info
  String? get staffIdInfo {
    if (userRole.value == 'STAFF') {
      return staffProfile.value?.staffId;
    }
    return null;
  }

  /// Get student ID info
  String? get studentIdInfo {
    if (userRole.value == 'STUDENT') {
      return studentProfile.value?.identifyNumber;
    }
    return null;
  }
}
