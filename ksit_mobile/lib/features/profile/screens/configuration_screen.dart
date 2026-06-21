// lib/features/profile/screens/configuration_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/features/profile/controllers/configuration_controller.dart';
import 'package:ksit_mobile/features/profile/widgets/delete_account_modal.dart';

class ConfigurationScreen extends StatelessWidget {
  const ConfigurationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ConfigurationController controller =
        Get.isRegistered<ConfigurationController>()
            ? Get.find<ConfigurationController>()
            : Get.put(ConfigurationController());

    return Scaffold(
      backgroundColor: AppColors.body,
      body: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),

                  _buildSectionTitle('App Permissions'),
                  const SizedBox(height: 8),
                  _buildSettingsCard([
                    Obx(() => _buildToggleTile(
                          icon: Icons.location_on_outlined,
                          iconColor: const Color(0xFF1976D2),
                          title: 'Location',
                          subtitle:
                              'Allow app to access your location',
                          value: controller.isLocationEnabled.value,
                          onChanged: controller.toggleLocation,
                        )),
                    const Divider(height: 1, color: AppColors.border),
                    Obx(() => _buildToggleTile(
                          icon: Icons.notifications_outlined,
                          iconColor: const Color(0xFFED6C02),
                          title: 'Notifications',
                          subtitle:
                              'Receive push notifications from KSIT',
                          value: controller.isNotificationEnabled.value,
                          onChanged: controller.toggleNotification,
                        )),
                  ]),

                  const SizedBox(height: 20),

                  _buildSectionTitle('Danger Zone'),
                  const SizedBox(height: 8),
                  _buildSettingsCard([
                    Obx(() => _buildDangerTile(
                          icon: Icons.delete_forever_outlined,
                          title: 'Delete Account',
                          subtitle:
                              'Permanently remove your account and all data',
                          isLoading: controller.isDeletingAccount.value,
                          onTap: () => showDeleteAccountModal(
                              context, controller.deleteAccount),
                        )),
                  ]),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryAccent],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => context.pop(),
              ),
              const Expanded(
                child: Text(
                  'Configuration',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
              const Padding(
                padding: EdgeInsets.all(12),
                child: Icon(Icons.settings_outlined,
                    color: Colors.white70, size: 22),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: AppColors.textSecondary.withValues(alpha: 0.7),
          letterSpacing: 0.8,
        ),
      ),
    );
  }

  Widget _buildSettingsCard(List<Widget> children) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }

  Widget _buildToggleTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 20, color: iconColor),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: AppColors.primary,
            activeTrackColor: AppColors.primary.withValues(alpha: 0.3),
            inactiveThumbColor: Colors.grey[400],
            inactiveTrackColor: Colors.grey[300],
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
        ],
      ),
    );
  }

  Widget _buildDangerTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isLoading,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: isLoading ? null : onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: isLoading
                  ? const Padding(
                      padding: EdgeInsets.all(9),
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: AppColors.error),
                    )
                  : Icon(icon, size: 20, color: AppColors.error),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.error,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              size: 20,
              color: AppColors.error.withValues(alpha: 0.5),
            ),
          ],
        ),
      ),
    );
  }
}
