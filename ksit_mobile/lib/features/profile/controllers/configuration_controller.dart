// lib/features/profile/controllers/configuration_controller.dart
import 'package:get/get.dart';
import 'package:ksit_mobile/core/constants/app_storages.dart';
import 'package:ksit_mobile/core/services/storage_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/core/utils/logger_utils.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/features/auth/controllers/auth_controller.dart';

class ConfigurationController extends GetxController {
  final AuthController _authController = Get.find<AuthController>();
  final StorageService _storage = Get.find<StorageService>();

  final RxBool isLocationEnabled = true.obs;
  final RxBool isNotificationEnabled = false.obs;
  final RxBool isDeletingAccount = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadSettings();
  }

  void _loadSettings() {
    isLocationEnabled.value =
        _storage.getBool(AppStorages.locationEnabledKey) ?? true;
    isNotificationEnabled.value =
        _storage.getBool(AppStorages.notificationEnabledKey) ?? false;
    LoggerUtils.info('Configuration settings loaded');
  }

  void toggleLocation(bool value) {
    isLocationEnabled.value = value;
    _persist(AppStorages.locationEnabledKey, value);
    ToastUtils.showSuccess(value ? 'Location enabled' : 'Location disabled');
    LoggerUtils.info('Location setting: $value');
  }

  void toggleNotification(bool value) {
    isNotificationEnabled.value = value;
    _persist(AppStorages.notificationEnabledKey, value);
    ToastUtils.showSuccess(
        value ? 'Notifications enabled' : 'Notifications disabled');
    LoggerUtils.info('Notification setting: $value');
  }

  Future<void> _persist(String key, bool value) async {
    try {
      await _storage.setBool(key, value);
    } catch (e) {
      LoggerUtils.error('Failed to persist setting $key', e);
    }
  }

  Future<void> deleteAccount() async {
    try {
      isDeletingAccount.value = true;
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
