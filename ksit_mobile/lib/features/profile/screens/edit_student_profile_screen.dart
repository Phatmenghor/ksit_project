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
    final editController = Get.isRegistered<EditStudentProfileController>()
        ? Get.find<EditStudentProfileController>()
        : Get.put(EditStudentProfileController());
    final profileController = Get.find<ProfileController>();

    return Scaffold(
      backgroundColor: AppColors.body,
      resizeToAvoidBottomInset: true,
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: Obx(() {
          if (profileController.isLoading.value) {
            return const LoadingWidget(message: '', overlay: false);
          }
          return SingleChildScrollView(
            child: Column(
              children: [
                _buildHeader(editController, profileController, context),
                const SizedBox(height: 16),
                _buildPersonalInfoCard(editController, context),
                const SizedBox(height: 12),
                _buildStudiesHistorySection(editController),
                const SizedBox(height: 12),
                _buildParentsSection(editController),
                const SizedBox(height: 12),
                _buildSiblingsSection(editController),
                const SizedBox(height: 32),
              ],
            ),
          );
        }),
      ),
      bottomNavigationBar: _buildBottomBar(editController, context),
    );
  }

  // ─── Header ──────────────────────────────────────────────────────────────

  Widget _buildHeader(
    EditStudentProfileController editController,
    ProfileController profileController,
    BuildContext context,
  ) {
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
        child: Column(
          children: [
            // App bar row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () {
                      FocusScope.of(context).unfocus();
                      context.pop();
                    },
                  ),
                  const Expanded(
                    child: Text(
                      'Edit My Profile',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Avatar + name
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              child: Column(
                children: [
                  // Avatar with camera
                  Obx(() => Stack(
                        alignment: Alignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.6),
                                width: 2,
                              ),
                            ),
                            child: CircleAvatar(
                              radius: 44,
                              backgroundColor:
                                  Colors.white.withValues(alpha: 0.2),
                              backgroundImage:
                                  _getProfileImage(editController),
                              child: _getProfileImageChild(editController),
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: GestureDetector(
                              onTap: () {
                                FocusScope.of(Get.context!).unfocus();
                                editController.uploadProfileImage();
                              },
                              child: Container(
                                padding: const EdgeInsets.all(7),
                                decoration: BoxDecoration(
                                  color: AppColors.warning,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                      color: Colors.white, width: 2),
                                ),
                                child: editController.isUploadingImage.value
                                    ? const SizedBox(
                                        width: 14,
                                        height: 14,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor:
                                              AlwaysStoppedAnimation<Color>(
                                                  Colors.white),
                                        ),
                                      )
                                    : const Icon(Icons.camera_alt,
                                        color: Colors.white, size: 14),
                              ),
                            ),
                          ),
                        ],
                      )),

                  const SizedBox(height: 12),

                  // Name
                  Obx(() {
                    final student = profileController.studentProfile.value;
                    return Text(
                      student?.displayName ?? 'Student',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    );
                  }),

                  const SizedBox(height: 6),

                  // Role + ID badges
                  Obx(() {
                    final student = profileController.studentProfile.value;
                    return Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      alignment: WrapAlignment.center,
                      children: [
                        _buildBadge(
                            Icons.school_outlined, 'Student', Colors.white),
                        if (student?.identifyNumber != null &&
                            student!.identifyNumber!.isNotEmpty)
                          _buildBadge(
                            Icons.badge_outlined,
                            'ID: ${student.identifyNumber}',
                            Colors.white.withValues(alpha: 0.85),
                          ),
                        if (student?.studentClass?.code != null)
                          _buildBadge(
                            Icons.class_outlined,
                            student!.studentClass!.code!,
                            Colors.white.withValues(alpha: 0.85),
                          ),
                      ],
                    );
                  }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  // ─── Section card ─────────────────────────────────────────────────────────

  Widget _buildSectionCard({
    required IconData icon,
    required String title,
    required List<Widget> children,
    EdgeInsets? margin,
  }) {
    return Container(
      margin: margin ?? const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section header
          ClipRRect(
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(8)),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.05),
                border: const Border(
                  bottom: BorderSide(color: AppColors.border, width: 1),
                  left: BorderSide(color: AppColors.primary, width: 3),
                ),
              ),
              child: Row(
                children: [
                  Icon(icon, size: 18, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Section content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: children,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }

  Widget _buildField({
    required String label,
    required Widget child,
    double? bottomSpacing,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildFieldLabel(label),
        child,
        SizedBox(height: bottomSpacing ?? 16),
      ],
    );
  }

  // ─── Personal Info Section ────────────────────────────────────────────────

  Widget _buildPersonalInfoCard(
      EditStudentProfileController controller, BuildContext context) {
    return _buildSectionCard(
      icon: Icons.person_outline,
      title: 'ព័ត៌មានផ្ទាល់ខ្លួន',
      children: [
        // Khmer name row
        _buildFieldLabel('នាមត្រកូល និងនាមខ្លួន (ជាភាសាខ្មែរ)'),
        Row(
          children: [
            Expanded(
              child: CustomTextField(
                hint: 'នាមត្រកូល',
                controller: controller.khmerFirstNameController,
                textInputAction: TextInputAction.next,
                fillColor: AppColors.body,
                borderRadius: BorderRadius.circular(4),
                onSubmitted: (_) => FocusScope.of(context).nextFocus(),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: CustomTextField(
                hint: 'នាមខ្លួន',
                controller: controller.khmerLastNameController,
                textInputAction: TextInputAction.next,
                fillColor: AppColors.body,
                borderRadius: BorderRadius.circular(4),
                onSubmitted: (_) => FocusScope.of(context).nextFocus(),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // English name row
        _buildFieldLabel('ជាអក្សរឡាតាំង (Latin)'),
        Row(
          children: [
            Expanded(
              child: CustomTextField(
                hint: 'First Name',
                controller: controller.englishFirstNameController,
                textInputAction: TextInputAction.next,
                fillColor: AppColors.body,
                borderRadius: BorderRadius.circular(4),
                onSubmitted: (_) => FocusScope.of(context).nextFocus(),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: CustomTextField(
                hint: 'Last Name',
                controller: controller.englishLastNameController,
                textInputAction: TextInputAction.next,
                fillColor: AppColors.body,
                borderRadius: BorderRadius.circular(4),
                onSubmitted: (_) => FocusScope.of(context).nextFocus(),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Gender
        _buildField(
          label: 'ភេទ (Gender)',
          child: Obx(() => GenderSelectionField(
                selectedGender: controller.selectedGender.value,
                onChanged: (GenderEnum? v) {
                  FocusScope.of(context).unfocus();
                  controller.selectedGender.value = v;
                },
                fillColor: AppColors.body,
                borderRadius: BorderRadius.circular(4),
              )),
        ),

        // Phone + DOB row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'លេខទូរស័ព្ទ',
                child: CustomTextField(
                  hint: 'Phone Number',
                  controller: controller.phoneController,
                  keyboardType: TextInputType.phone,
                  textInputAction: TextInputAction.next,
                  fillColor: AppColors.body,
                  borderRadius: BorderRadius.circular(4),
                  prefixIcon: const Icon(Icons.phone_outlined,
                      size: 18, color: AppColors.textSecondary),
                  onSubmitted: (_) => FocusScope.of(context).nextFocus(),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'ថ្ងៃខែឆ្នាំកំណើត',
                child: CustomTextField(
                  hint: 'YYYY-MM-DD',
                  controller: controller.dateOfBirthController,
                  readOnly: true,
                  fillColor: AppColors.body,
                  suffixIcon: const Icon(Icons.calendar_today_outlined,
                      size: 18, color: AppColors.textSecondary),
                  onTap: () {
                    FocusScope.of(context).unfocus();
                    controller.selectDate(context);
                  },
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ],
        ),

        // Email
        _buildField(
          label: 'អ៊ីម៊ែល (Email)',
          child: CustomTextField(
            hint: 'example@email.com',
            controller: controller.emailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            fillColor: AppColors.body,
            borderRadius: BorderRadius.circular(4),
            prefixIcon: const Icon(Icons.email_outlined,
                size: 18, color: AppColors.textSecondary),
            onSubmitted: (_) => FocusScope.of(context).nextFocus(),
          ),
        ),

        // Nationality + Ethnicity row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'សញ្ជាតិ',
                child: CustomTextField(
                  hint: 'Nationality',
                  controller: controller.nationalityController,
                  textInputAction: TextInputAction.next,
                  fillColor: AppColors.body,
                  borderRadius: BorderRadius.circular(4),
                  onSubmitted: (_) => FocusScope.of(context).nextFocus(),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'ជនជាតិ',
                child: CustomTextField(
                  hint: 'Ethnicity',
                  controller: controller.ethnicityController,
                  textInputAction: TextInputAction.next,
                  fillColor: AppColors.body,
                  borderRadius: BorderRadius.circular(4),
                  onSubmitted: (_) => FocusScope.of(context).nextFocus(),
                ),
              ),
            ),
          ],
        ),

        // Current Address
        _buildField(
          label: 'អាសយដ្ឋានបច្ចុប្បន្ន',
          child: CustomTextField(
            hint: 'Current Address',
            controller: controller.addressController,
            maxLines: 2,
            textInputAction: TextInputAction.next,
            fillColor: AppColors.body,
            borderRadius: BorderRadius.circular(4),
            prefixIcon: const Icon(Icons.location_on_outlined,
                size: 18, color: AppColors.textSecondary),
            onSubmitted: (_) => FocusScope.of(context).nextFocus(),
          ),
        ),

        // Place of Birth
        _buildField(
          label: 'ទីកន្លែងកំណើត',
          child: CustomTextField(
            hint: 'Place of Birth',
            controller: controller.placeOfBirthController,
            maxLines: 2,
            textInputAction: TextInputAction.next,
            fillColor: AppColors.body,
            borderRadius: BorderRadius.circular(4),
            prefixIcon: const Icon(Icons.place_outlined,
                size: 18, color: AppColors.textSecondary),
            onSubmitted: (_) => FocusScope.of(context).nextFocus(),
          ),
        ),

        // Siblings info row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'ចំនួនបងប្អូន',
                child: CustomTextField(
                  hint: 'Number of Siblings',
                  controller: controller.numberOfSiblingsController,
                  keyboardType: TextInputType.number,
                  textInputAction: TextInputAction.next,
                  fillColor: AppColors.body,
                  borderRadius: BorderRadius.circular(4),
                  onSubmitted: (_) => FocusScope.of(context).nextFocus(),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'សមាជិកក្នុងបងប្អូន',
                bottomSpacing: 0,
                child: CustomTextField(
                  hint: 'Member Siblings',
                  controller: controller.memberSiblingsController,
                  textInputAction: TextInputAction.done,
                  fillColor: AppColors.body,
                  borderRadius: BorderRadius.circular(4),
                  onSubmitted: (_) => FocusScope.of(context).unfocus(),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ─── Dynamic sections ─────────────────────────────────────────────────────

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

  // ─── Bottom bar ───────────────────────────────────────────────────────────

  Widget _buildBottomBar(
      EditStudentProfileController editController, BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
          16, 12, 16, _getBottomPadding(context)),
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(top: BorderSide(color: AppColors.border, width: 1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () {
                FocusScope.of(context).unfocus();
                final navigator = GoRouter.of(context);
                Future.delayed(const Duration(milliseconds: 100), () {
                  navigator.pop();
                });
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.textPrimary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: const BorderSide(color: AppColors.border, width: 1.5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
              child: const Text(
                'Discard',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Obx(() => ElevatedButton(
                  onPressed: editController.isLoading.value
                      ? null
                      : () {
                          FocusScope.of(context).unfocus();
                          editController.saveProfile();
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor:
                        AppColors.primary.withValues(alpha: 0.5),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
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
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.save_outlined, size: 18),
                            SizedBox(width: 6),
                            Text(
                              'Save Changes',
                              style: TextStyle(
                                  fontSize: 15, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                )),
          ),
        ],
      ),
    );
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  double _getBottomPadding(BuildContext context) {
    final bottomInsets = MediaQuery.of(context).viewInsets.bottom;
    final systemPadding = MediaQuery.of(context).padding.bottom;
    if (Platform.isAndroid) {
      if (bottomInsets > 0) return bottomInsets + 8;
      return systemPadding > 0 ? systemPadding + 8 : 8;
    }
    return bottomInsets > 0 ? bottomInsets + 8 : 8;
  }

  ImageProvider? _getProfileImage(EditStudentProfileController controller) {
    final imageUrl = controller.currentImageUrl;
    if (imageUrl.isNotEmpty) {
      if (imageUrl.startsWith('http')) return NetworkImage(imageUrl);
      return NetworkImage(AppConfig.baseImageUrl + imageUrl);
    }
    return null;
  }

  Widget? _getProfileImageChild(EditStudentProfileController controller) {
    if (controller.currentImageUrl.isEmpty) {
      return const Icon(Icons.person, color: Colors.white54, size: 44);
    }
    return null;
  }
}
