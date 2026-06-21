// lib/features/profile/controllers/edit_staff_profile_controller.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ksit_mobile/core/services/image_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/features/profile/controllers/profile_controller.dart';
import 'package:ksit_mobile/features/profile/services/profile_service.dart';
import 'package:ksit_mobile/core/utils/logger_utils.dart';

class EditStaffProfileController extends GetxController {
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

  // Work information
  final staffIdController = TextEditingController();
  final nationalIdController = TextEditingController();
  final identifyNumberController = TextEditingController();
  final maritalStatusController = TextEditingController();
  final currentPositionController = TextEditingController();
  final officeNameController = TextEditingController();
  final startWorkDateController = TextEditingController();
  final currentPositionDateController = TextEditingController();
  final employeeWorkController = TextEditingController();
  final disabilityController = TextEditingController();
  final payrollAccountNumberController = TextEditingController();
  final cppMembershipNumberController = TextEditingController();
  final decreeFinalController = TextEditingController();
  final rankAndClassController = TextEditingController();
  final serialNumberController = TextEditingController();
  final workHistoryController = TextEditingController();

  // Location
  final provinceController = TextEditingController();
  final districtController = TextEditingController();
  final communeController = TextEditingController();
  final villageController = TextEditingController();

  final RxList<Map<String, dynamic>> professionalRanks =
      <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> experiences = <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> praiseCriticisms =
      <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> educations = <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> vocational = <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> shortCourses =
      <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> languages = <Map<String, dynamic>>[].obs;
  final RxList<Map<String, dynamic>> families = <Map<String, dynamic>>[].obs;

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
    staffIdController.dispose();
    nationalIdController.dispose();
    identifyNumberController.dispose();
    maritalStatusController.dispose();
    currentPositionController.dispose();
    officeNameController.dispose();
    startWorkDateController.dispose();
    currentPositionDateController.dispose();
    employeeWorkController.dispose();
    disabilityController.dispose();
    payrollAccountNumberController.dispose();
    cppMembershipNumberController.dispose();
    decreeFinalController.dispose();
    rankAndClassController.dispose();
    serialNumberController.dispose();
    workHistoryController.dispose();
    provinceController.dispose();
    districtController.dispose();
    communeController.dispose();
    villageController.dispose();
  }

  void _loadCurrentProfileData() {
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

      staffIdController.text = staff.staffId ?? '';
      nationalIdController.text = staff.nationalId ?? '';
      identifyNumberController.text = staff.identifyNumber ?? '';
      maritalStatusController.text = staff.maritalStatus ?? '';
      currentPositionController.text = staff.currentPosition ?? '';
      officeNameController.text = staff.officeName ?? '';
      startWorkDateController.text = staff.startWorkDate ?? '';
      currentPositionDateController.text = staff.currentPositionDate ?? '';
      employeeWorkController.text = staff.employeeWork ?? '';
      disabilityController.text = staff.disability ?? '';
      payrollAccountNumberController.text = staff.payrollAccountNumber ?? '';
      cppMembershipNumberController.text = staff.cppMembershipNumber ?? '';
      decreeFinalController.text = staff.decreeFinal ?? '';
      rankAndClassController.text = staff.rankAndClass ?? '';
      serialNumberController.text = staff.serialNumber ?? '';
      workHistoryController.text = staff.workHistory ?? '';
      provinceController.text = staff.province ?? '';
      districtController.text = staff.district ?? '';
      communeController.text = staff.commune ?? '';
      villageController.text = staff.village ?? '';
      _loadGenderFromProfile(staff.gender);
      _loadDateFromProfile(staff.dateOfBirth);

      professionalRanks.value = (staff.teachersProfessionalRank ?? [])
          .map((e) => {
                'id': e.id,
                'typeOfProfessionalRank': e.typeOfProfessionalRank ?? '',
                'description': e.description ?? '',
                'announcementNumber': e.announcementNumber ?? '',
                'dateAccepted': e.dateAccepted ?? '',
              })
          .toList();

      experiences.value = (staff.teacherExperience ?? [])
          .map((e) => {
                'id': e.id,
                'continuousEmployment': e.continuousEmployment ?? '',
                'workPlace': e.workPlace ?? '',
                'startDate': e.startDate ?? '',
                'endDate': e.endDate ?? '',
              })
          .toList();

      praiseCriticisms.value = (staff.teacherPraiseOrCriticism ?? [])
          .map((e) => {
                'id': e.id,
                'typePraiseOrCriticism': e.typePraiseOrCriticism ?? '',
                'giveBy': e.giveBy ?? '',
                'dateAccepted': e.dateAccepted ?? '',
              })
          .toList();

      educations.value = (staff.teacherEducation ?? [])
          .map((e) => {
                'id': e.id,
                'culturalLevel': e.culturalLevel ?? '',
                'skillName': e.skillName ?? '',
                'dateAccepted': e.dateAccepted ?? '',
                'country': e.country ?? '',
              })
          .toList();

      vocational.value = (staff.teacherVocational ?? [])
          .map((e) => {
                'id': e.id,
                'culturalLevel': e.culturalLevel ?? '',
                'skillOne': e.skillOne ?? '',
                'skillTwo': e.skillTwo ?? '',
                'trainingSystem': e.trainingSystem ?? '',
                'dateAccepted': e.dateAccepted ?? '',
              })
          .toList();

      shortCourses.value = (staff.teacherShortCourse ?? [])
          .map((e) => {
                'id': e.id,
                'skill': e.skill ?? '',
                'skillName': e.skillName ?? '',
                'startDate': e.startDate ?? '',
                'endDate': e.endDate ?? '',
                'duration': e.duration ?? '',
                'preparedBy': e.preparedBy ?? '',
                'supportBy': e.supportBy ?? '',
              })
          .toList();

      languages.value = (staff.teacherLanguage ?? [])
          .map((e) => {
                'id': e.id,
                'language': e.language ?? '',
                'reading': e.reading ?? '',
                'writing': e.writing ?? '',
                'speaking': e.speaking ?? '',
              })
          .toList();

      families.value = (staff.teacherFamily ?? [])
          .map((e) => {
                'id': e.id,
                'nameChild': e.nameChild ?? '',
                'gender': e.gender ?? '',
                'dateOfBirth': e.dateOfBirth ?? '',
                'working': e.working ?? '',
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
      LoggerUtils.info('Saving staff profile with data: $updateData');
      final updatedProfile =
          await _profileService.updateStaffProfileByToken(updateData);
      _profileController.staffProfile.value = updatedProfile;
      ToastUtils.showSuccess('Profile updated successfully');
      Get.back();
    } catch (e) {
      LoggerUtils.error('Error saving staff profile', e);
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
    if (staffIdController.text.trim().isNotEmpty) {
      updateData['staffId'] = staffIdController.text.trim();
    }
    if (nationalIdController.text.trim().isNotEmpty) {
      updateData['nationalId'] = nationalIdController.text.trim();
    }
    if (identifyNumberController.text.trim().isNotEmpty) {
      updateData['identifyNumber'] = identifyNumberController.text.trim();
    }
    if (maritalStatusController.text.trim().isNotEmpty) {
      updateData['maritalStatus'] = maritalStatusController.text.trim();
    }
    if (currentPositionController.text.trim().isNotEmpty) {
      updateData['currentPosition'] = currentPositionController.text.trim();
    }
    if (officeNameController.text.trim().isNotEmpty) {
      updateData['officeName'] = officeNameController.text.trim();
    }
    if (startWorkDateController.text.trim().isNotEmpty) {
      updateData['startWorkDate'] = startWorkDateController.text.trim();
    }
    if (currentPositionDateController.text.trim().isNotEmpty) {
      updateData['currentPositionDate'] = currentPositionDateController.text.trim();
    }
    if (employeeWorkController.text.trim().isNotEmpty) {
      updateData['employeeWork'] = employeeWorkController.text.trim();
    }
    if (disabilityController.text.trim().isNotEmpty) {
      updateData['disability'] = disabilityController.text.trim();
    }
    if (payrollAccountNumberController.text.trim().isNotEmpty) {
      updateData['payrollAccountNumber'] = payrollAccountNumberController.text.trim();
    }
    if (cppMembershipNumberController.text.trim().isNotEmpty) {
      updateData['cppMembershipNumber'] = cppMembershipNumberController.text.trim();
    }
    if (decreeFinalController.text.trim().isNotEmpty) {
      updateData['decreeFinal'] = decreeFinalController.text.trim();
    }
    if (rankAndClassController.text.trim().isNotEmpty) {
      updateData['rankAndClass'] = rankAndClassController.text.trim();
    }
    if (serialNumberController.text.trim().isNotEmpty) {
      updateData['serialNumber'] = serialNumberController.text.trim();
    }
    if (workHistoryController.text.trim().isNotEmpty) {
      updateData['workHistory'] = workHistoryController.text.trim();
    }
    if (provinceController.text.trim().isNotEmpty) {
      updateData['province'] = provinceController.text.trim();
    }
    if (districtController.text.trim().isNotEmpty) {
      updateData['district'] = districtController.text.trim();
    }
    if (communeController.text.trim().isNotEmpty) {
      updateData['commune'] = communeController.text.trim();
    }
    if (villageController.text.trim().isNotEmpty) {
      updateData['village'] = villageController.text.trim();
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

    updateData['teachersProfessionalRank'] = _cleanList(professionalRanks);
    updateData['teacherExperience'] = _cleanList(experiences);
    updateData['teacherPraiseOrCriticism'] = _cleanList(praiseCriticisms);
    updateData['teacherEducation'] = _cleanList(educations);
    updateData['teacherVocational'] = _cleanList(vocational);
    updateData['teacherShortCourse'] = _cleanList(shortCourses);
    updateData['teacherLanguage'] = _cleanList(languages);
    updateData['teacherFamily'] = _cleanList(families);

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
