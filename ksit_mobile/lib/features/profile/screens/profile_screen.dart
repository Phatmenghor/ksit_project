// lib/features/profile/screens/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/config/app_config.dart';
import 'package:ksit_mobile/core/constants/app_constants.dart';
import 'package:ksit_mobile/core/constants/app_routes.dart';
import 'package:ksit_mobile/core/utils/logger_utils.dart';
import 'package:ksit_mobile/features/profile/widgets/profile_menu_item_widget.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/utils/toast_utils.dart';
import '../controllers/profile_controller.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final profileController = Get.put(ProfileController());

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _buildAppBar(profileController),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // View Profile Card
                  _buildViewProfileCard(context),

                  const SizedBox(height: 16),

                  // Menu Items
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(
                        color: AppColors.border,
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(4),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 4,
                    ),
                    child: Column(
                      children: [
                        _buildMenuItem(
                          icon: Icons.person_outline,
                          title: 'Edit Profile',
                          onTap: () => {
                            context.push(AppRoutes.editProfileRoute),
                          },
                        ),
                        _buildMenuItem(
                          icon: Icons.description_outlined,
                          title: 'Transcript',
                          onTap: () => _handleTranscript(context),
                        ),
                        _buildMenuItem(
                          icon: Icons.history,
                          title: 'Attendance History',
                          onTap: () => {
                            context.push(AppRoutes.attendanceHistoryRoute),
                          },
                        ),
                        _buildMenuItem(
                          icon: Icons.lock_outline,
                          title: 'Change Password',
                          onTap: () => {
                            context.push(AppRoutes.changePasswordRoute),
                          },
                        ),
                        _buildMenuItem(
                          icon: Icons.info_outline,
                          title: 'About KSIT',
                          iconUrl:
                              'assets/images/logo_screen.png', // Using your app logo
                          onTap: () => _handleAboutKSIT(),
                        ),
                        _buildMenuItem(
                          icon: Icons.settings_outlined,
                          title: 'Configuration',
                          onTap: () => {
                            context.push(AppRoutes.configurationRoute),
                          },
                        ),
                        _buildMenuItem(
                          icon: Icons.logout,
                          title: 'Logout',
                          titleColor: AppColors.error,
                          iconColor: AppColors.error,
                          showArrow: false,
                          onTap: () => _handleLogout(profileController),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(ProfileController controller) {
    return AppBar(
      backgroundColor: AppColors.primary,
      title: Obx(() => Row(
            children: [
              // Profile Avatar
              _buildProfileAvatar(controller),
              const SizedBox(width: 16),

              // User Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      controller.greeting,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.white,
                        fontWeight: FontWeight.normal,
                      ),
                    ),
                    Text(
                      controller.currentUserDisplayName,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.white,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          )),
      toolbarHeight: 80, // Adjust height as needed
    );
  }

  Widget _buildProfileAvatar(ProfileController controller) {
    final imageUrl = controller.currentUserProfileUrl;

    if (imageUrl != null && imageUrl.isNotEmpty) {
      return CircleAvatar(
        radius: 22,
        backgroundImage: NetworkImage(AppConfig.baseImageUrl + imageUrl),
        backgroundColor: Colors.white,
        onBackgroundImageError: (exception, stackTrace) {
          // If image fails to load, show default icon
        },
      );
    } else {
      return const CircleAvatar(
        radius: 22,
        backgroundColor: Colors.white,
        child: Icon(
          Icons.person,
          color: AppColors.primary,
          size: 28,
        ),
      );
    }
  }

  Widget _buildViewProfileCard(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.push(AppRoutes.profileViewRoute);
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: AppColors.border,
            width: 1,
          ),
          borderRadius: const BorderRadius.all(Radius.circular(4)),
        ),
        child: const Column(
          children: [
            Icon(
              Icons.person,
              size: 20,
              color: AppColors.primary,
            ),
            SizedBox(height: 8),
            Text(
              'View Profile',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? titleColor,
    Color? iconColor,
    String? iconUrl,
    bool showArrow = true,
  }) {
    return ProfileMenuItemWidget(
      icon: icon,
      title: title,
      onTap: onTap,
      titleColor: titleColor,
      iconColor: iconColor,
      iconUrl: iconUrl,
      showArrow: showArrow,
    );
  }
}

void _handleTranscript(BuildContext context) {
  final profileController = Get.find<ProfileController>();

  if (profileController.userRole.value != 'STUDENT') {
    ToastUtils.showError('Transcript is only available for students');
    return;
  }

  try {
    context.push(AppRoutes.transcriptRoute);
  } catch (e) {
    LoggerUtils.error('Error opening transcript', e);
    ToastUtils.showError('Unable to open transcript at this time');
  }
}

Future<void> _handleAboutKSIT() async {
  try {
    const String websiteUrl = AppConstants.websiteKSIT;

    final Uri url = Uri.parse(websiteUrl);

    // First check if the URL can be launched
    final bool canLaunch = await canLaunchUrl(url);
    LoggerUtils.info('Can launch URL: $canLaunch');

    if (canLaunch) {
      // Try to launch with external application (opens in browser)
      final bool launched = await launchUrl(
        url,
        mode: LaunchMode.externalApplication, // Correct enum value
      );

      if (!launched) {
        // If external application fails, try platform default
        await launchUrl(
          url,
          mode: LaunchMode.platformDefault, // Correct enum value
        );
      }
    } else {
      // Show more specific error message
      ToastUtils.showError(
          'Cannot open $websiteUrl. This URL is not supported on this device.');
    }
  } catch (e) {
    // Enhanced error handling with more details
    LoggerUtils.error('Error launching URL: $e');

    // Check if it's a network issue or URL format issue
    if (e.toString().contains('network') || e.toString().contains('internet')) {
      ToastUtils.showError(
          'Unable to open KSIT website. Please check your internet connection.');
    } else {
      ToastUtils.showError(
          'Unable to open KSIT website. Please try again later.');
    }
  }
}

void _handleLogout(ProfileController controller) {
  controller.logout();
}
