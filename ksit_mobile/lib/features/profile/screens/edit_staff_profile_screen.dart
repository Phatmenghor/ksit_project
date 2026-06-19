// lib/features/profile/screens/edit_staff_profile_full_screen.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/config/app_config.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/core/utils/enums_utils.dart';
import 'package:ksit_mobile/features/profile/controllers/edit_staff_profile_controller.dart';
import 'package:ksit_mobile/features/profile/controllers/profile_controller.dart';
import 'package:ksit_mobile/features/profile/widgets/gender_select_field_widget.dart';
import 'package:ksit_mobile/shared/widgets/custom_text_field.dart';
import 'package:ksit_mobile/shared/widgets/loading_widget.dart';
import 'package:ksit_mobile/shared/widgets/dynamic_input_grid_widget.dart';

class EditStaffProfileFullScreen extends StatelessWidget {
  const EditStaffProfileFullScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final editController = Get.put(EditStaffProfileController());
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
                _buildProfessionalRankSection(editController),
                _buildExperienceSection(editController),
                _buildPraiseCriticismSection(editController),
                _buildEducationSection(editController),
                _buildVocationalSection(editController),
                _buildShortCourseSection(editController),
                _buildLanguageSection(editController),
                _buildFamilySection(editController),
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

  Widget _buildProfileHeader(EditStaffProfileController controller) {
    return Padding(
      padding: const EdgeInsets.only(top: 32),
      child: Column(
        children: [
          Stack(
            children: [
              Obx(() {
                final imageUrl = controller.currentImageUrl;
                final hasImage = imageUrl.isNotEmpty;

                return CircleAvatar(
                  radius: 40,
                  backgroundColor: Colors.grey[300],
                  backgroundImage: hasImage ? _getProfileImage(imageUrl) : null,
                  child: !hasImage
                      ? const Icon(Icons.camera_alt,
                          color: Colors.grey, size: 30)
                      : null,
                );
              }),
              Positioned(
                bottom: 0,
                right: 0,
                child: Obx(() => GestureDetector(
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
                    )),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Obx(() {
            final staff = Get.find<ProfileController>().staffProfile.value;
            return Text(
              staff?.displayName ?? 'N/A',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            );
          }),
          const SizedBox(height: 8),
          Obx(() {
            final staff = Get.find<ProfileController>().staffProfile.value;
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'ID : ${staff?.identifyNumber ?? 'N/A'}',
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

  ImageProvider? _getProfileImage(String imageUrl) {
    if (imageUrl.startsWith('http')) {
      return NetworkImage(imageUrl);
    } else {
      return NetworkImage(AppConfig.baseImageUrl + imageUrl);
    }
  }

  Widget _buildBasicInfoSection(
      EditStaffProfileController controller, BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: controller.formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'ព័ត៌មានផ្ទាល់ខ្លួន',
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

  Widget _buildProfessionalRankSection(EditStaffProfileController controller) {
    return DynamicInputGrid(
      title: 'ឋានៈវិជ្ជាជីវៈ',
      labels: const [
        'ប្រភេទឋានៈវិជ្ជាជីវៈ',
        'បរិយាយ',
        'ប្រកាសលេខ',
        'កាលបរិច្ឆេទទទួល',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'typeOfProfessionalRank',
            type: DynamicFieldType.text,
            placeholder: 'ប្រភេទឋានៈវិជ្ជាជីវៈ'),
        DynamicFieldConfig(
            name: 'description',
            type: DynamicFieldType.text,
            placeholder: 'បរិយាយ'),
        DynamicFieldConfig(
            name: 'announcementNumber',
            type: DynamicFieldType.text,
            placeholder: 'ប្រកាសលេខ'),
        DynamicFieldConfig(
            name: 'dateAccepted',
            type: DynamicFieldType.date,
            placeholder: 'កាលបរិច្ឆេទទទួល'),
      ],
      initialData: controller.professionalRanks,
      onDataChanged: (data) => controller.professionalRanks.value = data,
      isEditable: true,
      defaultRows: 1,
      isCollapsible: true,
    );
  }

  Widget _buildExperienceSection(EditStaffProfileController controller) {
    return DynamicInputGrid(
      title: 'បទពិសោធន៍ការងារ',
      labels: const [
        'ការងារបន្តបន្ទាប់',
        'អង្គភាពបម្រើការងារបច្ចុប្បន្ន',
        'ថ្ងៃចាប់ផ្តើម',
        'ថ្ងៃបញ្ចប់',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'continuousEmployment',
            type: DynamicFieldType.text,
            placeholder: 'ការងារបន្តបន្ទាប់'),
        DynamicFieldConfig(
            name: 'workPlace',
            type: DynamicFieldType.text,
            placeholder: 'អង្គភាពបម្រើការងារបច្ចុប្បន្ន'),
        DynamicFieldConfig(
            name: 'startDate',
            type: DynamicFieldType.date,
            placeholder: 'ថ្ងៃចាប់ផ្តើម'),
        DynamicFieldConfig(
            name: 'endDate',
            type: DynamicFieldType.date,
            placeholder: 'ថ្ងៃបញ្ចប់'),
      ],
      initialData: controller.experiences,
      onDataChanged: (data) => controller.experiences.value = data,
      isEditable: true,
      defaultRows: 1,
      isCollapsible: true,
    );
  }

  Widget _buildPraiseCriticismSection(EditStaffProfileController controller) {
    return DynamicInputGrid(
      title: 'ការសរសើរ/ការស្តីបន្ទោស',
      labels: const [
        'ប្រភេទនៃការសរសើរ/ការស្តីបន្ទោស',
        'ផ្តល់ដោយ',
        'កាលបរិច្ឆេទទទួល',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'typePraiseOrCriticism',
            type: DynamicFieldType.text,
            placeholder: 'ប្រភេទនៃការសរសើរ/ការស្តីបន្ទោស'),
        DynamicFieldConfig(
            name: 'giveBy',
            type: DynamicFieldType.text,
            placeholder: 'ផ្តល់ដោយ'),
        DynamicFieldConfig(
            name: 'dateAccepted',
            type: DynamicFieldType.date,
            placeholder: 'កាលបរិច្ឆេទទទួល'),
      ],
      initialData: controller.praiseCriticisms,
      onDataChanged: (data) => controller.praiseCriticisms.value = data,
      isEditable: true,
      defaultRows: 1,
      isCollapsible: true,
    );
  }

  Widget _buildEducationSection(EditStaffProfileController controller) {
    return DynamicInputGrid(
      title: 'កម្រិតវប្បធម៌',
      labels: const [
        'កម្រិតវប្បធម៌',
        'ឈ្មោះជំនាញ',
        'កាលបរិច្ឆេទទទួល',
        'ប្រទេស',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'culturalLevel',
            type: DynamicFieldType.text,
            placeholder: 'កម្រិតវប្បធម៌'),
        DynamicFieldConfig(
            name: 'skillName',
            type: DynamicFieldType.text,
            placeholder: 'ឈ្មោះជំនាญ'),
        DynamicFieldConfig(
            name: 'dateAccepted',
            type: DynamicFieldType.date,
            placeholder: 'កាលបរិច្ឆេទទទួល'),
        DynamicFieldConfig(
            name: 'country',
            type: DynamicFieldType.text,
            placeholder: 'ប្រទេស'),
      ],
      initialData: controller.educations,
      onDataChanged: (data) => controller.educations.value = data,
      isEditable: true,
      defaultRows: 1,
      isCollapsible: true,
    );
  }

  Widget _buildVocationalSection(EditStaffProfileController controller) {
    return DynamicInputGrid(
      title: 'កម្រិតវិជ្ជាជីវៈ',
      labels: const [
        'កម្រិតវិជ្ជាជីវៈ',
        'ឯកទេសទី១',
        'ឯកទេសទី២',
        'ប្រព័ន្ធបណ្តុះបណ្តាល',
        'ថ្ងៃខែបានទទួល',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'culturalLevel',
            type: DynamicFieldType.text,
            placeholder: 'កម្រិតវិជ្ជាជីវៈ'),
        DynamicFieldConfig(
            name: 'skillOne',
            type: DynamicFieldType.text,
            placeholder: 'ឯកទេសទី១'),
        DynamicFieldConfig(
            name: 'skillTwo',
            type: DynamicFieldType.text,
            placeholder: 'ឯកទេសទី២'),
        DynamicFieldConfig(
            name: 'trainingSystem',
            type: DynamicFieldType.text,
            placeholder: 'ប្រព័ន្ធបណ្តុះបណ្តាល'),
        DynamicFieldConfig(
            name: 'dateAccepted',
            type: DynamicFieldType.date,
            placeholder: 'ថ្ងៃខែបានទទួល'),
      ],
      initialData: controller.vocational,
      onDataChanged: (data) => controller.vocational.value = data,
      isEditable: true,
      defaultRows: 1,
      isCollapsible: true,
    );
  }

  Widget _buildShortCourseSection(EditStaffProfileController controller) {
    return DynamicInputGrid(
      title: 'វគ្គខ្លីៗ',
      labels: const [
        'ផ្នែក',
        'ឈ្មោះជំនាញ',
        'ថ្ងៃចាប់ផ្តើម',
        'ថ្ងៃបញ្ចប់',
        'រយៈពេល',
        'រៀបចំដោយ',
        'គាំទ្រដោយ',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'skill', type: DynamicFieldType.text, placeholder: 'ផ្នែក'),
        DynamicFieldConfig(
            name: 'skillName',
            type: DynamicFieldType.text,
            placeholder: 'ឈ្មោះជំនាញ'),
        DynamicFieldConfig(
            name: 'startDate',
            type: DynamicFieldType.date,
            placeholder: 'ថ្ងៃចាប់ផ្តើម'),
        DynamicFieldConfig(
            name: 'endDate',
            type: DynamicFieldType.date,
            placeholder: 'ថ្ងៃបញ្ចប់'),
        DynamicFieldConfig(
            name: 'duration',
            type: DynamicFieldType.text,
            placeholder: 'រយៈពេល'),
        DynamicFieldConfig(
            name: 'preparedBy',
            type: DynamicFieldType.text,
            placeholder: 'រៀបចំដោយ'),
        DynamicFieldConfig(
            name: 'supportBy',
            type: DynamicFieldType.text,
            placeholder: 'គាំទ្រដោយ'),
      ],
      initialData: controller.shortCourses,
      onDataChanged: (data) => controller.shortCourses.value = data,
      isEditable: true,
      defaultRows: 1,
      isCollapsible: true,
    );
  }

  Widget _buildLanguageSection(EditStaffProfileController controller) {
    return DynamicInputGrid(
      title: 'ភាសា',
      labels: const [
        'ផ្នែភាសា',
        'ការអាន',
        'ការសរសេរ',
        'ការសន្ទនា',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'language',
            type: DynamicFieldType.text,
            placeholder: 'ផ្នែភាសា'),
        DynamicFieldConfig(
            name: 'reading',
            type: DynamicFieldType.text,
            placeholder: 'ការអាន'),
        DynamicFieldConfig(
            name: 'writing',
            type: DynamicFieldType.text,
            placeholder: 'ការសរសេរ'),
        DynamicFieldConfig(
            name: 'speaking',
            type: DynamicFieldType.text,
            placeholder: 'ការសន្ទនា'),
      ],
      initialData: controller.languages,
      onDataChanged: (data) => controller.languages.value = data,
      isEditable: true,
      defaultRows: 1,
      isCollapsible: true,
    );
  }

  Widget _buildFamilySection(EditStaffProfileController controller) {
    return DynamicInputGrid(
      title: 'គ្រួសារ',
      labels: const [
        'ឈ្មោះកូន',
        'ភេទ',
        'ថ្ងៃខែឆ្នាំកំណើត',
        'មុខរបរ',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'nameChild',
            type: DynamicFieldType.text,
            placeholder: 'ឈ្មោះកូន'),
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
            name: 'working',
            type: DynamicFieldType.text,
            placeholder: 'មុខរបរ'),
      ],
      initialData: controller.families,
      onDataChanged: (data) => controller.families.value = data,
      isEditable: true,
      defaultRows: 1,
      isCollapsible: true,
    );
  }
}
