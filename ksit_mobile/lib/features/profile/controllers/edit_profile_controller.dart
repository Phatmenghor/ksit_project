// lib/features/profile/controllers/edit_profile_controller.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ksit_mobile/core/services/image_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/features/profile/controllers/profile_controller.dart';
import 'package:ksit_mobile/features/profile/services/profile_service.dart';

import '../../../core/utils/logger_utils.dart';

class EditProfileController extends GetxController {
  final ProfileService _profileService = Get.find<ProfileService>();
  final ImageService _imageService = Get.put(ImageService());
  final ProfileController _profileController = Get.find<ProfileController>();

  // Gender selection
  final Rx<GenderEnum?> selectedGender = Rx<GenderEnum?>(null);

  // Date selection
  final Rx<DateTime?> selectedDate = Rx<DateTime?>(null);

  // Observables
  final RxBool isLoading = false.obs;
  final RxBool isUploadingImage = false.obs;
  final RxString selectedImageUrl = ''.obs;
  final RxString tempImageUrl = ''.obs; // For preview before saving

  // Gender options with localized display names
  final Map<GenderEnum, String> genderOptions = {
    GenderEnum.male: 'ប្រុស', // Male in Khmer
    GenderEnum.female: 'ស្រី', // Female in Khmer
    GenderEnum.other: 'ផ្សេងៗ', // Other in Khmer
  };

  // Form controllers
  final englishFirstNameController = TextEditingController();
  final englishLastNameController = TextEditingController();
  final khmerFirstNameController = TextEditingController();
  final khmerLastNameController = TextEditingController();
  final phoneController = TextEditingController();
  final addressController = TextEditingController();
  final emailController = TextEditingController();
  final nationalityController = TextEditingController();
  final ethnicityController = TextEditingController();
  final placeOfBirthController = TextEditingController();
  final dateOfBirthController = TextEditingController();

  // Form key
  final formKey = GlobalKey<FormState>();

  @override
  void onInit() {
    super.onInit();
    _loadCurrentProfileData();
  }

  @override
  void onClose() {
    _disposeControllers();
    super.onClose();
  }

  void _disposeControllers() {
    englishFirstNameController.dispose();
    englishLastNameController.dispose();
    khmerFirstNameController.dispose();
    khmerLastNameController.dispose();
    phoneController.dispose();
    addressController.dispose();
    emailController.dispose();
    nationalityController.dispose();
    ethnicityController.dispose();
    placeOfBirthController.dispose();
    dateOfBirthController.dispose();
  }

  void _loadCurrentProfileData() {
    if (_profileController.userRole.value == 'STUDENT') {
      _loadStudentData();
    } else if (_profileController.userRole.value == 'STAFF') {
      _loadStaffData();
    }
  }

  void _loadStudentData() {
    final student = _profileController.studentProfile.value;
    if (student != null) {
      englishFirstNameController.text = student.englishFirstName ?? '';
      englishLastNameController.text = student.englishLastName ?? '';
      khmerFirstNameController.text = student.khmerFirstName ?? '';
      khmerLastNameController.text = student.khmerLastName ?? '';
      phoneController.text = student.phoneNumber ?? '';
      addressController.text = student.currentAddress ?? '';
      emailController.text = student.email ?? '';
      nationalityController.text = student.nationality ?? '';
      ethnicityController.text = student.ethnicity ?? '';
      placeOfBirthController.text = student.placeOfBirth ?? '';
      selectedImageUrl.value = student.profileUrl ?? '';
      _loadGenderFromProfile(student.gender);
      _loadDateFromProfile(student.dateOfBirth);
    }
  }

  void _loadStaffData() {
    final staff = _profileController.staffProfile.value;
    if (staff != null) {
      englishFirstNameController.text = staff.englishFirstName ?? '';
      englishLastNameController.text = staff.englishLastName ?? '';
      khmerFirstNameController.text = staff.khmerFirstName ?? '';
      khmerLastNameController.text = staff.khmerLastName ?? '';
      phoneController.text = staff.phoneNumber ?? '';
      addressController.text = staff.currentAddress ?? '';
      emailController.text = staff.email ?? '';
      nationalityController.text = staff.nationality ?? '';
      ethnicityController.text = staff.ethnicity ?? '';
      placeOfBirthController.text = staff.placeOfBirth ?? '';
      selectedImageUrl.value = staff.profileUrl ?? '';
      _loadGenderFromProfile(staff.gender);
      _loadDateFromProfile(staff.dateOfBirth);
    }
  }

  void _loadGenderFromProfile(String? genderString) {
    if (genderString != null && genderString.isNotEmpty) {
      switch (genderString.toUpperCase()) {
        case 'MALE':
          selectedGender.value = GenderEnum.male;
          break;
        case 'FEMALE':
          selectedGender.value = GenderEnum.female;
          break;
        case 'OTHER':
          selectedGender.value = GenderEnum.other;
          break;
        default:
          selectedGender.value = null;
      }
    } else {
      selectedGender.value = null;
    }
  }

  void _loadDateFromProfile(String? dateString) {
    if (dateString != null && dateString.isNotEmpty) {
      try {
        selectedDate.value = DateTime.parse(dateString);
        dateOfBirthController.text = _formatDate(selectedDate.value!);
      } catch (e) {
        LoggerUtils.error('Error parsing date: $dateString', e);
        selectedDate.value = null;
        dateOfBirthController.text = '';
      }
    } else {
      selectedDate.value = null;
      dateOfBirthController.text = '';
    }
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  /// Show date picker and update the date
  Future<void> selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: selectedDate.value ?? DateTime.now(),
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
    );

    if (picked != null) {
      selectedDate.value = picked;
      dateOfBirthController.text = _formatDate(picked);
    }
  }

  /// Upload profile image
  Future<void> uploadProfileImage() async {
    try {
      isUploadingImage.value = true;

      final imageDto = await _imageService.showImagePickerOptions(
        type: 'profile',
        imageQuality: 85,
        maxWidth: 800,
        maxHeight: 800,
      );

      if (imageDto != null) {
        tempImageUrl.value = imageDto.imageUrl;
        ToastUtils.showSuccess('Image uploaded successfully');
        LoggerUtils.info('Profile image uploaded: ${imageDto.imageUrl}');
      }
    } catch (e) {
      LoggerUtils.error('Error uploading profile image', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isUploadingImage.value = false;
    }
  }

  /// Save profile changes
  Future<void> saveProfile() async {
    try {
      isLoading.value = true;

      // Prepare update data
      final updateData = _buildUpdateData();

      LoggerUtils.info('Saving profile with data: $updateData');

      if (_profileController.userRole.value == 'STUDENT') {
        await _updateStudentProfile(updateData);
      } else if (_profileController.userRole.value == 'STAFF') {
        await _updateStaffProfile(updateData);
      }

      ToastUtils.showSuccess('Profile updated successfully');
      Get.back(); // Return to previous screen
    } catch (e) {
      LoggerUtils.error('Error saving profile', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }

  Map<String, dynamic> _buildUpdateData() {
    final updateData = <String, dynamic>{};

    // Add non-empty values
    if (englishFirstNameController.text.trim().isNotEmpty) {
      updateData['englishFirstName'] = englishFirstNameController.text.trim();
    }
    if (englishLastNameController.text.trim().isNotEmpty) {
      updateData['englishLastName'] = englishLastNameController.text.trim();
    }
    if (khmerFirstNameController.text.trim().isNotEmpty) {
      updateData['khmerFirstName'] = khmerFirstNameController.text.trim();
    }
    if (khmerLastNameController.text.trim().isNotEmpty) {
      updateData['khmerLastName'] = khmerLastNameController.text.trim();
    }
    if (phoneController.text.trim().isNotEmpty) {
      updateData['phoneNumber'] = phoneController.text.trim();
    }
    if (addressController.text.trim().isNotEmpty) {
      updateData['currentAddress'] = addressController.text.trim();
    }
    if (nationalityController.text.trim().isNotEmpty) {
      updateData['nationality'] = nationalityController.text.trim();
    }
    if (ethnicityController.text.trim().isNotEmpty) {
      updateData['ethnicity'] = ethnicityController.text.trim();
    }
    if (placeOfBirthController.text.trim().isNotEmpty) {
      updateData['placeOfBirth'] = placeOfBirthController.text.trim();
    }

    // Add gender with uppercase values
    if (selectedGender.value != null) {
      updateData['gender'] = selectedGender.value!.name.toUpperCase();
    }

    // Add date of birth
    if (selectedDate.value != null) {
      updateData['dateOfBirth'] = _formatDate(selectedDate.value!);
    }

    // Add profile image URL if changed
    if (tempImageUrl.value.isNotEmpty) {
      updateData['profileUrl'] = tempImageUrl.value;
    }

    return updateData;
  }

  Future<void> _updateStudentProfile(Map<String, dynamic> updateData) async {
    final updatedProfile =
        await _profileService.updateStudentProfileByToken(updateData);
    _profileController.studentProfile.value = updatedProfile;
  }

  Future<void> _updateStaffProfile(Map<String, dynamic> updateData) async {
    final updatedProfile =
        await _profileService.updateStaffProfileByToken(updateData);
    _profileController.staffProfile.value = updatedProfile;
  }

  /// Get current profile image URL for display
  String get currentImageUrl {
    if (tempImageUrl.value.isNotEmpty) {
      return tempImageUrl.value;
    }
    return selectedImageUrl.value;
  }

  /// Check if profile has unsaved changes
  bool get hasUnsavedChanges {
    if (tempImageUrl.value.isNotEmpty) return true;

    if (_profileController.userRole.value == 'STUDENT') {
      return _hasStudentChanges();
    } else if (_profileController.userRole.value == 'STAFF') {
      return _hasStaffChanges();
    }
    return false;
  }

  bool _hasStudentChanges() {
    final student = _profileController.studentProfile.value;
    if (student == null) return true;

    return englishFirstNameController.text.trim() !=
            (student.englishFirstName ?? '') ||
        englishLastNameController.text.trim() !=
            (student.englishLastName ?? '') ||
        khmerFirstNameController.text.trim() !=
            (student.khmerFirstName ?? '') ||
        khmerLastNameController.text.trim() != (student.khmerLastName ?? '') ||
        phoneController.text.trim() != (student.phoneNumber ?? '') ||
        addressController.text.trim() != (student.currentAddress ?? '') ||
        nationalityController.text.trim() != (student.nationality ?? '') ||
        ethnicityController.text.trim() != (student.ethnicity ?? '') ||
        placeOfBirthController.text.trim() != (student.placeOfBirth ?? '') ||
        _hasGenderChanged(student.gender) ||
        _hasDateChanged(student.dateOfBirth);
  }

  bool _hasStaffChanges() {
    final staff = _profileController.staffProfile.value;
    if (staff == null) return true;

    return englishFirstNameController.text.trim() !=
            (staff.englishFirstName ?? '') ||
        englishLastNameController.text.trim() !=
            (staff.englishLastName ?? '') ||
        khmerFirstNameController.text.trim() != (staff.khmerFirstName ?? '') ||
        khmerLastNameController.text.trim() != (staff.khmerLastName ?? '') ||
        phoneController.text.trim() != (staff.phoneNumber ?? '') ||
        addressController.text.trim() != (staff.currentAddress ?? '') ||
        nationalityController.text.trim() != (staff.nationality ?? '') ||
        ethnicityController.text.trim() != (staff.ethnicity ?? '') ||
        placeOfBirthController.text.trim() != (staff.placeOfBirth ?? '') ||
        _hasGenderChanged(staff.gender) ||
        _hasDateChanged(staff.dateOfBirth);
  }

  bool _hasGenderChanged(String? originalGender) {
    final currentGenderString = selectedGender.value?.name.toUpperCase();
    return currentGenderString != originalGender?.toUpperCase();
  }

  bool _hasDateChanged(String? originalDate) {
    final currentDateString =
        selectedDate.value != null ? _formatDate(selectedDate.value!) : null;
    return currentDateString != originalDate;
  }

  // Validation for gender (optional field)
  String? validateGender(GenderEnum? value) {
    // Gender is optional, so no validation required
    return null;
  }

  /// Validation methods (all optional now)
  String? validateEnglishName(String? value) {
    return null; // No validation needed
  }

  String? validatePhone(String? value) {
    return null; // No validation needed
  }

  String? validateEmail(String? value) {
    return null; // No validation needed
  }

  String? validateAddress(String? value) {
    return null; // No validation needed
  }

  String? validateOptionalField(String? value) {
    return null;
  }

  String? validateDate(String? value) {
    return null; // No validation needed
  }

  /// Reset form to original values
  void resetForm() {
    tempImageUrl.value = '';
    selectedGender.value = null;
    selectedDate.value = null;
    dateOfBirthController.text = '';
    _loadCurrentProfileData();
  }
}
