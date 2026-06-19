// lib/features/profile/screens/configuration_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/features/profile/controllers/configuration_controller.dart';
import 'package:ksit_mobile/features/profile/widgets/configuration_dangerous_setting_item.dart';
import 'package:ksit_mobile/features/profile/widgets/configuration_setting_item_widget.dart';
import 'package:ksit_mobile/features/profile/widgets/delete_account_modal.dart';

class ConfigurationScreen extends StatelessWidget {
  const ConfigurationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ConfigurationController controller =
        Get.put(ConfigurationController());

    return Scaffold(
      backgroundColor: AppColors.body,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Configuration',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white),
            onPressed: () {
              // Settings action if needed
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(0),
        child: Column(
          children: [
            const SizedBox(height: 16),

            // Location Setting
            Obx(() => ConfigurationSettingItem(
                  title: 'Location',
                  subtitle: 'Allow to access location',
                  value: controller.isLocationEnabled.value,
                  onChanged: controller.toggleLocation,
                )),

            const SizedBox(height: 16),

            // Notification Setting
            Obx(() => ConfigurationSettingItem(
                  title: 'Notification',
                  subtitle: 'Allow to send notifications',
                  value: controller.isNotificationEnabled.value,
                  onChanged: controller.toggleNotification,
                )),

            const SizedBox(height: 16),

            // Delete Account Setting
            Obx(() => ConfigurationDangerousSettingItem(
                  title: 'User Account',
                  subtitle: 'Delete your user account',
                  isLoading: controller.isDeletingAccount.value,
                  onTap: () {
                    showDeleteAccountModal(context, controller.deleteAccount);
                  },
                )),
          ],
        ),
      ),
    );
  }
}
