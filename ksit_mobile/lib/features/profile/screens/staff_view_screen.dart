// lib/features/profile/screens/staff_view_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/config/app_config.dart';

import '../../../core/constants/app_colors.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../controllers/profile_controller.dart';

class StaffViewScreen extends StatelessWidget {
  const StaffViewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final profileController = Get.find<ProfileController>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        centerTitle: false,
        title: const Text(
          'Staff Profile',
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

        final staffProfile = profileController.staffProfile.value;

        return SingleChildScrollView(
          child: Column(
            children: [
              // Header Section
              _buildHeaderSection(staffProfile),

              // Personal Information Card
              _buildPersonalInfoCard(staffProfile),

              // Work Information Card
              _buildWorkInfoCard(staffProfile),

              // Professional Rank Section
              if ((staffProfile?.teachersProfessionalRank ?? []).isNotEmpty)
                _buildProfessionalRankSection(staffProfile),

              // Experience Section
              if ((staffProfile?.teacherExperience ?? []).isNotEmpty)
                _buildExperienceSection(staffProfile),

              // Praise/Criticism Section
              if ((staffProfile?.teacherPraiseOrCriticism ?? []).isNotEmpty)
                _buildPraiseCriticismSection(staffProfile),

              // Education Section
              if ((staffProfile?.teacherEducation ?? []).isNotEmpty)
                _buildEducationSection(staffProfile),

              // Vocational Section
              if ((staffProfile?.teacherVocational ?? []).isNotEmpty)
                _buildVocationalSection(staffProfile),

              // Short Course Section
              if ((staffProfile?.teacherShortCourse ?? []).isNotEmpty)
                _buildShortCourseSection(staffProfile),

              // Language Section
              if ((staffProfile?.teacherLanguage ?? []).isNotEmpty)
                _buildLanguageSection(staffProfile),

              // Family Section
              if ((staffProfile?.teacherFamily ?? []).isNotEmpty)
                _buildFamilySection(staffProfile),

              const SizedBox(height: 24),
            ],
          ),
        );
      }),
    );
  }

  // ============= Header Section =============
  Widget _buildHeaderSection(dynamic staffProfile) {
    return Obx(() {
      final controller = Get.find<ProfileController>();
      final imageUrl = controller.staffProfile.value?.profileUrl;
      final hasImage = imageUrl != null && imageUrl.isNotEmpty;

      return Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primary,
              AppColors.primary.withValues(alpha: 0.8),
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
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: CircleAvatar(
                    radius: 48,
                    backgroundColor: Colors.white,
                    backgroundImage: hasImage
                        ? NetworkImage(AppConfig.baseImageUrl + imageUrl)
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
                              color: AppColors.primary.withValues(alpha: 0.2),
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
                  staffProfile?.displayName ?? "N/A",
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
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.4),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    'ID: ${staffProfile?.identifyNumber ?? "N/A"}',
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
  Widget _buildPersonalInfoCard(dynamic staffProfile) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
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
                color: AppColors.primary.withValues(alpha: 0.08),
                borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(12),
                    topRight: Radius.circular(12)),
              ),
              padding: const EdgeInsets.all(16),
              child: const Row(
                children: [
                  Icon(
                    Icons.person_outline,
                    color: AppColors.primary,
                    size: 20,
                  ),
                  SizedBox(width: 10),
                  Text(
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
                  _buildDetailRow(
                      "លេខសមាជិក", staffProfile?.identifyNumber ?? "N/A"),
                  _buildDetailRow(
                    "នាមត្រកូល និងនាម",
                    staffProfile?.khmerFirstName != null ||
                            staffProfile?.khmerLastName != null
                        ? '${staffProfile?.khmerFirstName ?? ""} ${staffProfile?.khmerLastName ?? ""}'
                            .trim()
                        : "N/A",
                  ),
                  _buildDetailRow(
                    "អក្សរឡាតាំង",
                    staffProfile?.englishFirstName != null ||
                            staffProfile?.englishLastName != null
                        ? '${staffProfile?.englishFirstName ?? ""} ${staffProfile?.englishLastName ?? ""}'
                            .trim()
                        : "N/A",
                  ),
                  _buildDetailRow(
                      "ថ្ងៃខែឆ្នាំកំណើត", staffProfile?.dateOfBirth ?? "N/A"),
                  _buildDetailRow("ភេទ", staffProfile?.gender ?? "N/A"),
                  _buildDetailRow("ជនជាតិ", staffProfile?.ethnicity ?? "N/A"),
                  _buildDetailRow(
                      "សញ្ជាតិ", staffProfile?.nationality ?? "N/A"),
                  _buildDetailRow(
                      "ទីកន្លែងកំណើត", staffProfile?.placeOfBirth ?? "N/A"),
                  _buildDetailRow("អាសយដ្ឋានបច្ចុប្បន្ន",
                      staffProfile?.currentAddress ?? "N/A"),
                  _buildDetailRow(
                      "លេខទូរស័ព្ទ", staffProfile?.phoneNumber ?? "N/A"),
                  _buildDetailRow("អុីម៉ែល", staffProfile?.email ?? "N/A",
                      isLast: true),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============= Work Information Card =============
  Widget _buildWorkInfoCard(dynamic staffProfile) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
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
                color: AppColors.primary.withValues(alpha: 0.08),
                borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(12),
                    topRight: Radius.circular(12)),
              ),
              padding: const EdgeInsets.all(16),
              child: const Row(
                children: [
                  Icon(
                    Icons.work_outline,
                    color: AppColors.primary,
                    size: 20,
                  ),
                  SizedBox(width: 10),
                  Text(
                    'ព័ត៌មានការងារ',
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
                  _buildDetailRow("កាលបរិច្ឆេទចាប់ផ្តើម",
                      staffProfile?.startWorkDate ?? "N/A"),
                  _buildDetailRow("សមាសភាពបច្ចុប្បន្ន",
                      staffProfile?.currentPosition ?? "N/A"),
                  _buildDetailRow(
                      "ដេប៉ាតមេង", staffProfile?.department?.name ?? "N/A"),
                  _buildDetailRow(
                      "ឈ្មោះយន្តការ", staffProfile?.officeName ?? "N/A"),
                  _buildDetailRow("ឋានៈ", staffProfile?.rankAndClass ?? "N/A"),
                  _buildDetailRow("ស្ថានភាព", staffProfile?.status ?? "N/A",
                      isLast: true),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============= Professional Rank Section =============
  Widget _buildProfessionalRankSection(dynamic staffProfile) {
    final ranks = staffProfile?.teachersProfessionalRank ?? [];
    if (ranks.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader("ឋានៈវិជ្ជាជីវៈ", Icons.badge_outlined),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: ranks.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final rank = ranks[index];
              return _buildDetailCard(
                children: [
                  _buildDetailRow(
                      "ប្រភេទឋានៈ", rank.typeOfProfessionalRank ?? "N/A"),
                  _buildDetailRow("បរិយាយ", rank.description ?? "N/A"),
                  _buildDetailRow(
                      "ប្រកាសលេខ", rank.announcementNumber ?? "N/A"),
                  _buildDetailRow("កាលបរិច្ឆេទទទួល", rank.dateAccepted ?? "N/A",
                      isLast: true),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  // ============= Experience Section =============
  Widget _buildExperienceSection(dynamic staffProfile) {
    final experiences = staffProfile?.teacherExperience ?? [];
    if (experiences.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader("បទពិសោធន៍ការងារ", Icons.history_edu_outlined),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: experiences.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final exp = experiences[index];
              return _buildDetailCard(
                children: [
                  _buildDetailRow(
                      "ការងារបន្តបន្ទាប់", exp.continuousEmployment ?? "N/A"),
                  _buildDetailRow("ឋានផ្នែក", exp.workPlace ?? "N/A"),
                  _buildDetailRow("ថ្ងៃចាប់ផ្តើម", exp.startDate ?? "N/A"),
                  _buildDetailRow("ថ្ងៃបញ្ចប់", exp.endDate ?? "N/A",
                      isLast: true),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  // ============= Praise/Criticism Section =============
  Widget _buildPraiseCriticismSection(dynamic staffProfile) {
    final items = staffProfile?.teacherPraiseOrCriticism ?? [];
    if (items.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader(
              "ការសរសើរ/ការស្តីបន្ទោស", Icons.star_rate_outlined),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final item = items[index];
              return _buildDetailCard(
                children: [
                  _buildDetailRow(
                      "ប្រភេទ", item.typePraiseOrCriticism ?? "N/A"),
                  _buildDetailRow("ផ្តល់ដោយ", item.giveBy ?? "N/A"),
                  _buildDetailRow("កាលបរិច្ឆេទទទួល", item.dateAccepted ?? "N/A",
                      isLast: true),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  // ============= Education Section =============
  Widget _buildEducationSection(dynamic staffProfile) {
    final educations = staffProfile?.teacherEducation ?? [];
    if (educations.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader("កម្រិតវប្បធម៌", Icons.school_outlined),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: educations.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final edu = educations[index];
              return _buildDetailCard(
                children: [
                  _buildDetailRow("កម្រិតវប្បធម៌", edu.culturalLevel ?? "N/A"),
                  _buildDetailRow("ឈ្មោះជំនាញ", edu.skillName ?? "N/A"),
                  _buildDetailRow("ប្រទេស", edu.country ?? "N/A"),
                  _buildDetailRow("កាលបរិច្ឆេទទទួល", edu.dateAccepted ?? "N/A",
                      isLast: true),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  // ============= Vocational Section =============
  Widget _buildVocationalSection(dynamic staffProfile) {
    final vocationals = staffProfile?.teacherVocational ?? [];
    if (vocationals.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader("កម្រិតវិជ្ជាជីវៈ", Icons.work_history_outlined),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: vocationals.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final voc = vocationals[index];
              return _buildDetailCard(
                children: [
                  _buildDetailRow("កម្រិត", voc.culturalLevel ?? "N/A"),
                  _buildDetailRow("ឯកទេសទី១", voc.skillOne ?? "N/A"),
                  _buildDetailRow("ឯកទេសទី២", voc.skillTwo ?? "N/A"),
                  _buildDetailRow(
                      "ប្រព័ន្ធបណ្តុះបណ្តាល", voc.trainingSystem ?? "N/A"),
                  _buildDetailRow("កាលបរិច្ឆេទទទួល", voc.dateAccepted ?? "N/A",
                      isLast: true),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  // ============= Short Course Section =============
  Widget _buildShortCourseSection(dynamic staffProfile) {
    final shortCourses = staffProfile?.teacherShortCourse ?? [];
    if (shortCourses.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader("វគ្គខ្លីៗ", Icons.assignment_outlined),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: shortCourses.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final course = shortCourses[index];
              return _buildDetailCard(
                children: [
                  _buildDetailRow("ផ្នែក", course.skill ?? "N/A"),
                  _buildDetailRow("ឈ្មោះជំនាញ", course.skillName ?? "N/A"),
                  _buildDetailRow("ថ្ងៃចាប់ផ្តើម", course.startDate ?? "N/A"),
                  _buildDetailRow("ថ្ងៃបញ្ចប់", course.endDate ?? "N/A"),
                  _buildDetailRow("រយៈពេល", course.duration ?? "N/A"),
                  _buildDetailRow("រៀបចំដោយ", course.preparedBy ?? "N/A"),
                  _buildDetailRow("គាំទ្រដោយ", course.supportBy ?? "N/A",
                      isLast: true),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  // ============= Language Section =============
  Widget _buildLanguageSection(dynamic staffProfile) {
    final languages = staffProfile?.teacherLanguage ?? [];
    if (languages.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader("ភាសា", Icons.translate_outlined),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: languages.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final lang = languages[index];
              return _buildDetailCard(
                children: [
                  _buildDetailRow("ភាសា", lang.language ?? "N/A"),
                  _buildDetailRow("ការអាន", lang.reading ?? "N/A"),
                  _buildDetailRow("ការសរសេរ", lang.writing ?? "N/A"),
                  _buildDetailRow("ការសន្ទនា", lang.speaking ?? "N/A",
                      isLast: true),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  // ============= Family Section =============
  Widget _buildFamilySection(dynamic staffProfile) {
    final families = staffProfile?.teacherFamily ?? [];
    if (families.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader("គ្រួសារ", Icons.family_restroom_outlined),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: families.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final family = families[index];
              return _buildDetailCard(
                children: [
                  _buildDetailRow("ឈ្មោះកូន", family.nameChild ?? "N/A"),
                  _buildDetailRow("ភេទ", family.gender ?? "N/A"),
                  _buildDetailRow(
                      "ថ្ងៃខែឆ្នាំកំណើត", family.dateOfBirth ?? "N/A"),
                  _buildDetailRow("មុខរបរ", family.working ?? "N/A",
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
            color: Colors.black.withValues(alpha: 0.08),
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
              color: AppColors.primary.withValues(alpha: 0.1),
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
          color: AppColors.border.withValues(alpha: 0.5),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
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
              color: AppColors.border.withValues(alpha: 0.3),
            ),
          ),
      ],
    );
  }
}
