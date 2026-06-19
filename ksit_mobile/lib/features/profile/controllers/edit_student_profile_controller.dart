// lib/features/profile/controllers/edit_student_profile_controller.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ksit_mobile/core/services/image_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/features/profile/controllers/profile_controller.dart';
import 'package:ksit_mobile/features/profile/services/profile_service.dart';
import 'package:ksit_mobile/core/utils/logger_utils.dart';

class EditStudentProfileController extends GetxController {
  final ProfileService _profileService = Get.find<ProfileService>();
  final ImageService _imageService = Get.put(ImageService());
  final ProfileController _profileController = Get.find<ProfileController>();

  final Rx<GenderEnum?> selectedGender = Rx<GenderEnum?>(null);
  final Rx<DateTime?> selectedDate = Rx<DateTime?>(null);
  final RxBool isLoading = false.obs;
  final RxBool isUploadingImage = false.obs;
  final RxString selectedImageUrl = ''.obs;
  final RxString tempImageUrl = ''.obs;

  final Map<GenderEnum, String> genderOptions = {
    GenderEnum.male: 'ប្រុស',
    GenderEnum.female: 'ស្រី',
    GenderEnum.other: 'ផ្សេងៗ',
  };

  final formKey = GlobalKey<FormState>();

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

  final RxList<Map<String, dynamic>> studiesHistories =
      <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> parents = <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> siblings = <Map<String, dynamic>>[].obs;

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

      studiesHistories.value = (student.studentStudiesHistory ?? [])
          .map((e) => {
                'id': e.id,
                'typeStudies': e.typeStudies ?? '',
                'schoolName': e.schoolName ?? '',
                'location': e.location ?? '',
                'fromYear': e.fromYear ?? '',
                'endYear': e.endYear ?? '',
                'obtainedCertificate': e.obtainedCertificate ?? '',
                'overallGrade': e.overallGrade ?? '',
              })
          .toList();

      parents.value = (student.studentParent ?? [])
          .map((e) => {
                'id': e.id,
                'name': e.name ?? '',
                'phone': e.phone ?? '',
                'job': e.job ?? '',
                'address': e.address ?? '',
                'age': e.age ?? '',
                'parentType': e.parentType ?? '',
              })
          .toList();

      siblings.value = (student.studentSibling ?? [])
          .map((e) => {
                'id': e.id,
                'name': e.name ?? '',
                'gender': e.gender ?? '',
                'dateOfBirth': e.dateOfBirth ?? '',
                'occupation': e.occupation ?? '',
                'phoneNumber': e.phoneNumber ?? '',
                'address': e.address ?? '',
              })
          .toList();
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
    }
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

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

  Future<void> saveProfile() async {
    try {
      isLoading.value = true;
      final updateData = _buildUpdateData();
      LoggerUtils.info('Saving student profile with data: $updateData');
      final updatedProfile =
          await _profileService.updateStudentProfileByToken(updateData);
      _profileController.studentProfile.value = updatedProfile;
      ToastUtils.showSuccess('Profile updated successfully');
      Get.back();
    } catch (e) {
      LoggerUtils.error('Error saving student profile', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }

  Map<String, dynamic> _buildUpdateData() {
    final updateData = <String, dynamic>{};

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
    if (selectedGender.value != null) {
      updateData['gender'] = selectedGender.value!.name.toUpperCase();
    }
    if (selectedDate.value != null) {
      updateData['dateOfBirth'] = _formatDate(selectedDate.value!);
    }
    if (tempImageUrl.value.isNotEmpty) {
      updateData['profileUrl'] = tempImageUrl.value;
    }

    updateData['studentStudiesHistory'] = _cleanList(studiesHistories);
    updateData['studentParent'] = _cleanList(parents);
    updateData['studentSibling'] = _cleanList(siblings);

    return updateData;
  }

  List<Map<String, dynamic>> _cleanList(List<Map<String, dynamic>> list) {
    return list
        .map((item) {
          final cleaned = <String, dynamic>{};
          if (item['id'] != null) {
            cleaned['id'] = item['id'];
          }
          item.forEach((key, value) {
            if (key != 'id' &&
                value != null &&
                value.toString().trim().isNotEmpty) {
              cleaned[key] = value;
            }
          });
          return cleaned;
        })
        .where((item) => item.keys.length > (item.containsKey('id') ? 1 : 0))
        .toList();
  }

  String get currentImageUrl {
    if (tempImageUrl.value.isNotEmpty) {
      return tempImageUrl.value;
    }
    return selectedImageUrl.value;
  }
}
