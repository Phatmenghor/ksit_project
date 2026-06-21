// lib/features/transcript/screens/student_transcript_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/features/transcript/controllers/transcript_controller.dart';
import 'package:ksit_mobile/features/transcript/models/transcript_model.dart';
import 'package:ksit_mobile/shared/widgets/empty_state_widget.dart';
import 'package:ksit_mobile/shared/widgets/loading_widget.dart';

class StudentTranscriptScreen extends StatelessWidget {
  const StudentTranscriptScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(TranscriptController());

    return Scaffold(
      backgroundColor: AppColors.body,
      body: Obx(() {
        if (controller.isLoading.value) {
          return const LoadingWidget(
            message: 'Loading transcript...',
            overlay: false,
          );
        }

        if (controller.transcript.value == null) {
          return Column(
            children: [
              _buildHeader(controller, context, null),
              Expanded(
                child: EmptyStateWidget.error(
                  title: 'Transcript Not Available',
                  message:
                      'Unable to load your academic transcript at this time.',
                  actionText: 'Retry',
                  onActionPressed: controller.loadTranscript,
                ),
              ),
            ],
          );
        }

        return Column(
          children: [
            _buildHeader(controller, context, controller.transcript.value),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    const SizedBox(height: 12),
                    _buildSemestersSection(controller),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        );
      }),
    );
  }

  // ─── Header ──────────────────────────────────────────────────────────────

  Widget _buildHeader(TranscriptController controller, BuildContext context,
      TranscriptModel? transcript) {
    final cgpa = transcript?.cumulativeGradePointAverage;
    final creditsStudied = transcript?.numberOfCreditsStudied ?? 0;
    final creditsEarned = transcript?.totalNumberOfCreditsEarned ?? 0;

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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // App bar row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => context.pop(),
                  ),
                  const Expanded(
                    child: Text(
                      'Academic Transcript',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh, color: Colors.white),
                    onPressed: controller.refreshTranscript,
                    tooltip: 'Refresh',
                  ),
                ],
              ),
            ),

            // CGPA + stats
            if (transcript != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 20),
                child: Column(
                  children: [
                    // Big CGPA
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Cumulative GPA',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.white70,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                cgpa != null
                                    ? cgpa.toStringAsFixed(2)
                                    : '0.00',
                                style: const TextStyle(
                                  fontSize: 40,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  height: 1.0,
                                ),
                              ),
                              const Text(
                                'out of 4.00',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.white60,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // GPA ring
                        SizedBox(
                          width: 72,
                          height: 72,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              CircularProgressIndicator(
                                value: (cgpa ?? 0) / 4.0,
                                strokeWidth: 6,
                                backgroundColor:
                                    Colors.white.withValues(alpha: 0.2),
                                valueColor: const AlwaysStoppedAnimation<Color>(
                                    Colors.white),
                              ),
                              Text(
                                '${((cgpa ?? 0) / 4.0 * 100).toStringAsFixed(0)}%',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Stats row
                    Row(
                      children: [
                        _buildStatChip(
                            Icons.school_outlined, '$creditsStudied', 'Studied'),
                        const SizedBox(width: 8),
                        _buildStatChip(
                            Icons.check_circle_outline, '$creditsEarned', 'Earned'),
                        const SizedBox(width: 8),
                        _buildStatChip(
                          Icons.layers_outlined,
                          '${controller.totalSemesters}',
                          'Semesters',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatChip(IconData icon, String value, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: Colors.white),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            Text(
              label,
              style: const TextStyle(fontSize: 10, color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Semesters ────────────────────────────────────────────────────────────

  Widget _buildSemestersSection(TranscriptController controller) {
    final semesters = controller.transcript.value?.semesters ?? [];

    if (semesters.isEmpty) {
      return Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border),
        ),
        child: const Center(
          child: Text(
            'No transcript data available',
            style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
          ),
        ),
      );
    }

    return Column(
      children: semesters
          .map((semester) => _buildSemesterCard(semester))
          .toList(),
    );
  }

  Widget _buildSemesterCard(SemesterModel semester) {
    final courses = semester.courses ?? [];
    final totalCredits = semester.totalCredits ?? 0;
    final gpa = semester.gpa ?? 0.0;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
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
          // Semester header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: AppColors.border),
                left: BorderSide(color: AppColors.primary, width: 3),
              ),
              borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
            ),
            child: Row(
              children: [
                const Icon(Icons.calendar_today_outlined,
                    size: 15, color: AppColors.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    semester.displayName,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                // GPA badge
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getGpaColor(gpa).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: _getGpaColor(gpa).withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    'GPA ${gpa.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: _getGpaColor(gpa),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$totalCredits cr.',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Courses
          if (courses.isNotEmpty)
            ...courses.asMap().entries.map((entry) {
              final isLast = entry.key == courses.length - 1;
              return _buildCourseRow(entry.value, isLast: isLast);
            })
          else
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'No courses found for this semester',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCourseRow(CourseModel course, {bool isLast = false}) {
    final letterGrade = course.letterGrade ?? 'N/A';
    final credits = course.credit ?? 0;
    final courseName = course.displayName;
    final courseCode = course.courseCode ?? '';

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
              // Color dot
              Container(
                width: 6,
                height: 6,
                margin: const EdgeInsets.only(right: 10, top: 2),
                decoration: BoxDecoration(
                  color: _getGradeColor(letterGrade),
                  shape: BoxShape.circle,
                ),
              ),
              // Course info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      courseName,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (courseCode.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        '$courseCode  •  $credits credit${credits == 1 ? '' : 's'}',
                        style: const TextStyle(
                          fontSize: 10,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 12),
              // Grade badge
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: _getGradeColor(letterGrade),
                  borderRadius: BorderRadius.circular(6),
                ),
                alignment: Alignment.center,
                child: Text(
                  letterGrade,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (!isLast)
          const Divider(
            height: 1,
            color: AppColors.border,
            indent: 32,
            endIndent: 16,
          ),
      ],
    );
  }

  Color _getGradeColor(String? grade) {
    if (grade == null || grade == 'N/A') return AppColors.textSecondary;
    switch (grade.toUpperCase()) {
      case 'A':
      case 'A+':
        return const Color(0xFF2E7D32);
      case 'B':
      case 'B+':
        return const Color(0xFF1976D2);
      case 'C':
      case 'C+':
        return const Color(0xFFED6C02);
      case 'D':
        return const Color(0xFFD32F2F);
      case 'F':
        return const Color(0xFF9E9E9E);
      default:
        return AppColors.textSecondary;
    }
  }

  Color _getGpaColor(double gpa) {
    if (gpa >= 3.5) return const Color(0xFF2E7D32);
    if (gpa >= 3.0) return const Color(0xFF1976D2);
    if (gpa >= 2.0) return const Color(0xFFED6C02);
    return const Color(0xFFD32F2F);
  }
}
