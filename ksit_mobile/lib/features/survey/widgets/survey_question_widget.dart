// lib/features/survey/widgets/survey_question_widget.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ksit_mobile/features/survey/controllers/survey_controller.dart';
import 'package:ksit_mobile/features/survey/models/survey_models.dart';

class SurveyQuestionWidget extends StatelessWidget {
  final SurveyQuestionModel question;
  final SurveyController controller;

  const SurveyQuestionWidget({
    super.key,
    required this.question,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Question text with numbering
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: '${question.displayOrder}. ',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
              TextSpan(
                text: question.questionText,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
              if (question.required)
                const TextSpan(
                  text: ' *',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.red,
                  ),
                ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Question content based on type
        if (question.isRatingQuestion)
          _buildRatingQuestion()
        else if (question.isTextQuestion)
          _buildTextQuestion(),

        // Validation error message
        Obx(() {
          final error = controller.getValidationError(question.id);
          if (error != null) {
            return Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(top: 12),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red, width: 1),
              ),
              child: Text(
                error,
                style: const TextStyle(
                  color: Colors.red,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            );
          }
          return const SizedBox.shrink();
        }),
      ],
    );
  }

  Widget _buildRatingQuestion() {
    final ratingOptions = question.ratingOptions ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Labels row (if available)
        if (question.leftLabel != null || question.rightLabel != null)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '(${question.minRating ?? 1}) ${question.leftLabel ?? 'Strongly Disagree'}',
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
              Text(
                '(${question.maxRating ?? 5}) ${question.rightLabel ?? 'Strongly Agree'}',
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
            ],
          ),

        const SizedBox(height: 16),

        // Rating options
        ...ratingOptions.map((option) => _buildRatingOption(option)),

        if (question.leftLabel != null || question.rightLabel != null) ...[
          const SizedBox(height: 16),

          // Bottom labels row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '(${question.minRating ?? 1}) ${question.leftLabel ?? 'Strongly Disagree'}',
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
              Text(
                '(${question.maxRating ?? 5}) ${question.rightLabel ?? 'Strongly Agree'}',
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildRatingOption(RatingOptionModel option) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Obx(() {
        final isSelected = controller.getAnswer(question.id) == option.value;

        return InkWell(
          onTap: () {
            controller.setRatingAnswer(question.id, option.value);
            // Validate this question immediately when answered
            controller.validateQuestionById(question.id);
          },
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            decoration: BoxDecoration(
              border: Border.all(
                color: isSelected ? const Color(0xFF024D3E) : Colors.grey[300]!,
                width: isSelected ? 2 : 1,
              ),
              borderRadius: BorderRadius.circular(8),
              color: isSelected
                  ? const Color(0xFF024D3E).withValues(alpha: 0.05)
                  : Colors.transparent,
            ),
            child: Row(
              children: [
                // Custom radio button (no checkmark, just filled circle)
                // Custom radio button with checkmark icon when selected
                Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF024D3E)
                          : Colors.grey[400]!,
                      width: 2,
                    ),
                    color: isSelected
                        ? const Color(0xFF024D3E)
                        : Colors.transparent,
                  ),
                  child: isSelected
                      ? const Icon(
                          Icons.check,
                          size: 14,
                          color: Colors.white,
                        )
                      : null,
                ),

                const SizedBox(width: 12),

                // Option label
                Text(
                  option.label,
                  style: TextStyle(
                    fontSize: 14,
                    color:
                        isSelected ? const Color(0xFF024D3E) : Colors.black87,
                    fontWeight:
                        isSelected ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildTextQuestion() {
    final textController = controller.getTextController(question.id);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Instruction text
        const Text(
          'Please fill the information!',
          style: TextStyle(
            fontSize: 12,
            color: Colors.red,
            fontStyle: FontStyle.italic,
          ),
        ),

        const SizedBox(height: 12),

        // Text area
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(8),
          ),
          child: TextField(
            controller: textController,
            onChanged: (value) {
              controller.setTextAnswer(question.id, value);
              // Validate this question immediately when text changes
              controller.validateQuestionById(question.id);
            },
            maxLines: 6,
            decoration: const InputDecoration(
              hintText: 'Your answer here...',
              hintStyle: TextStyle(
                color: Colors.grey,
                fontSize: 14,
              ),
              border: InputBorder.none,
              contentPadding: EdgeInsets.all(16),
            ),
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black87,
            ),
          ),
        ),
      ],
    );
  }
}
