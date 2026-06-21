// lib/features/auth/controllers/auth_controller.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/constants/app_routes.dart';
import 'package:ksit_mobile/core/constants/app_storages.dart';
import 'package:ksit_mobile/core/services/api_service.dart';
import 'package:ksit_mobile/core/services/firebase_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/core/utils/validator_utils.dart';
import 'package:ksit_mobile/features/auth/models/login_request_model.dart';
import 'package:ksit_mobile/features/auth/models/login_response_model.dart';
import 'package:ksit_mobile/features/auth/services/auth_service.dart';
import 'package:ksit_mobile/features/home/controllers/home_controller.dart';
import 'package:ksit_mobile/features/profile/controllers/profile_controller.dart';
import 'package:ksit_mobile/features/requet/controllers/request_controller.dart';
import 'package:ksit_mobile/features/scan/controllers/scan_controller.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/utils/ui_utils.dart';

class AuthController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();
  final StorageService _storageService = Get.find<StorageService>();

  // Observables
  final RxBool isLoading = false.obs;
  final RxBool isLoggedIn = false.obs;
  final Rx<LoginResponseModel?> currentUser = Rx<LoginResponseModel?>(null);

  // Form controllers
  final usernameController = TextEditingController();
  final passwordController = TextEditingController();

  // Form key
  final formKey = GlobalKey<FormState>();

  @override
  void onInit() {
    super.onInit();
    _checkExistingSession();
  }

  @override
  void onClose() {
    usernameController.dispose();
    passwordController.dispose();
    super.onClose();
  }

  /// Check if user has existing valid session
  Future<void> _checkExistingSession() async {
    try {
      final token = _storageService.getString(AppStorages.tokenKey);
      final userDataJson = _storageService.getString(AppStorages.userKey);

      if (token != null && userDataJson != null) {
        try {
          final userData = jsonDecode(userDataJson);
          currentUser.value = LoginResponseModel.fromJson(userData);
          isLoggedIn.value = true;
        } catch (e) {
          await _clearUserData();
        }
      }
    } catch (e) {
      // Silent error handling
    }
  }

  /// Login user with credentials
  Future<void> login() async {
    if (!formKey.currentState!.validate()) return;

    try {
      isLoading.value = true;

      final loginRequest = LoginRequestModel(
        username: usernameController.text.trim(),
        password: passwordController.text.trim(),
      );

      // Call login API
      final loginResponse = await _authService.login(loginRequest);

      // Save user data to storage
      await _saveUserData(loginResponse);

      // Update observables
      currentUser.value = loginResponse;
      isLoggedIn.value = true;

      // Clear form
      _clearForm();

      // Show success message
      ToastUtils.showSuccess(
          'Login successful! Welcome ${loginResponse.username}');

      // Navigate to home
      if (Get.context != null) {
        Get.context!.go(AppRoutes.homeRoute);
      }
    } catch (e) {
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> logout() async {
    try {
      isLoading.value = true;

      await _authService.logout();

      // Clear user data from storage
      await _clearUserData();

      // Navigate FIRST before clearing state
      if (Get.context != null) {
        ToastUtils.showSuccess("Logged out successfully");
        Get.context!.go(AppRoutes.loginRoute);
      }

      // Wait for navigation to complete
      await Future.delayed(const Duration(milliseconds: 300));

      // Selective clearing - only clear user-specific controllers
      _clearUserRelatedControllers();
    } catch (e) {
      // Still clear local data and navigate even if API call fails
      await _clearUserData();

      if (Get.context != null) {
        ToastUtils.showSuccess("Logged out successfully");
        Get.context!.go(AppRoutes.loginRoute);
      }

      // Wait for navigation then clear state
      await Future.delayed(const Duration(milliseconds: 300));
      _clearUserRelatedControllers();
    } finally {
      isLoading.value = false;
    }
  }

  /// Clear only user-related controllers, preserve essential services
  void _clearUserRelatedControllers() {
    try {
      // Clear user-specific controllers while keeping essential services
      Get.delete<HomeController>(force: true);
      Get.delete<RequestController>(force: true);
      Get.delete<ProfileController>(force: true);
      Get.delete<ScanController>(force: true);

      // Reset current user data in AuthController without deleting the controller
      currentUser.value = null;
      isLoggedIn.value = false;

      // Clear form fields
      _clearForm();
    } catch (e) {
      // Fallback to complete reset if selective clearing fails
      _performCompleteReset();
    }
  }

  /// Complete reset with service preservation (fallback method)
  void _performCompleteReset() async {
    try {
      // Store essential services before reset
      final storageService = Get.find<StorageService>();
      final authService = Get.find<AuthService>();
      final apiService = Get.find<ApiService>();
      final firebaseService = Get.find<FirebaseService>();

      // Clear all GetX controllers and their state
      Get.reset();

      // Re-register essential services immediately
      Get.put<StorageService>(storageService, permanent: true);
      Get.put<ApiService>(apiService, permanent: true);
      Get.put<FirebaseService>(firebaseService, permanent: true);

      // Re-register auth service and controller for login
      Get.lazyPut<AuthService>(() => authService, fenix: true);
      Get.lazyPut<AuthController>(() => AuthController(), fenix: true);
    } catch (serviceError) {
      // Fallback: Re-run initial binding
      Get.reset();
      await _reinitializeEssentialServices();
    }
  }

  /// Fallback method to reinitialize essential services
  Future<void> _reinitializeEssentialServices() async {
    try {
      // Re-initialize storage service
      final storageService = await StorageService.getInstance();
      Get.put<StorageService>(storageService, permanent: true);

      // Re-initialize other essential services
      Get.put<ApiService>(ApiService(), permanent: true);
      Get.put<FirebaseService>(FirebaseService(), permanent: true);

      // Re-initialize auth service and controller
      Get.lazyPut<AuthService>(() => AuthService(), fenix: true);
      Get.lazyPut<AuthController>(() => AuthController(), fenix: true);
    } catch (e) {
      // Last resort - show error
      ToastUtils.showError("Please restart the app");
    }
  }

  /// Save user data to local storage
  Future<void> _saveUserData(LoginResponseModel loginResponse) async {
    try {
      // Save access token
      await _storageService.setString(
        AppStorages.tokenKey,
        loginResponse.accessToken,
      );

      // Save user ID
      await _storageService.setString(
        AppStorages.userIdKey,
        loginResponse.userId.toString(),
      );

      // Save roles as JSON string
      await _storageService.setString(
        AppStorages.rolesKey,
        jsonEncode(loginResponse.roles),
      );

      // Save complete user data
      await _storageService.setString(
        AppStorages.userKey,
        jsonEncode(loginResponse.toJson()),
      );
    } catch (e) {
      throw Exception('Failed to save user data: ${e.toString()}');
    }
  }

  /// Clear user data from storage
  Future<void> _clearUserData() async {
    try {
      await _storageService.remove(AppStorages.tokenKey);
      await _storageService.remove(AppStorages.userKey);
      await _storageService.remove(AppStorages.userIdKey);
      await _storageService.remove(AppStorages.rolesKey);

      currentUser.value = null;
      isLoggedIn.value = false;
    } catch (e) {
      // Ignore storage errors during logout
    }
  }

  Future<void> deleteAccount() async {
    try {
      isLoading.value = true;

      // Call delete account API
      final response = await _authService.deleteAccount();

      // Clear local data
      await _clearUserData();

      // Show success message from API response
      final message = response['message'] ?? 'Account deleted successfully';
      ToastUtils.showSuccess(message);

      // Navigate to login
      if (Get.context != null) {
        Get.context!.go(AppRoutes.loginRoute);
      }
    } catch (e) {
      // Still clear local data even if API call fails
      await _clearUserData();

      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);

      // Navigate to login anyway since account might be deleted
      if (Get.context != null) {
        Get.context!.go(AppRoutes.loginRoute);
      }
    } finally {
      isLoading.value = false;
    }
  }

  /// Clear form fields
  void _clearForm() {
    usernameController.clear();
    passwordController.clear();
  }

  // Updated validators using ValidationUtils
  String? validateUsername(String? value) {
    return ValidationUtils.validateUsername(
      value,
      minLength: 3,
      maxLength: 50,
    );
  }

  String? validatePassword(String? value) {
    return ValidationUtils.validatePassword(
      value,
      minLength: AppConstants.minPasswordLength,
    );
  }

  // Additional validation methods using ValidationUtils
  String? validateEmail(String? value) {
    return ValidationUtils.validateEmail(value);
  }

  String? validateName(String? value) {
    return ValidationUtils.validateName(value);
  }

  String? validatePhone(String? value) {
    return ValidationUtils.validatePhone(value);
  }

  String? validateStrongPassword(String? value) {
    return ValidationUtils.validateStrongPassword(value);
  }

  String? validateConfirmPassword(String? value, String? originalPassword) {
    return ValidationUtils.validateConfirmPassword(value, originalPassword);
  }

  // Combined validator example
  String? validateRequiredUsername(String? value) {
    final combinedValidator = ValidationUtils.combineValidators([
      ValidationUtils.required,
      (v) => ValidationUtils.validateUsername(v, minLength: 3, maxLength: 20),
    ]);
    return combinedValidator(value);
  }

  // Utility methods using UIUtils
  void showLoadingDialog({String message = 'Processing...'}) {
    UIUtils.showLoadingDialog(message: message);
  }

  void hideLoadingDialog() {
    UIUtils.hideLoadingDialog();
  }

  void showSuccessMessage(String title, String message) {
    UIUtils.showSuccessSnackbar(title: title, message: message);
  }

  void showErrorMessage(String title, String message) {
    UIUtils.showErrorSnackbar(title: title, message: message);
  }

  void showInfoMessage(String title, String message) {
    UIUtils.showInfoSnackbar(title: title, message: message);
  }
}
