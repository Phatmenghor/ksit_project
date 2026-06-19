// lib/features/profile/controllers/configuration_controller.dart
import 'package:get/get.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/core/utils/logger_utils.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/features/auth/controllers/auth_controller.dart';

class ConfigurationController extends GetxController {
  final AuthController _authController = Get.find<AuthController>();

  // Observables for settings
  final RxBool isLocationEnabled = true.obs;
  final RxBool isNotificationEnabled = false.obs;
  final RxBool isDeletingAccount = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadSettings();
  }

  void _loadSettings() {
    LoggerUtils.info('Loading configuration settings');
  }

  void toggleLocation(bool value) {
    isLocationEnabled.value = value;
    _saveLocationSetting(value);
    LoggerUtils.info('Location setting changed to: $value');
  }

  void toggleNotification(bool value) {
    isNotificationEnabled.value = value;
    _saveNotificationSetting(value);
    LoggerUtils.info('Notification setting changed to: $value');
  }

  Future<void> _saveLocationSetting(bool enabled) async {
    try {
      // Save to storage or send to API
      ToastUtils.showSuccess(
          enabled ? 'Location enabled' : 'Location disabled');
    } catch (e) {
      LoggerUtils.error('Error saving location setting', e);
      ToastUtils.showError('Failed to save location setting');
      // Revert the change
      isLocationEnabled.value = !enabled;
    }
  }

  Future<void> _saveNotificationSetting(bool enabled) async {
    try {
      // Save to storage or send to API
      ToastUtils.showSuccess(
          enabled ? 'Notifications enabled' : 'Notifications disabled');
    } catch (e) {
      LoggerUtils.error('Error saving notification setting', e);
      ToastUtils.showError('Failed to save notification setting');
      // Revert the change
      isNotificationEnabled.value = !enabled;
    }
  }

  Future<void> deleteAccount() async {
    try {
      isDeletingAccount.value = true;

      // Call the auth controller's delete account method
      await _authController.deleteAccount();

      LoggerUtils.info('User account deleted successfully');
    } catch (e) {
      LoggerUtils.error('Error deleting account', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isDeletingAccount.value = false;
    }
  }
}
