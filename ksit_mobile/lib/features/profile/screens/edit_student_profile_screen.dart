// lib/features/profile/screens/edit_student_profile_full_screen.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/config/app_config.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/features/profile/controllers/edit_student_profile_controller.dart';
import 'package:ksit_mobile/features/profile/controllers/profile_controller.dart';
import 'package:ksit_mobile/features/profile/widgets/gender_select_field_widget.dart';
import 'package:ksit_mobile/shared/widgets/custom_text_field.dart';
import 'package:ksit_mobile/shared/widgets/loading_widget.dart';
import 'package:ksit_mobile/shared/widgets/dynamic_input_grid_widget.dart';

class EditStudentProfileFullScreen extends StatelessWidget {
  const EditStudentProfileFullScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final editController = Get.put(EditStudentProfileController());
    final profileController = Get.find<ProfileController>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        centerTitle: false,
        title: const Text(
          'Edit Profile',
          style: TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppColors.primary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
          onPressed: () {
            FocusScope.of(context).unfocus();
            context.pop();
          },
        ),
      ),
      resizeToAvoidBottomInset: false,
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: Obx(() {
          if (profileController.isLoading.value) {
            return const LoadingWidget(message: '', overlay: false);
          }
          return SingleChildScrollView(
            child: Column(
              children: [
                _buildProfileHeader(editController),
                _buildBasicInfoSection(editController, context),
                _buildStudiesHistorySection(editController),
                _buildParentsSection(editController),
                _buildSiblingsSection(editController),
                SizedBox(height: _getContentBottomPadding(context)),
              ],
            ),
          );
        }),
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          bottom: _getBottomPadding(context),
          top: 16,
        ),
        color: Colors.white,
        child: Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  FocusScope.of(context).unfocus();
                  Future.delayed(const Duration(milliseconds: 100), () {
                    context.pop();
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                    side: const BorderSide(color: AppColors.border, width: 1),
                  ),
                ),
                child: const Text('Discard',
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.w400)),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Obx(() => ElevatedButton(
                    onPressed: editController.isLoading.value
                        ? null
                        : () {
                            FocusScope.of(context).unfocus();
                            editController.saveProfile();
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.warning,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    child: editController.isLoading.value
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('Save',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.w600)),
                  )),
            ),
          ],
        ),
      ),
    );
  }

  double _getContentBottomPadding(BuildContext context) {
    final keyboardHeight = MediaQuery.of(context).viewInsets.bottom;
    final buttonBarHeight = 80;
    if (keyboardHeight > 0) {
      return keyboardHeight + buttonBarHeight + 16;
    } else {
      return buttonBarHeight + 32;
    }
  }

  double _getBottomPadding(BuildContext context) {
    final bottomInsets = MediaQuery.of(context).viewInsets.bottom;
    final systemPadding = MediaQuery.of(context).padding.bottom;
    if (Platform.isAndroid) {
      if (bottomInsets > 0) {
        return bottomInsets + 16;
      }
      final hasBottomSystemUI = systemPadding > 0;
      return hasBottomSystemUI ? 96 : 64;
    }
    return bottomInsets > 0 ? bottomInsets + 16 : 32;
  }

  Widget _buildProfileHeader(EditStudentProfileController controller) {
    return Padding(
      padding: const EdgeInsets.only(top: 32),
      child: Column(
        children: [
          Obx(() => Stack(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: Colors.grey[300],
                    backgroundImage: _getProfileImage(controller),
                    child: _getProfileImageChild(controller),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: GestureDetector(
                      onTap: () {
                        FocusScope.of(Get.context!).unfocus();
                        controller.uploadProfileImage();
                      },
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: controller.isUploadingImage.value
                            ? const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                      AppColors.primary),
                                ),
                              )
                            : const Icon(Icons.camera_alt,
                                color: Colors.grey, size: 16),
                      ),
                    ),
                  ),
                ],
              )),
          const SizedBox(height: 16),
          Obx(() {
            final student = Get.find<ProfileController>().studentProfile.value;
            return Text(
              student?.displayName ?? 'N/A',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            );
          }),
          const SizedBox(height: 8),
          Obx(() {
            final student = Get.find<ProfileController>().studentProfile.value;
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'ID : ${student?.identifyNumber ?? 'N/A'}',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.primary,
                ),
              ),
            );
          }),
          const SizedBox(height: 16),
          const Divider(color: AppColors.border, thickness: 8),
        ],
      ),
    );
  }

  Widget _buildBasicInfoSection(
      EditStudentProfileController controller, BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: controller.formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'ព័ត៌មានផ្ទាល់ខ្លួនរបស់និស្សិត',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            const Text('នាមត្រកូល និងនាមខ្លួន',
                style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: CustomTextField(
                    hint: 'នាមត្រកូល',
                    controller: controller.khmerFirstNameController,
                    textInputAction: TextInputAction.next,
                    fillColor: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                    onSubmitted: (value) => FocusScope.of(context).nextFocus(),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CustomTextField(
                    hint: 'នាមខ្លួន',
                    controller: controller.khmerLastNameController,
                    textInputAction: TextInputAction.next,
                    fillColor: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                    onSubmitted: (value) => FocusScope.of(context).nextFocus(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text('ជាអក្សរឡាតាំង',
                style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: CustomTextField(
                    hint: 'First Name',
                    controller: controller.englishFirstNameController,
                    textInputAction: TextInputAction.next,
                    fillColor: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                    onSubmitted: (value) => FocusScope.of(context).nextFocus(),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: CustomTextField(
                    hint: 'Last Name',
                    controller: controller.englishLastNameController,
                    textInputAction: TextInputAction.next,
                    fillColor: Colors.white,
                    borderRadius: BorderRadius.circular(4),
                    onSubmitted: (value) => FocusScope.of(context).nextFocus(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text('ភេទ',
                style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            Obx(() => GenderSelectionField(
                  selectedGender: controller.selectedGender.value,
                  onChanged: (GenderEnum? value) {
                    FocusScope.of(context).unfocus();
                    controller.selectedGender.value = value;
                  },
                  fillColor: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                )),
            const SizedBox(height: 16),
            const Text('លេខទូរស័ព្ទ',
                style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            CustomTextField(
              hint: 'Phone Number',
              controller: controller.phoneController,
              keyboardType: TextInputType.phone,
              textInputAction: TextInputAction.next,
              fillColor: Colors.white,
              borderRadius: BorderRadius.circular(4),
              onSubmitted: (value) => FocusScope.of(context).nextFocus(),
            ),
            const SizedBox(height: 16),
            const Text('ថ្ងៃខែឆ្នាំកំណើត',
                style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            CustomTextField(
              hint: 'Select Date (YYYY-MM-DD)',
              controller: controller.dateOfBirthController,
              readOnly: true,
              suffixIcon: const Icon(Icons.calendar_month),
              fillColor: Colors.white,
              onTap: () {
                FocusScope.of(context).unfocus();
                controller.selectDate(context);
              },
              borderRadius: BorderRadius.circular(4),
            ),
            const SizedBox(height: 16),
            const Text('អ៊ីម៊ែល',
                style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            CustomTextField(
              hint: 'Email',
              controller: controller.emailController,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              fillColor: Colors.white,
              borderRadius: BorderRadius.circular(4),
              onSubmitted: (value) => FocusScope.of(context).nextFocus(),
            ),
            const SizedBox(height: 16),
            const Text('សញ្ជាតិ',
                style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            CustomTextField(
              hint: 'Nationality',
              controller: controller.nationalityController,
              textInputAction: TextInputAction.next,
              fillColor: Colors.white,
              borderRadius: BorderRadius.circular(4),
              onSubmitted: (value) => FocusScope.of(context).nextFocus(),
            ),
            const SizedBox(height: 16),
            const Text('ជនជាតិ',
                style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            CustomTextField(
              hint: 'Ethnicity',
              controller: controller.ethnicityController,
              textInputAction: TextInputAction.next,
              fillColor: Colors.white,
              borderRadius: BorderRadius.circular(4),
              onSubmitted: (value) => FocusScope.of(context).nextFocus(),
            ),
            const SizedBox(height: 16),
            const Text('អាសយដ្ឋានបច្ចុប្បន្ន',
                style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            CustomTextField(
              hint: 'អាសយដ្ឋានបច្ចុប្បន្ន',
              controller: controller.addressController,
              maxLines: 2,
              textInputAction: TextInputAction.next,
              fillColor: Colors.white,
              borderRadius: BorderRadius.circular(4),
              onSubmitted: (value) => FocusScope.of(context).nextFocus(),
            ),
            const SizedBox(height: 16),
            const Text('ទីកន្លែងកំណើត',
                style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            CustomTextField(
              hint: 'Place of Birth',
              controller: controller.placeOfBirthController,
              maxLines: 2,
              textInputAction: TextInputAction.done,
              fillColor: Colors.white,
              borderRadius: BorderRadius.circular(4),
              onSubmitted: (value) => FocusScope.of(context).unfocus(),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildStudiesHistorySection(EditStudentProfileController controller) {
    return DynamicInputGrid(
      title: 'ប្រវត្តិសិក្សា',
      labels: const [
        'កម្រិតថ្នាក់',
        'ឈ្មោះសាលារៀន',
        'ខេត្ត/រាជធានី',
        'ពីឆ្នាំណា',
        'ដល់ឆ្នាំណា',
        'សញ្ញាបត្រទទួលបាន',
        'និទ្ទេសរួម',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'typeStudies',
            type: DynamicFieldType.select,
            placeholder: 'កម្រិតថ្នាក់',
            options: [
              'PRIMARY_SCHOOL',
              'LOWER_SECONDARY_SCHOOL',
              'UPPER_SECONDARY_SCHOOL'
            ]),
        DynamicFieldConfig(
            name: 'schoolName',
            type: DynamicFieldType.text,
            placeholder: 'ឈ្មោះសាលារៀន'),
        DynamicFieldConfig(
            name: 'location',
            type: DynamicFieldType.text,
            placeholder: 'ខេត្ត/រាជធានី'),
        DynamicFieldConfig(
            name: 'fromYear',
            type: DynamicFieldType.date,
            placeholder: 'ពីឆ្នាំណា'),
        DynamicFieldConfig(
            name: 'endYear',
            type: DynamicFieldType.date,
            placeholder: 'ដល់ឆ្នាំណា'),
        DynamicFieldConfig(
            name: 'obtainedCertificate',
            type: DynamicFieldType.text,
            placeholder: 'សញ្ញាបត្រទទួលបាន'),
        DynamicFieldConfig(
            name: 'overallGrade',
            type: DynamicFieldType.text,
            placeholder: 'និទ្ទេសរួម'),
      ],
      initialData: controller.studiesHistories,
      onDataChanged: (data) => controller.studiesHistories.value = data,
      isEditable: true,
      defaultRows: 1,
      isCollapsible: true,
    );
  }

  Widget _buildParentsSection(EditStudentProfileController controller) {
    return DynamicInputGrid(
      title: 'ឪពុកម្តាយ',
      labels: const [
        'ឈ្មោះឪពុកម្តាយ',
        'លេខទូរស័ព្ទ',
        'មុខរបរ',
        'អាសយដ្ឋាន',
        'អាយុ',
        'ប្រភេទឪពុកម្តាយ',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'name',
            type: DynamicFieldType.text,
            placeholder: 'ឈ្មោះឪពុកម្តាយ'),
        DynamicFieldConfig(
            name: 'phone',
            type: DynamicFieldType.text,
            placeholder: 'លេខទូរស័ព្ទ'),
        DynamicFieldConfig(
            name: 'job', type: DynamicFieldType.text, placeholder: 'មុខរបរ'),
        DynamicFieldConfig(
            name: 'address',
            type: DynamicFieldType.text,
            placeholder: 'អាសយដ្ឋាន'),
        DynamicFieldConfig(
            name: 'age', type: DynamicFieldType.text, placeholder: 'អាយុ'),
        DynamicFieldConfig(
            name: 'parentType',
            type: DynamicFieldType.select,
            placeholder: 'ប្រភេទឪពុកម្តាយ',
            options: ['MOTHER', 'FATHER']),
      ],
      initialData: controller.parents,
      onDataChanged: (data) => controller.parents.value = data,
      isEditable: true,
      defaultRows: 1,
      isCollapsible: true,
    );
  }

  Widget _buildSiblingsSection(EditStudentProfileController controller) {
    return DynamicInputGrid(
      title: 'បងប្អូន',
      labels: const [
        'ឈ្មោះបងប្អូន',
        'ភេទ',
        'ថ្ងៃខែឆ្នាំកំណើត',
        'មុខរបរ',
        'លេខទូរស័ព្ទ',
        'អាសយដ្ឋាន',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'name',
            type: DynamicFieldType.text,
            placeholder: 'ឈ្មោះបងប្អូន'),
        DynamicFieldConfig(
            name: 'gender',
            type: DynamicFieldType.select,
            placeholder: 'ភេទ',
            options: ['MALE', 'FEMALE', 'OTHER']),
        DynamicFieldConfig(
            name: 'dateOfBirth',
            type: DynamicFieldType.date,
            placeholder: 'ថ្ងៃខែឆ្នាំកំណើត'),
        DynamicFieldConfig(
            name: 'occupation',
            type: DynamicFieldType.text,
            placeholder: 'មុខរបរ'),
        DynamicFieldConfig(
            name: 'phoneNumber',
            type: DynamicFieldType.text,
            placeholder: 'លេខទូរស័ព្ទ'),
        DynamicFieldConfig(
            name: 'address',
            type: DynamicFieldType.text,
            placeholder: 'អាសយដ្ឋាន'),
      ],
      initialData: controller.siblings,
      onDataChanged: (data) => controller.siblings.value = data,
      isEditable: true,
      defaultRows: 1,
      isCollapsible: true,
    );
  }

  ImageProvider? _getProfileImage(EditStudentProfileController controller) {
    final imageUrl = controller.currentImageUrl;
    if (imageUrl.isNotEmpty) {
      if (imageUrl.startsWith('http')) {
        return NetworkImage(imageUrl);
      } else {
        return NetworkImage(AppConfig.baseImageUrl + imageUrl);
      }
    }
    return null;
  }

  Widget? _getProfileImageChild(EditStudentProfileController controller) {
    final imageUrl = controller.currentImageUrl;
    if (imageUrl.isEmpty) {
      return const Icon(Icons.camera_alt, color: Colors.grey, size: 30);
    }
    return null;
  }
}
