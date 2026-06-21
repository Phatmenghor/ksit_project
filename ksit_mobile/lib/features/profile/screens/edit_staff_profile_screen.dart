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
    final editController = Get.isRegistered<EditStaffProfileController>()
        ? Get.find<EditStaffProfileController>()
        : Get.put(EditStaffProfileController());
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
                _buildWorkInfoCard(editController, context),
                const SizedBox(height: 12),
                _buildLocationCard(editController, context),
                const SizedBox(height: 12),
                _buildProfessionalRankSection(editController),
                const SizedBox(height: 12),
                _buildExperienceSection(editController),
                const SizedBox(height: 12),
                _buildPraiseCriticismSection(editController),
                const SizedBox(height: 12),
                _buildEducationSection(editController),
                const SizedBox(height: 12),
                _buildVocationalSection(editController),
                const SizedBox(height: 12),
                _buildShortCourseSection(editController),
                const SizedBox(height: 12),
                _buildLanguageSection(editController),
                const SizedBox(height: 12),
                _buildFamilySection(editController),
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
    EditStaffProfileController editController,
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
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              child: Column(
                children: [
                  // Avatar
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      Obx(() {
                        final imageUrl = editController.currentImageUrl;
                        return Container(
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
                            backgroundImage: imageUrl.isNotEmpty
                                ? _getProfileImage(imageUrl)
                                : null,
                            child: imageUrl.isEmpty
                                ? const Icon(Icons.person,
                                    color: Colors.white54, size: 44)
                                : null,
                          ),
                        );
                      }),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Obx(() => GestureDetector(
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
                            )),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  Obx(() {
                    final staff = profileController.staffProfile.value;
                    return Text(
                      staff?.displayName ?? 'Staff',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    );
                  }),

                  const SizedBox(height: 6),

                  Obx(() {
                    final staff = profileController.staffProfile.value;
                    final roleDisplay = profileController.currentUserRoleDisplay;
                    return Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      alignment: WrapAlignment.center,
                      children: [
                        _buildBadge(Icons.work_outline, roleDisplay,
                            Colors.white),
                        if (staff?.identifyNumber != null &&
                            staff!.identifyNumber!.isNotEmpty)
                          _buildBadge(
                            Icons.badge_outlined,
                            'ID: ${staff.identifyNumber}',
                            Colors.white.withValues(alpha: 0.85),
                          ),
                        if (staff?.staffId != null &&
                            staff!.staffId!.isNotEmpty)
                          _buildBadge(
                            Icons.credit_card_outlined,
                            staff.staffId!,
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
                fontSize: 11, color: color, fontWeight: FontWeight.w500),
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

  Widget _buildTextField({
    required String hint,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
    TextInputAction textInputAction = TextInputAction.next,
    IconData? prefixIconData,
    int maxLines = 1,
    bool readOnly = false,
    Widget? suffixIcon,
    VoidCallback? onTap,
    ValueChanged<String>? onSubmitted,
    required BuildContext context,
  }) {
    return CustomTextField(
      hint: hint,
      controller: controller,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      fillColor: AppColors.body,
      borderRadius: BorderRadius.circular(4),
      maxLines: maxLines,
      readOnly: readOnly,
      suffixIcon: suffixIcon,
      onTap: onTap,
      prefixIcon: prefixIconData != null
          ? Icon(prefixIconData, size: 18, color: AppColors.textSecondary)
          : null,
      onSubmitted: onSubmitted ?? (_) => FocusScope.of(context).nextFocus(),
    );
  }

  // ─── Personal Info ────────────────────────────────────────────────────────

  Widget _buildPersonalInfoCard(
      EditStaffProfileController controller, BuildContext context) {
    return _buildSectionCard(
      icon: Icons.person_outline,
      title: 'ព័ត៌មានផ្ទាល់ខ្លួន',
      children: [
        _buildFieldLabel('នាមត្រកូល និងនាមខ្លួន (ជាភាសាខ្មែរ)'),
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                hint: 'នាមត្រកូល',
                controller: controller.khmerFirstNameController,
                context: context,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildTextField(
                hint: 'នាមខ្លួន',
                controller: controller.khmerLastNameController,
                context: context,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        _buildFieldLabel('ជាអក្សរឡាតាំង (Latin)'),
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                hint: 'First Name',
                controller: controller.englishFirstNameController,
                context: context,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildTextField(
                hint: 'Last Name',
                controller: controller.englishLastNameController,
                context: context,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

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

        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'លេខទូរស័ព្ទ',
                child: _buildTextField(
                  hint: 'Phone',
                  controller: controller.phoneController,
                  keyboardType: TextInputType.phone,
                  prefixIconData: Icons.phone_outlined,
                  context: context,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'ថ្ងៃខែឆ្នាំកំណើត',
                child: _buildTextField(
                  hint: 'YYYY-MM-DD',
                  controller: controller.dateOfBirthController,
                  readOnly: true,
                  suffixIcon: const Icon(Icons.calendar_today_outlined,
                      size: 18, color: AppColors.textSecondary),
                  onTap: () {
                    FocusScope.of(context).unfocus();
                    controller.selectDate(context);
                  },
                  context: context,
                ),
              ),
            ),
          ],
        ),

        _buildField(
          label: 'អ៊ីម៊ែល (Email)',
          child: _buildTextField(
            hint: 'example@email.com',
            controller: controller.emailController,
            keyboardType: TextInputType.emailAddress,
            prefixIconData: Icons.email_outlined,
            context: context,
          ),
        ),

        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'សញ្ជាតិ',
                child: _buildTextField(
                  hint: 'Nationality',
                  controller: controller.nationalityController,
                  context: context,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'ជនជាតិ',
                child: _buildTextField(
                  hint: 'Ethnicity',
                  controller: controller.ethnicityController,
                  context: context,
                ),
              ),
            ),
          ],
        ),

        _buildField(
          label: 'អាសយដ្ឋានបច្ចុប្បន្ន',
          child: _buildTextField(
            hint: 'Current Address',
            controller: controller.addressController,
            maxLines: 2,
            prefixIconData: Icons.location_on_outlined,
            context: context,
          ),
        ),

        _buildField(
          label: 'ទីកន្លែងកំណើត',
          bottomSpacing: 0,
          child: _buildTextField(
            hint: 'Place of Birth',
            controller: controller.placeOfBirthController,
            maxLines: 2,
            prefixIconData: Icons.place_outlined,
            textInputAction: TextInputAction.done,
            onSubmitted: (_) => FocusScope.of(context).unfocus(),
            context: context,
          ),
        ),
      ],
    );
  }

  // ─── Work Information ─────────────────────────────────────────────────────

  Widget _buildWorkInfoCard(
      EditStaffProfileController controller, BuildContext context) {
    return _buildSectionCard(
      icon: Icons.work_outline,
      title: 'ព័ត៌មានការងារ',
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'Staff ID',
                child: _buildTextField(
                  hint: 'Staff ID',
                  controller: controller.staffIdController,
                  prefixIconData: Icons.badge_outlined,
                  context: context,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'National ID / CC',
                child: _buildTextField(
                  hint: 'National ID',
                  controller: controller.nationalIdController,
                  prefixIconData: Icons.credit_card_outlined,
                  context: context,
                ),
              ),
            ),
          ],
        ),

        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'Identify Number',
                child: _buildTextField(
                  hint: 'Identify No.',
                  controller: controller.identifyNumberController,
                  context: context,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'Serial Number',
                child: _buildTextField(
                  hint: 'Serial No.',
                  controller: controller.serialNumberController,
                  context: context,
                ),
              ),
            ),
          ],
        ),

        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'Marital Status',
                child: _buildTextField(
                  hint: 'e.g. Single/Married',
                  controller: controller.maritalStatusController,
                  prefixIconData: Icons.favorite_border,
                  context: context,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'Employee Work',
                child: _buildTextField(
                  hint: 'Employee Type',
                  controller: controller.employeeWorkController,
                  context: context,
                ),
              ),
            ),
          ],
        ),

        _buildField(
          label: 'Current Position',
          child: _buildTextField(
            hint: 'Current Position',
            controller: controller.currentPositionController,
            prefixIconData: Icons.person_pin_outlined,
            context: context,
          ),
        ),

        _buildField(
          label: 'Office Name',
          child: _buildTextField(
            hint: 'Office / Department',
            controller: controller.officeNameController,
            prefixIconData: Icons.business_outlined,
            context: context,
          ),
        ),

        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'Start Work Date',
                child: _buildTextField(
                  hint: 'YYYY-MM-DD',
                  controller: controller.startWorkDateController,
                  context: context,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'Position Date',
                child: _buildTextField(
                  hint: 'YYYY-MM-DD',
                  controller: controller.currentPositionDateController,
                  context: context,
                ),
              ),
            ),
          ],
        ),

        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'Payroll Account No.',
                child: _buildTextField(
                  hint: 'Account No.',
                  controller: controller.payrollAccountNumberController,
                  keyboardType: TextInputType.number,
                  context: context,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'CPP Membership No.',
                child: _buildTextField(
                  hint: 'CPP No.',
                  controller: controller.cppMembershipNumberController,
                  context: context,
                ),
              ),
            ),
          ],
        ),

        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'Decree Final',
                child: _buildTextField(
                  hint: 'Decree Final',
                  controller: controller.decreeFinalController,
                  context: context,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'Rank & Class',
                child: _buildTextField(
                  hint: 'Rank & Class',
                  controller: controller.rankAndClassController,
                  context: context,
                ),
              ),
            ),
          ],
        ),

        _buildField(
          label: 'Disability',
          child: _buildTextField(
            hint: 'Disability (if any)',
            controller: controller.disabilityController,
            context: context,
          ),
        ),

        _buildField(
          label: 'Work History',
          bottomSpacing: 0,
          child: _buildTextField(
            hint: 'Work History',
            controller: controller.workHistoryController,
            maxLines: 3,
            textInputAction: TextInputAction.done,
            onSubmitted: (_) => FocusScope.of(context).unfocus(),
            context: context,
          ),
        ),
      ],
    );
  }

  // ─── Location ─────────────────────────────────────────────────────────────

  Widget _buildLocationCard(
      EditStaffProfileController controller, BuildContext context) {
    return _buildSectionCard(
      icon: Icons.location_on_outlined,
      title: 'ទីតាំង (Address)',
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'ខេត្ត/ក្រុង (Province)',
                child: _buildTextField(
                  hint: 'Province',
                  controller: controller.provinceController,
                  context: context,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'ស្រុក/ខណ្ឌ (District)',
                child: _buildTextField(
                  hint: 'District',
                  controller: controller.districtController,
                  context: context,
                ),
              ),
            ),
          ],
        ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: _buildField(
                label: 'ឃុំ/សង្កាត់ (Commune)',
                child: _buildTextField(
                  hint: 'Commune',
                  controller: controller.communeController,
                  context: context,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildField(
                label: 'ភូមិ (Village)',
                bottomSpacing: 0,
                child: _buildTextField(
                  hint: 'Village',
                  controller: controller.villageController,
                  textInputAction: TextInputAction.done,
                  onSubmitted: (_) => FocusScope.of(context).unfocus(),
                  context: context,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ─── Dynamic array sections ───────────────────────────────────────────────

  Widget _buildProfessionalRankSection(EditStaffProfileController controller) {
    return DynamicInputGrid(
      title: 'ឋានៈវិជ្ជាជីវៈ',
      labels: const [
        'ប្រភេទឋានៈ',
        'បរិយាយ',
        'ប្រកាសលេខ',
        'កាលបរិច្ឆេទ',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'typeOfProfessionalRank',
            type: DynamicFieldType.text,
            placeholder: 'ប្រភេទឋានៈ'),
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
            placeholder: 'កាលបរិច្ឆេទ'),
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
        'ការងារ',
        'អង្គភាព',
        'ថ្ងៃចាប់ផ្តើម',
        'ថ្ងៃបញ្ចប់',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'continuousEmployment',
            type: DynamicFieldType.text,
            placeholder: 'ការងារ'),
        DynamicFieldConfig(
            name: 'workPlace',
            type: DynamicFieldType.text,
            placeholder: 'អង្គភាព'),
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
      title: 'ការសរសើរ / ការស្តីបន្ទោស',
      labels: const [
        'ប្រភេទ',
        'ផ្តល់ដោយ',
        'កាលបរិច្ឆេទ',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'typePraiseOrCriticism',
            type: DynamicFieldType.text,
            placeholder: 'ប្រភេទ'),
        DynamicFieldConfig(
            name: 'giveBy',
            type: DynamicFieldType.text,
            placeholder: 'ផ្តល់ដោយ'),
        DynamicFieldConfig(
            name: 'dateAccepted',
            type: DynamicFieldType.date,
            placeholder: 'កាលបរិច្ឆេទ'),
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
        'កាលបរិច្ឆេទ',
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
            placeholder: 'ឈ្មោះជំនាញ'),
        DynamicFieldConfig(
            name: 'dateAccepted',
            type: DynamicFieldType.date,
            placeholder: 'កាលបរិច្ឆេទ'),
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
        'កម្រិត',
        'ឯកទេសទី១',
        'ឯកទេសទី២',
        'ប្រព័ន្ធ',
        'ថ្ងៃទទួល',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'culturalLevel',
            type: DynamicFieldType.text,
            placeholder: 'កម្រិត'),
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
            placeholder: 'ប្រព័ន្ធ'),
        DynamicFieldConfig(
            name: 'dateAccepted',
            type: DynamicFieldType.date,
            placeholder: 'ថ្ងៃទទួល'),
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
        'ថ្ងៃចាប់',
        'ថ្ងៃបញ្ចប់',
        'រយៈពេល',
        'រៀបចំដោយ',
        'គាំទ្រដោយ',
      ],
      fields: const [
        DynamicFieldConfig(
            name: 'skill',
            type: DynamicFieldType.text,
            placeholder: 'ផ្នែក'),
        DynamicFieldConfig(
            name: 'skillName',
            type: DynamicFieldType.text,
            placeholder: 'ឈ្មោះជំនាញ'),
        DynamicFieldConfig(
            name: 'startDate',
            type: DynamicFieldType.date,
            placeholder: 'ថ្ងៃចាប់'),
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
      labels: const ['ភាសា', 'ការអាន', 'ការសរសេរ', 'ការសន្ទនា'],
      fields: const [
        DynamicFieldConfig(
            name: 'language',
            type: DynamicFieldType.text,
            placeholder: 'ភាសា'),
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
      labels: const ['ឈ្មោះកូន', 'ភេទ', 'ថ្ងៃខែឆ្នាំ', 'មុខរបរ'],
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
            placeholder: 'ថ្ងៃខែឆ្នាំ'),
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

  // ─── Bottom bar ───────────────────────────────────────────────────────────

  Widget _buildBottomBar(
      EditStaffProfileController editController, BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(16, 12, 16, _getBottomPadding(context)),
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

  ImageProvider _getProfileImage(String imageUrl) {
    if (imageUrl.startsWith('http')) return NetworkImage(imageUrl);
    return NetworkImage(AppConfig.baseImageUrl + imageUrl);
  }
}
