// lib/features/profile/screens/student_view_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/config/app_config.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../controllers/profile_controller.dart';

class StudentViewScreen extends StatelessWidget {
  const StudentViewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final profileController = Get.find<ProfileController>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        centerTitle: false,
        title: const Text(
          'Student Profile',
          style: TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppColors.primary,
        elevation: 4,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: Colors.white,
            size: 22,
          ),
          onPressed: () => context.pop(),
        ),
      ),
      body: Obx(() {
        if (profileController.isLoading.value) {
          return const LoadingWidget(
            message: '',
            overlay: false,
          );
        }

        final studentProfile = profileController.studentProfile.value;

        return SingleChildScrollView(
          child: Column(
            children: [
              // Header Section
              _buildHeaderSection(studentProfile),

              // Personal Information Card
              _buildPersonalInfoCard(studentProfile),

              // Academic Info Card
              if (studentProfile?.studentClass != null)
                _buildAcademicInfoCard(studentProfile),

              // Studies History Section
              if ((studentProfile?.studentStudiesHistory ?? []).isNotEmpty)
                _buildStudiesHistorySection(studentProfile),

              // Parents Section
              if ((studentProfile?.studentParent ?? []).isNotEmpty)
                _buildParentsSection(studentProfile),

              // Siblings Section
              if ((studentProfile?.studentSibling ?? []).isNotEmpty)
                _buildSiblingsSection(studentProfile),

              const SizedBox(height: 24),
            ],
          ),
        );
      }),
    );
  }

  // ============= Header Section =============
  Widget _buildHeaderSection(dynamic studentProfile) {
    return Obx(() {
      final controller = Get.find<ProfileController>();
      final imageUrl = controller.studentProfile.value?.profileUrl;
      final hasImage = imageUrl != null && imageUrl.isNotEmpty;

      return Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primary,
              AppColors.primary.withOpacity(0.8),
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
            child: Column(
              children: [
                // Profile Avatar with Shadow
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: CircleAvatar(
                    radius: 48,
                    backgroundColor: Colors.white,
                    backgroundImage: hasImage
                        ? NetworkImage(AppConfig.baseImageUrl + imageUrl!)
                        : null,
                    onBackgroundImageError: hasImage
                        ? (exception, stackTrace) {
                            debugPrint('Image failed: $exception');
                          }
                        : null,
                    child: !hasImage
                        ? Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.primary.withOpacity(0.2),
                            ),
                            child: const Icon(
                              Icons.person,
                              size: 50,
                              color: Colors.white,
                            ),
                          )
                        : null,
                  ),
                ),
                const SizedBox(height: 16),

                // Name and ID
                Text(
                  studentProfile?.displayName ?? "N/A",
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.4),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    'ID: ${studentProfile?.identifyNumber ?? "N/A"}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    });
  }

  // ============= Personal Information Card =============
  Widget _buildPersonalInfoCard(dynamic studentProfile) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card Header
            Container(
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(12),
                    topRight: Radius.circular(12)),
              ),
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(
                    Icons.person_outline,
                    color: AppColors.primary,
                    size: 20,
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'ព័ត៌មានផ្ទាល់ខ្លួន',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildDetailRow("អត្តលេខនិស្សិត",
                      studentProfile?.identifyNumber ?? "N/A"),
                  _buildDetailRow(
                    "នាមត្រកូល និងនាម",
                    studentProfile?.khmerFirstName != null ||
                            studentProfile?.khmerLastName != null
                        ? '${studentProfile?.khmerFirstName ?? ""} ${studentProfile?.khmerLastName ?? ""}'
                            .trim()
                        : "N/A",
                  ),
                  _buildDetailRow(
                    "អក្សរឡាតាំង",
                    studentProfile?.englishFirstName != null ||
                            studentProfile?.englishLastName != null
                        ? '${studentProfile?.englishFirstName ?? ""} ${studentProfile?.englishLastName ?? ""}'
                            .trim()
                        : "N/A",
                  ),
                  _buildDetailRow(
                      "ថ្ងៃខែឆ្នាំកំណើត", studentProfile?.dateOfBirth ?? "N/A"),
                  _buildDetailRow("ភេទ", studentProfile?.gender ?? "N/A"),
                  _buildDetailRow("ជនជាតិ", studentProfile?.ethnicity ?? "N/A"),
                  _buildDetailRow(
                      "សញ្ជាតិ", studentProfile?.nationality ?? "N/A"),
                  _buildDetailRow(
                      "ទីកន្លែងកំណើត", studentProfile?.placeOfBirth ?? "N/A"),
                  _buildDetailRow("អាសយដ្ឋានបច្ចុប្បន្ន",
                      studentProfile?.currentAddress ?? "N/A"),
                  _buildDetailRow(
                      "លេខទូរស័ព្ទ", studentProfile?.phoneNumber ?? "N/A"),
                  _buildDetailRow("អុីម៉ែល", studentProfile?.email ?? "N/A",
                      isLast: true),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============= Academic Information Card =============
  Widget _buildAcademicInfoCard(dynamic studentProfile) {
    final classInfo = studentProfile?.studentClass;
    final major = classInfo?.major;
    final department = major?.department;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card Header
            Container(
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(12),
                    topRight: Radius.circular(12)),
              ),
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(
                    Icons.school_outlined,
                    color: AppColors.primary,
                    size: 20,
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'ព័ត៌មានសិក្សា',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  if (department != null)
                    _buildDetailRow("ដេប៉ាតមេង", department.name ?? "N/A"),
                  if (major != null)
                    _buildDetailRow("វិស័យ", major.name ?? "N/A"),
                  if (classInfo != null)
                    _buildDetailRow("ថ្នាក់រៀន", classInfo.code ?? "N/A"),
                  if (classInfo != null)
                    _buildDetailRow("កម្រិត", classInfo.yearLevel ?? "N/A"),
                  if (classInfo != null)
                    _buildDetailRow("អង្គរឹង", classInfo.degree ?? "N/A",
                        isLast: true),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============= Studies History Section =============
  Widget _buildStudiesHistorySection(dynamic studentProfile) {
    final studies = studentProfile?.studentStudiesHistory ?? [];
    if (studies.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader("ប្រវត្តិសិក្សា", Icons.history_edu_outlined),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: studies.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final study = studies[index];
              return _buildDetailCard(
                children: [
                  _buildDetailRow("កម្រិតថ្នាក់", study.typeStudies ?? "N/A"),
                  _buildDetailRow("ឈ្មោះសាលារៀន", study.schoolName ?? "N/A"),
                  _buildDetailRow("ខេត្ត/រាជធានី", study.location ?? "N/A"),
                  _buildDetailRow("ពីឆ្នាំណា", study.fromYear ?? "N/A"),
                  _buildDetailRow("ដល់ឆ្នាំណា", study.endYear ?? "N/A"),
                  _buildDetailRow(
                      "សញ្ញាបត្រទទួលបាន", study.obtainedCertificate ?? "N/A"),
                  _buildDetailRow("និទ្ទេសរួម", study.overallGrade ?? "N/A",
                      isLast: true),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  // ============= Parents Section =============
  Widget _buildParentsSection(dynamic studentProfile) {
    final parents = studentProfile?.studentParent ?? [];
    if (parents.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader("ឪពុកម្តាយ", Icons.family_restroom_outlined),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: parents.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final parent = parents[index];
              return _buildDetailCard(
                children: [
                  _buildDetailRow("ឈ្មោះឪពុកម្តាយ", parent.name ?? "N/A"),
                  _buildDetailRow("ប្រភេទ", parent.parentType ?? "N/A"),
                  _buildDetailRow("អាយុ", parent.age ?? "N/A"),
                  _buildDetailRow("មុខរបរ", parent.job ?? "N/A"),
                  _buildDetailRow("អាសយដ្ឋាន", parent.address ?? "N/A"),
                  _buildDetailRow("លេខទូរស័ព្ទ", parent.phone ?? "N/A",
                      isLast: true),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  // ============= Siblings Section =============
  Widget _buildSiblingsSection(dynamic studentProfile) {
    final siblings = studentProfile?.studentSibling ?? [];
    if (siblings.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader("បងប្អូន", Icons.people_outline),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: siblings.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final sibling = siblings[index];
              return _buildDetailCard(
                children: [
                  _buildDetailRow("ឈ្មោះបងប្អូន", sibling.name ?? "N/A"),
                  _buildDetailRow("ភេទ", sibling.gender ?? "N/A"),
                  _buildDetailRow(
                      "ថ្ងៃខែឆ្នាំកំណើត", sibling.dateOfBirth ?? "N/A"),
                  _buildDetailRow("មុខរបរ", sibling.occupation ?? "N/A"),
                  _buildDetailRow("លេខទូរស័ព្ទ", sibling.phoneNumber ?? "N/A"),
                  _buildDetailRow("អាសយដ្ឋាន", sibling.address ?? "N/A",
                      isLast: true),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  // ============= Helper Widgets =============
  Widget _buildSectionHeader(String title, IconData icon) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: AppColors.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Text(
            title,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailCard({required List<Widget> children}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.border.withOpacity(0.5),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(children: children),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isLast = false}) {
    return Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 140,
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                  letterSpacing: 0.3,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                value,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                  height: 1.4,
                ),
              ),
            ),
          ],
        ),
        if (!isLast)
          Padding(
            padding: const EdgeInsets.only(top: 12, bottom: 12),
            child: Divider(
              height: 1,
              color: AppColors.border.withOpacity(0.3),
            ),
          ),
      ],
    );
  }
}
