// lib/features/transcript/models/transcript_model.dart

/// Enum for semester types
enum SemesterEnum {
  semester1('SEMESTER_1', 1),
  semester2('SEMESTER_2', 2),
  semester3('SEMESTER_3', 3);

  const SemesterEnum(this.value, this.number);
  final String value;
  final int number;

  static SemesterEnum? fromString(String? value) {
    if (value == null) return null;

    for (final semester in SemesterEnum.values) {
      if (semester.value.toUpperCase() == value.toUpperCase()) {
        return semester;
      }
    }
    return null;
  }
}

/// Enum for year levels
enum YearLevelEnum {
  firstYear('FIRST_YEAR', 1, '1st'),
  secondYear('SECOND_YEAR', 2, '2nd'),
  thirdYear('THIRD_YEAR', 3, '3rd'),
  fourthYear('FOURTH_YEAR', 4, '4th');

  const YearLevelEnum(this.value, this.number, this.ordinal);
  final String value;
  final int number;
  final String ordinal;

  static YearLevelEnum? fromString(String? value) {
    if (value == null) return null;

    for (final year in YearLevelEnum.values) {
      if (year.value.toUpperCase() == value.toUpperCase()) {
        return year;
      }
    }
    return null;
  }
}

/// Semester model for academic semester data
class SemesterModel {
  final int? academyYear;
  final String? semester;
  final String? semesterName;
  final String? yearLevel;
  final int? totalCredits;
  final double? gpa;
  final double? gpax;
  final List<CourseModel>? courses;

  const SemesterModel({
    this.academyYear,
    this.semester,
    this.semesterName,
    this.yearLevel,
    this.totalCredits,
    this.gpa,
    this.gpax,
    this.courses,
  });

  factory SemesterModel.fromJson(Map<String, dynamic> json) {
    return SemesterModel(
      academyYear: json['academyYear'] as int?,
      semester: json['semester'] as String?,
      semesterName: json['semesterName'] as String?,
      yearLevel: json['yearLevel'] as String?,
      totalCredits: json['totalCredits'] as int?,
      gpa: (json['gpa'] as num?)?.toDouble(),
      gpax: (json['gpax'] as num?)?.toDouble(),
      courses: (json['courses'] as List<dynamic>?)
          ?.map((courseJson) =>
              CourseModel.fromJson(courseJson as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'academyYear': academyYear,
      'semester': semester,
      'semesterName': semesterName,
      'yearLevel': yearLevel,
      'totalCredits': totalCredits,
      'gpa': gpa,
      'gpax': gpax,
      'courses': courses?.map((course) => course.toJson()).toList(),
    };
  }

  /// Get display name for semester
  String get displayName {
    final semesterEnum = SemesterEnum.fromString(semester);
    final yearEnum = YearLevelEnum.fromString(yearLevel);

    final semesterNum = semesterEnum?.number ?? 1;
    final yearOrd = yearEnum?.ordinal ?? '1st';

    return 'Semester $semesterNum, $yearOrd Year';
  }

  /// Get semester number as integer
  int get semesterNumber {
    return SemesterEnum.fromString(semester)?.number ?? 1;
  }

  /// Get year level as integer
  int get yearNumber {
    return YearLevelEnum.fromString(yearLevel)?.number ?? 1;
  }

  /// Get ordinal suffix for year (1st, 2nd, 3rd, 4th)
  String get yearOrdinal {
    return YearLevelEnum.fromString(yearLevel)?.ordinal ?? '1st';
  }

  /// Get short display name (e.g., "S1, Y2")
  String get shortDisplayName {
    return 'S$semesterNumber, Y$yearNumber';
  }

  /// Get semester enum
  SemesterEnum? get semesterEnum {
    return SemesterEnum.fromString(semester);
  }

  /// Get year level enum
  YearLevelEnum? get yearLevelEnum {
    return YearLevelEnum.fromString(yearLevel);
  }

  /// Check if semester has courses
  bool get hasCourses {
    return courses != null && courses!.isNotEmpty;
  }

  /// Get total credits for completed courses
  int get completedCredits {
    if (courses == null) return 0;
    return courses!
        .where((course) => course.isCompleted)
        .fold<int>(0, (sum, course) => sum + (course.credit ?? 0));
  }

  /// Calculate actual GPA from courses
  double calculateGPA() {
    if (courses == null || courses!.isEmpty) return 0.0;

    double totalGradePoints = 0.0;
    int totalCredits = 0;

    for (final course in courses!) {
      if (course.isCompleted) {
        final gradePoints = course.gradePoints ?? 0.0;
        final credits = course.credit ?? 0;
        totalGradePoints += gradePoints * credits;
        totalCredits += credits;
      }
    }

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0.0;
  }
}

/// Updated TranscriptModel with proper types
class TranscriptModel {
  final int? studentId;
  final String? studentName;
  final String? studentCode;
  final String? className;
  final String? majorName;
  final String? departmentName;
  final String? dateOfBirth;
  final String? degree;
  final int? numberOfCreditsStudied;
  final int? numberOfCreditsTransferred;
  final int? totalNumberOfCreditsEarned;
  final double? cumulativeGradePointAverage;
  final String? academicStatus;
  final List<SemesterModel>? semesters; // Changed from List<dynamic>
  final String? generatedAt;

  const TranscriptModel({
    this.studentId,
    this.studentName,
    this.studentCode,
    this.className,
    this.majorName,
    this.departmentName,
    this.dateOfBirth,
    this.degree,
    this.numberOfCreditsStudied,
    this.numberOfCreditsTransferred,
    this.totalNumberOfCreditsEarned,
    this.cumulativeGradePointAverage,
    this.academicStatus,
    this.semesters,
    this.generatedAt,
  });

  factory TranscriptModel.fromJson(Map<String, dynamic> json) {
    return TranscriptModel(
      studentId: json['studentId'] as int?,
      studentName: json['studentName'] as String?,
      studentCode: json['studentCode'] as String?,
      className: json['className'] as String?,
      majorName: json['majorName'] as String?,
      departmentName: json['departmentName'] as String?,
      dateOfBirth: json['dateOfBirth'] as String?,
      degree: json['degree'] as String?,
      numberOfCreditsStudied: json['numberOfCreditsStudied'] as int?,
      numberOfCreditsTransferred: json['numberOfCreditsTransferred'] as int?,
      totalNumberOfCreditsEarned: json['totalNumberOfCreditsEarned'] as int?,
      cumulativeGradePointAverage:
          (json['cumulativeGradePointAverage'] as num?)?.toDouble(),
      academicStatus: json['academicStatus'] as String?,
      semesters: (json['semesters'] as List<dynamic>?)
          ?.map((semesterJson) =>
              SemesterModel.fromJson(semesterJson as Map<String, dynamic>))
          .toList(),
      generatedAt: json['generatedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'studentId': studentId,
      'studentName': studentName,
      'studentCode': studentCode,
      'className': className,
      'majorName': majorName,
      'departmentName': departmentName,
      'dateOfBirth': dateOfBirth,
      'degree': degree,
      'numberOfCreditsStudied': numberOfCreditsStudied,
      'numberOfCreditsTransferred': numberOfCreditsTransferred,
      'totalNumberOfCreditsEarned': totalNumberOfCreditsEarned,
      'cumulativeGradePointAverage': cumulativeGradePointAverage,
      'academicStatus': academicStatus,
      'semesters': semesters?.map((semester) => semester.toJson()).toList(),
      'generatedAt': generatedAt,
    };
  }

  /// Calculate GPA for a specific semester (now type-safe)
  double calculateSemesterGPA(SemesterModel semester) {
    return semester.calculateGPA();
  }

  /// Get total credits for a specific semester (now type-safe)
  int getTotalCreditsForSemester(SemesterModel semester) {
    if (semester.courses == null) return 0;
    return semester.courses!
        .fold<int>(0, (sum, course) => sum + (course.credit ?? 0));
  }

  /// Calculate overall GPA from all semesters
  double calculateOverallGPA() {
    if (semesters == null || semesters!.isEmpty) return 0.0;

    double totalGradePoints = 0.0;
    int totalCredits = 0;

    for (final semester in semesters!) {
      if (semester.courses != null) {
        for (final course in semester.courses!) {
          if (course.isCompleted) {
            final gradePoints = course.gradePoints ?? 0.0;
            final credits = course.credit ?? 0;
            totalGradePoints += gradePoints * credits;
            totalCredits += credits;
          }
        }
      }
    }

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0.0;
  }

  /// Get all courses across all semesters
  List<CourseModel> get allCourses {
    if (semesters == null) return [];
    return semesters!
        .where((semester) => semester.courses != null)
        .expand((semester) => semester.courses!)
        .toList();
  }

  /// Get courses by status
  List<CourseModel> getCoursesByStatus(String status) {
    return allCourses
        .where((course) => course.status?.toUpperCase() == status.toUpperCase())
        .toList();
  }

  /// Get total credits earned (completed courses only)
  int get totalCreditsEarned {
    return allCourses
        .where((course) => course.isCompleted)
        .fold<int>(0, (sum, course) => sum + (course.credit ?? 0));
  }

  /// Get total credits in progress
  int get totalCreditsInProgress {
    return allCourses
        .where((course) => course.isInProgress)
        .fold<int>(0, (sum, course) => sum + (course.credit ?? 0));
  }

  /// Check if transcript is complete
  bool get isComplete {
    return studentId != null &&
        studentName != null &&
        semesters != null &&
        semesters!.isNotEmpty;
  }

  /// Get completion percentage
  double get completionPercentage {
    final studied = numberOfCreditsStudied ?? 0;
    if (studied == 0) return 0.0;

    final earned = totalNumberOfCreditsEarned ?? 0;
    return (earned / studied) * 100;
  }

  /// Get academic year from class name
  int? get academicYear {
    if (className == null || className!.length < 2) return null;

    try {
      // Extract year from class code (e.g., "25101" -> 2025)
      final yearStr = className!.substring(0, 2);
      final year = int.parse('20$yearStr');
      return year;
    } catch (e) {
      return null;
    }
  }

  /// Get formatted student display name
  String get displayName {
    return studentName ?? studentCode ?? 'Unknown Student';
  }

  /// Get formatted degree with class
  String get degreeWithClass {
    final degreeStr = degree ?? 'Unknown Degree';
    final classStr = className ?? '';
    return classStr.isNotEmpty ? '$degreeStr - Class $classStr' : degreeStr;
  }
}

/// Updated Course model with schedule information
class CourseModel {
  final int? courseId;
  final String? courseCode;
  final String? courseName;
  final String? courseNameKH;
  final int? credit;
  final int? theory;
  final int? execute;
  final int? apply;
  final int? totalHour;
  final String? letterGrade;
  final double? gradePoints;
  final String? status;
  final double? totalScore;
  final double? attendanceScore;
  final double? assignmentScore;
  final double? midtermScore;
  final double? finalScore;

  // Schedule information
  final int? scheduleId;
  final String? dayOfWeek;
  final String? timeSlot;
  final String? roomName;
  final String? teacherName;

  const CourseModel({
    this.courseId,
    this.courseCode,
    this.courseName,
    this.courseNameKH,
    this.credit,
    this.theory,
    this.execute,
    this.apply,
    this.totalHour,
    this.letterGrade,
    this.gradePoints,
    this.status,
    this.totalScore,
    this.attendanceScore,
    this.assignmentScore,
    this.midtermScore,
    this.finalScore,
    this.scheduleId,
    this.dayOfWeek,
    this.timeSlot,
    this.roomName,
    this.teacherName,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      courseId: json['courseId'] as int?,
      courseCode: json['courseCode'] as String?,
      courseName: json['courseName'] as String?,
      courseNameKH: json['courseNameKH'] as String?,
      credit: json['credit'] as int?,
      theory: json['theory'] as int?,
      execute: json['execute'] as int?,
      apply: json['apply'] as int?,
      totalHour: json['totalHour'] as int?,
      letterGrade: json['letterGrade'] as String?,
      gradePoints: (json['gradePoints'] as num?)?.toDouble(),
      status: json['status'] as String?,
      totalScore: (json['totalScore'] as num?)?.toDouble(),
      attendanceScore: (json['attendanceScore'] as num?)?.toDouble(),
      assignmentScore: (json['assignmentScore'] as num?)?.toDouble(),
      midtermScore: (json['midtermScore'] as num?)?.toDouble(),
      finalScore: (json['finalScore'] as num?)?.toDouble(),
      scheduleId: json['scheduleId'] as int?,
      dayOfWeek: json['dayOfWeek'] as String?,
      timeSlot: json['timeSlot'] as String?,
      roomName: json['roomName'] as String?,
      teacherName: json['teacherName'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'courseId': courseId,
      'courseCode': courseCode,
      'courseName': courseName,
      'courseNameKH': courseNameKH,
      'credit': credit,
      'theory': theory,
      'execute': execute,
      'apply': apply,
      'totalHour': totalHour,
      'letterGrade': letterGrade,
      'gradePoints': gradePoints,
      'status': status,
      'totalScore': totalScore,
      'attendanceScore': attendanceScore,
      'assignmentScore': assignmentScore,
      'midtermScore': midtermScore,
      'finalScore': finalScore,
      'scheduleId': scheduleId,
      'dayOfWeek': dayOfWeek,
      'timeSlot': timeSlot,
      'roomName': roomName,
      'teacherName': teacherName,
    };
  }

  /// Get credit structure display (theory.execute.apply)
  String get creditStructure {
    return '${theory ?? 0}.${execute ?? 0}.${apply ?? 0}';
  }

  /// Check if course is completed
  bool get isCompleted {
    return status?.toUpperCase() == 'COMPLETED' && letterGrade != null;
  }

  /// Check if course is in progress
  bool get isInProgress {
    return status?.toUpperCase() == 'IN_PROGRESS';
  }

  /// Get display name (prefer Khmer if available)
  String get displayName {
    return courseNameKH?.isNotEmpty == true
        ? courseNameKH!
        : (courseName ?? 'Unknown Course');
  }

  /// Get schedule display string
  String get scheduleDisplay {
    if (dayOfWeek != null && timeSlot != null) {
      return '$dayOfWeek $timeSlot';
    }
    return 'No schedule';
  }

  /// Get teacher display name
  String get teacherDisplay {
    return teacherName ?? 'Unknown Teacher';
  }

  /// Check if course has valid grade
  bool get hasGrade {
    return letterGrade != null && letterGrade!.isNotEmpty;
  }
}
