// lib/features/auth/controllers/change_password_controller.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/core/utils/logger_utils.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/features/auth/models/change_password_request_models.dart';
import 'package:ksit_mobile/features/auth/services/auth_service.dart';

class ChangePasswordController extends GetxController {
  final AuthService _passwordService = Get.put(AuthService());

  // Form controllers
  final currentPasswordController = TextEditingController();
  final newPasswordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  // Form key
  final formKey = GlobalKey<FormState>();

  // Observables
  final RxBool isLoading = false.obs;
  final RxBool showCurrentPassword = false.obs;
  final RxBool showNewPassword = false.obs;
  final RxBool showConfirmPassword = false.obs;

  @override
  void onClose() {
    currentPasswordController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
    super.onClose();
  }

  /// Toggle password visibility
  void toggleCurrentPasswordVisibility() {
    showCurrentPassword.value = !showCurrentPassword.value;
  }

  void toggleNewPasswordVisibility() {
    showNewPassword.value = !showNewPassword.value;
  }

  void toggleConfirmPasswordVisibility() {
    showConfirmPassword.value = !showConfirmPassword.value;
  }

  /// Validate form
  bool validateForm() {
    if (!formKey.currentState!.validate()) {
      return false;
    }

    // Check if new password and confirm password match
    if (newPasswordController.text != confirmPasswordController.text) {
      ToastUtils.showError('New password and confirm password do not match');
      return false;
    }

    // Check if new password is different from current password
    if (currentPasswordController.text == newPasswordController.text) {
      ToastUtils.showError(
          'New password must be different from current password');
      return false;
    }

    return true;
  }

  /// Change password
  Future<void> changePassword() async {
    if (!validateForm()) return;

    try {
      isLoading.value = true;

      final request = ChangePasswordRequest(
        currentPassword: currentPasswordController.text,
        newPassword: newPasswordController.text,
        confirmNewPassword: confirmPasswordController.text,
      );

      final response = await _passwordService.changePassword(request);

      // Show success message from backend
      ToastUtils.showSuccess(response.message);

      // Clear form
      _clearForm();

      // Navigate back
      Get.back();

      LoggerUtils.info('Password changed successfully');
    } catch (e) {
      LoggerUtils.error('Error changing password', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }

  /// Clear form
  void _clearForm() {
    currentPasswordController.clear();
    newPasswordController.clear();
    confirmPasswordController.clear();
  }

  /// Reset form
  void resetForm() {
    _clearForm();
    showCurrentPassword.value = false;
    showNewPassword.value = false;
    showConfirmPassword.value = false;
  }

  /// Validation methods
  String? validateCurrentPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Current password is required';
    }
    return null;
  }

  String? validateNewPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'New password is required';
    }
    if (value.length < 3) {
      return 'New password must have at least 3 characters';
    }
    return null;
  }

  String? validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Confirm new password is required';
    }
    if (value.length < 3) {
      return 'Confirm password must have at least 3 characters';
    }
    if (value != newPasswordController.text) {
      return 'Passwords do not match';
    }
    return null;
  }
}
