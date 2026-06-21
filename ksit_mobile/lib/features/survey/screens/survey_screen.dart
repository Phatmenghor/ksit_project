// lib/features/survey/screens/survey_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/core/constants/app_image.dart';
import 'package:ksit_mobile/features/survey/controllers/survey_controller.dart';
import 'package:ksit_mobile/features/survey/widgets/survey_question_widget.dart';
import 'package:ksit_mobile/shared/widgets/loading_widget.dart';

class SurveyScreen extends StatelessWidget {
  final int scheduleId;

  const SurveyScreen({
    super.key,
    required this.scheduleId,
  });

  @override
  Widget build(BuildContext context) {
    final tag = 'survey_$scheduleId';
    if (Get.isRegistered<SurveyController>(tag: tag)) {
      Get.delete<SurveyController>(tag: tag);
    }

    final controller = Get.put(
      SurveyController(scheduleId: scheduleId),
      tag: tag,
    );

    return Obx(() => Scaffold(
          backgroundColor:
              controller.isLoading.value ? null : AppColors.primary,
          appBar: AppBar(
            title: const Text(
              'Survey Form',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            centerTitle: false,
            backgroundColor:
                controller.isLoading.value ? null : AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => context.pop(),
            ),
          ),
          body: _buildBody(controller),
        ));
  }

  Widget _buildBody(SurveyController controller) {
    if (controller.isLoading.value) {
      return const LoadingWidget(
        message: 'Loading survey...',
        overlay: false,
      );
    }

    if (controller.errorMessage.value.isNotEmpty) {
      return _buildErrorState(controller);
    }

    final survey = controller.survey.value;
    final schedule = controller.schedule.value;

    if (survey == null || schedule == null) {
      return const Center(
        child: Text(
          'Survey not available',
          style: TextStyle(color: Colors.white),
        ),
      );
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Divider(
            color: Colors.white.withValues(alpha: 0.2),
            thickness: 1,
          ),
        ),
        _buildHeaderSection(schedule),
        Expanded(
          child: _buildAllQuestionsView(controller, survey),
        ),
      ],
    );
  }

  Widget _buildHeaderSection(dynamic schedule) {
    return Container(
      color: AppColors.primary,
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: Colors.white,
            child: ClipOval(
              child: Image.asset(
                AppImages.logoSchool,
                width: 40,
                height: 40,
                fit: BoxFit.cover,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  schedule.course?.displayName ?? 'N/A',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'Class ${schedule.classes?.displayCode ?? 'N/A'} | ${schedule.teacher?.displayName ?? 'N/A'}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.white70,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAllQuestionsView(SurveyController controller, dynamic survey) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ...survey.sections.map<Widget>(
                      (section) => _buildSectionWidget(section, controller)),
                  const SizedBox(height: 32),
                  _buildSubmitButton(controller),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionWidget(dynamic section, SurveyController controller) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF2196F3).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: const Color(0xFF2196F3),
                style: BorderStyle.solid,
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${section.displayOrder}. ${section.title}',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                if (section.description.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    section.description,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
          ...section.questions.map<Widget>(
            (question) => Container(
              margin: const EdgeInsets.only(bottom: 24),
              child: SurveyQuestionWidget(
                question: question,
                controller: controller,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmitButton(SurveyController controller) {
    return Obx(() {
      return SizedBox(
        width: double.infinity,
        height: 48,
        child: ElevatedButton(
          onPressed:
              controller.isSubmitting.value ? null : controller.submitSurvey,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: controller.isSubmitting.value
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : const Text(
                  'Submit',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
        ),
      );
    });
  }

  Widget _buildErrorState(SurveyController controller) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.white,
            ),
            const SizedBox(height: 16),
            const Text(
              'Error Loading Survey',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              controller.errorMessage.value,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.white70,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: controller.loadSurveyData,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 12,
                ),
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
