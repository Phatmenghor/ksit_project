// lib/features/transcript/screens/student_transcript_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/features/transcript/controllers/transcript_controller.dart';
import 'package:ksit_mobile/features/transcript/models/transcript_model.dart';
import 'package:ksit_mobile/shared/widgets/loading_widget.dart';
import 'package:ksit_mobile/shared/widgets/empty_state_widget.dart';

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
          return EmptyStateWidget.error(
            title: 'Transcript Not Available',
            message: 'Unable to load your academic transcript at this time.',
            actionText: 'Retry',
            onActionPressed: controller.loadTranscript,
          );
        }

        return Column(
          children: [
            // Header Section
            _buildHeaderSection(controller, context),

            // Content
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    const SizedBox(height: 0),
                    _buildSemestersSection(controller),
                  ],
                ),
              ),
            ),
          ],
        );
      }),
    );
  }

  Widget _buildHeaderSection(
      TranscriptController controller, BuildContext context) {
    final transcript = controller.transcript.value!;

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: AppColors.primary,
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // App Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => context.pop(),
                    padding: EdgeInsets.zero,
                    iconSize: 24,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Text(
                      'Transcript',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(8),
                    child: const Icon(
                      Icons.description,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                ],
              ),
            ),

            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Divider(color: Colors.white38, height: 1),
            ),

            // Statistics Section
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.white.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                children: [
                  _buildStatRow('Number of Credits Studied:',
                      '${transcript.numberOfCreditsStudied ?? 0}'),
                  const SizedBox(height: 12),
                  _buildStatRow('Number of Credits Transferred:', '---'),
                  const SizedBox(height: 12),
                  _buildStatRow('Total # of Credits Earned:',
                      '${transcript.totalNumberOfCreditsEarned ?? 0}'),
                  const SizedBox(height: 12),
                  _buildStatRow(
                      'Cumulative grade point average:',
                      transcript.cumulativeGradePointAverage
                              ?.toStringAsFixed(1) ??
                          '0.0'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 3,
          child: Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 10,
            ),
          ),
        ),
        Expanded(
          flex: 1,
          child: Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
            textAlign: TextAlign.right,
          ),
        ),
      ],
    );
  }

  Widget _buildSemestersSection(TranscriptController controller) {
    final transcript = controller.transcript.value!;
    final semesters = transcript.semesters ?? [];

    if (semesters.isEmpty) {
      return Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Center(
          child: Text(
            'No transcript data available',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
        ),
      );
    }

    return Column(
      children:
          semesters.map((semester) => _buildSemesterCard(semester)).toList(),
    );
  }

  Widget _buildSemesterCard(SemesterModel semester) {
    final courses = semester.courses ?? [];
    final totalCredits = semester.totalCredits ?? 0;
    final gpa = semester.gpa ?? 0.0;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Semester Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  semester.displayName,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                //  $totalCredits   GPA: ${gpa.toStringAsFixed(1)}
                Row(
                  children: [
                    const Text(
                      'Total',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(
                      width: 8,
                    ),
                    Text(
                      'Credits: $totalCredits',
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.primary,
                      ),
                    ),
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 8),
                      width: 1,
                      height: 10,
                      color: AppColors.textSecondary,
                    ),
                    Text(
                      'GPA: $gpa',
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),

          // Courses List
          if (courses.isNotEmpty)
            ...courses.map((course) => _buildCourseItem(course))
          else
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'No courses found for this semester',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCourseItem(CourseModel course) {
    final letterGrade = course.letterGrade ?? 'N/A';
    final credits = course.credit ?? 0;
    final courseName = course.displayName;
    final courseCode = course.courseCode ?? 'N/A';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Course Info
              Expanded(
                child: Text(
                  '$courseCode $courseName ($credits)',
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),

              const SizedBox(width: 12),

              // Grade Circle
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: _getGradeColor(letterGrade),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    letterGrade,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(
            color: AppColors.border,
            thickness: 1,
            height: 1,
          ),
        ],
      ),
    );
  }

  Color _getGradeColor(String? grade) {
    if (grade == null || grade == 'N/A') return AppColors.textSecondary;

    switch (grade.toUpperCase()) {
      case 'A':
      case 'A+':
        return const Color(0xFF2E7D32); // Dark Green
      case 'B':
      case 'B+':
        return const Color(0xFF1976D2); // Blue
      case 'C':
      case 'C+':
        return const Color(0xFFED6C02); // Orange
      case 'D':
        return const Color(0xFFD32F2F); // Red
      case 'F':
        return const Color(0xFF9E9E9E); // Grey
      default:
        return AppColors.textSecondary;
    }
  }
}
