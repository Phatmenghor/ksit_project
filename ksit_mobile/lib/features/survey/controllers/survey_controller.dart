// lib/features/survey/controllers/survey_controller.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/features/survey/models/survey_models.dart';
import 'package:ksit_mobile/features/survey/services/survey_service.dart';
import 'package:ksit_mobile/features/home/models/schedule_models.dart';
import 'package:ksit_mobile/features/home/services/home_service.dart';

class SurveyController extends GetxController {
  final int scheduleId;
  final SurveyService _surveyService = Get.find<SurveyService>();
  final HomeService _homeService = Get.find<HomeService>();

  SurveyController({required this.scheduleId});

  // Observables
  final RxBool isLoading = true.obs;
  final RxBool isSubmitting = false.obs;
  final RxString errorMessage = ''.obs;
  final Rx<SurveyModel?> survey = Rx<SurveyModel?>(null);
  final Rx<ScheduleModel?> schedule = Rx<ScheduleModel?>(null);

  // Survey answers
  final RxMap<int, dynamic> answers = <int, dynamic>{}.obs;
  final RxMap<int, TextEditingController> textControllers =
      <int, TextEditingController>{}.obs;

  // Validation
  final RxMap<int, String> validationErrors = <int, String>{}.obs;

  @override
  void onInit() {
    super.onInit();
    loadSurveyData();
  }

  @override
  void onClose() {
    // Dispose text controllers
    for (final controller in textControllers.values) {
      controller.dispose();
    }
    super.onClose();
  }

  Future<void> loadSurveyData() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      // Load survey and schedule data concurrently
      final results = await Future.wait([
        _surveyService.getMainSurvey(),
        _homeService.getScheduleById(scheduleId),
      ]);

      survey.value = results[0] as SurveyModel;
      schedule.value = results[1] as ScheduleModel?;

      if (schedule.value == null) {
        errorMessage.value = 'Schedule not found';
        return;
      }

      // Initialize text controllers for text questions
      _initializeTextControllers();
    } catch (e) {
      errorMessage.value = 'Failed to load survey. Please try again.';
      ToastUtils.showError('Failed to load survey');
    } finally {
      isLoading.value = false;
    }
  }

  void _initializeTextControllers() {
    final surveyData = survey.value;
    if (surveyData == null) return;

    for (final section in surveyData.sections) {
      for (final question in section.questions) {
        if (question.isTextQuestion) {
          textControllers[question.id] = TextEditingController();
        }
      }
    }
  }

  // Answer management
  void setRatingAnswer(int questionId, int value) {
    answers[questionId] = value;
    _clearValidationError(questionId);
  }

  void setTextAnswer(int questionId, String value) {
    answers[questionId] = value;
    _clearValidationError(questionId);
  }

  dynamic getAnswer(int questionId) {
    return answers[questionId];
  }

  TextEditingController? getTextController(int questionId) {
    return textControllers[questionId];
  }

  // Get all questions for validation
  List<SurveyQuestionModel> get allQuestions {
    final surveyData = survey.value;
    if (surveyData == null) return [];

    final List<SurveyQuestionModel> questions = [];
    for (final section in surveyData.sections) {
      questions.addAll(section.questions);
    }
    return questions;
  }

  // Validation methods
  bool _validateQuestion(SurveyQuestionModel question) {
    if (!question.required) return true;

    final answer = getAnswer(question.id);

    if (question.isRatingQuestion) {
      if (answer == null) {
        _addValidationError(question.id, 'Please select a rating');
        return false;
      }
    } else if (question.isTextQuestion) {
      final textAnswer = answer as String?;
      if (textAnswer == null || textAnswer.trim().isEmpty) {
        _addValidationError(question.id, 'Please fill the information above!');
        return false;
      }
    }

    _clearValidationError(question.id);
    return true;
  }

  // Validate specific question by ID
  bool validateQuestionById(int questionId) {
    final question = allQuestions.firstWhereOrNull((q) => q.id == questionId);
    if (question == null) return true;
    return _validateQuestion(question);
  }

  bool _validateAllAnswers() {
    validationErrors.clear();
    bool isValid = true;

    final surveyData = survey.value;
    if (surveyData == null) return false;

    for (final section in surveyData.sections) {
      for (final question in section.questions) {
        if (!_validateQuestion(question)) {
          isValid = false;
        }
      }
    }

    return isValid;
  }

  void _addValidationError(int questionId, String message) {
    validationErrors[questionId] = message;
  }

  void _clearValidationError(int questionId) {
    validationErrors.remove(questionId);
  }

  String? getValidationError(int questionId) {
    return validationErrors[questionId];
  }

  // Submission
  Future<void> submitSurvey() async {
    try {
      // Update text answers from controllers
      for (final entry in textControllers.entries) {
        final questionId = entry.key;
        final controller = entry.value;
        if (controller.text.isNotEmpty) {
          answers[questionId] = controller.text;
        }
      }

      if (!_validateAllAnswers()) {
        ToastUtils.showError('Please complete all required questions');
        return;
      }

      isSubmitting.value = true;

      // Prepare submission data
      final answersList = <SurveyAnswerModel>[];

      for (final entry in answers.entries) {
        final questionId = entry.key;
        final answer = entry.value;

        if (answer is int) {
          answersList.add(SurveyAnswerModel(
            questionId: questionId,
            ratingAnswer: answer,
          ));
        } else if (answer is String && answer.isNotEmpty) {
          answersList.add(SurveyAnswerModel(
            questionId: questionId,
            textAnswer: answer,
          ));
        }
      }

      final submission = SurveySubmissionModel(answers: answersList);

      final success = await _surveyService.submitSurvey(
        scheduleId: scheduleId,
        submission: submission,
      );

      if (success) {
        _showSuccessModal();
      }
    } catch (e) {
      ToastUtils.showError('Failed to submit survey. Please try again.');
    } finally {
      isSubmitting.value = false;
    }
  }

  void _showSuccessModal() {
    final scheduleData = schedule.value;

    Get.dialog(
      AlertDialog(
        contentPadding: EdgeInsets.zero,
        content: Container(
          width: double.maxFinite,
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Success icon
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check,
                  color: Colors.green,
                  size: 30,
                ),
              ),

              const SizedBox(height: 16),

              // Title
              const Text(
                'Submitted!',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                ),
              ),

              const SizedBox(height: 8),

              // Timestamp
              Text(
                DateTime.now().toString().split('.')[0], // Remove microseconds
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
              ),

              const SizedBox(height: 16),

              // Thank you message
              const Text(
                'Thank you for taking the time to complete this survey.\nYour feedback is greatly appreciated!',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.black87,
                ),
              ),

              const SizedBox(height: 24),

              // Schedule details
              if (scheduleData != null) ...[
                _buildDetailRow(
                    'Subject', scheduleData.course?.displayName ?? 'N/A'),
                _buildDetailRow(
                    'Class Code', scheduleData.classes?.displayCode ?? 'N/A'),
                _buildDetailRow('Day',
                    '${scheduleData.dayDisplayName} (${scheduleData.timeRange})'),
                _buildDetailRow(
                    'Instructor', scheduleData.teacher?.displayName ?? 'N/A'),
                const SizedBox(height: 24),
              ],

              // Done button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Get.back(); // Close dialog
                    Get.context?.pop(true); // Go back with success result
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Done',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: Colors.black87,
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }

  void refreshSurvey() {
    loadSurveyData();
  }

  void navigateBack() {
    if (Get.context != null) {
      Get.context!.pop();
    }
  }
}
