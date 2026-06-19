// lib/features/survey/models/survey_models.dart

class SurveyModel {
  final int id;
  final String title;
  final String description;
  final String status;
  final String? createdBy;
  final List<SurveySectionModel> sections;
  final String createdAt;

  const SurveyModel({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    this.createdBy,
    required this.sections,
    required this.createdAt,
  });

  factory SurveyModel.fromJson(Map<String, dynamic> json) {
    return SurveyModel(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String,
      status: json['status'] as String,
      createdBy: json['createdBy'] as String?,
      sections: (json['sections'] as List<dynamic>)
          .map((e) => SurveySectionModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: json['createdAt'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'status': status,
      'createdBy': createdBy,
      'sections': sections.map((e) => e.toJson()).toList(),
      'createdAt': createdAt,
    };
  }

  // Get total number of questions across all sections
  int get totalQuestions {
    return sections.fold(0, (sum, section) => sum + section.questions.length);
  }
}

class SurveySectionModel {
  final int id;
  final String title;
  final String description;
  final int displayOrder;
  final List<SurveyQuestionModel> questions;

  const SurveySectionModel({
    required this.id,
    required this.title,
    required this.description,
    required this.displayOrder,
    required this.questions,
  });

  factory SurveySectionModel.fromJson(Map<String, dynamic> json) {
    return SurveySectionModel(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String,
      displayOrder: json['displayOrder'] as int,
      questions: (json['questions'] as List<dynamic>)
          .map((e) => SurveyQuestionModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'displayOrder': displayOrder,
      'questions': questions.map((e) => e.toJson()).toList(),
    };
  }
}

class SurveyQuestionModel {
  final int id;
  final String questionText;
  final String questionType;
  final bool required;
  final int displayOrder;
  final int? minRating;
  final int? maxRating;
  final String? leftLabel;
  final String? rightLabel;
  final List<RatingOptionModel>? ratingOptions;

  const SurveyQuestionModel({
    required this.id,
    required this.questionText,
    required this.questionType,
    required this.required,
    required this.displayOrder,
    this.minRating,
    this.maxRating,
    this.leftLabel,
    this.rightLabel,
    this.ratingOptions,
  });

  factory SurveyQuestionModel.fromJson(Map<String, dynamic> json) {
    return SurveyQuestionModel(
      id: json['id'] as int,
      questionText: json['questionText'] as String,
      questionType: json['questionType'] as String,
      required: json['required'] as bool,
      displayOrder: json['displayOrder'] as int,
      minRating: json['minRating'] as int?,
      maxRating: json['maxRating'] as int?,
      leftLabel: json['leftLabel'] as String?,
      rightLabel: json['rightLabel'] as String?,
      ratingOptions: json['ratingOptions'] != null
          ? (json['ratingOptions'] as List<dynamic>)
              .map((e) => RatingOptionModel.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionText': questionText,
      'questionType': questionType,
      'required': required,
      'displayOrder': displayOrder,
      'minRating': minRating,
      'maxRating': maxRating,
      'leftLabel': leftLabel,
      'rightLabel': rightLabel,
      'ratingOptions': ratingOptions?.map((e) => e.toJson()).toList(),
    };
  }

  bool get isRatingQuestion => questionType == 'RATING';
  bool get isTextQuestion => questionType == 'TEXT';
}

class RatingOptionModel {
  final int value;
  final String label;

  const RatingOptionModel({
    required this.value,
    required this.label,
  });

  factory RatingOptionModel.fromJson(Map<String, dynamic> json) {
    return RatingOptionModel(
      value: json['value'] as int,
      label: json['label'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'value': value,
      'label': label,
    };
  }
}

class SurveyAnswerModel {
  final int questionId;
  final String? textAnswer;
  final int? ratingAnswer;

  const SurveyAnswerModel({
    required this.questionId,
    this.textAnswer,
    this.ratingAnswer,
  });

  Map<String, dynamic> toJson() {
    return {
      'questionId': questionId,
      'textAnswer': textAnswer,
      'ratingAnswer': ratingAnswer,
    };
  }

  factory SurveyAnswerModel.fromJson(Map<String, dynamic> json) {
    return SurveyAnswerModel(
      questionId: json['questionId'] as int,
      textAnswer: json['textAnswer'] as String?,
      ratingAnswer: json['ratingAnswer'] as int?,
    );
  }
}

class SurveySubmissionModel {
  final List<SurveyAnswerModel> answers;
  final String? overallComment;

  const SurveySubmissionModel({
    required this.answers,
    this.overallComment,
  });

  Map<String, dynamic> toJson() {
    return {
      'answers': answers.map((e) => e.toJson()).toList(),
      'overallComment': overallComment,
    };
  }

  factory SurveySubmissionModel.fromJson(Map<String, dynamic> json) {
    return SurveySubmissionModel(
      answers: (json['answers'] as List<dynamic>)
          .map((e) => SurveyAnswerModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      overallComment: json['overallComment'] as String?,
    );
  }
}
