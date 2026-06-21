import 'package:get/get.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/core/utils/logger_utils.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/features/transcript/models/transcript_model.dart';
import 'package:ksit_mobile/features/transcript/services/transcript_service.dart';
import 'package:ksit_mobile/features/profile/controllers/profile_controller.dart';

class TranscriptController extends GetxController {
  final TranscriptService _transcriptService = Get.find<TranscriptService>();
  final ProfileController _profileController = Get.find<ProfileController>();

  // Observables
  final RxBool isLoading = false.obs;
  final RxBool isDownloading = false.obs;
  final Rx<TranscriptModel?> transcript = Rx<TranscriptModel?>(null);

  @override
  void onInit() {
    super.onInit();
    _checkUserRoleAndLoad();
  }

  /// Check if user is a student before loading transcript
  void _checkUserRoleAndLoad() {
    if (_profileController.userRole.value == 'STUDENT') {
      LoggerUtils.info('Transcript access: User is a student, loading transcript');
      loadTranscript();
    } else {
      LoggerUtils.warning('Transcript access denied: User is not a student');
      ToastUtils.showError(
          'Access denied: Transcript is only available for students');
    }
  }

  /// Load student transcript
  Future<void> loadTranscript() async {
    try {
      isLoading.value = true;
      LoggerUtils.info('Loading student transcript');

      final transcriptData = await _transcriptService.getStudentTranscript();
      transcript.value = transcriptData;

      LoggerUtils.info('Transcript loaded successfully');
    } catch (e) {
      LoggerUtils.error('Error loading transcript', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }

  /// Refresh transcript data
  Future<void> refreshTranscript() async {
    ToastUtils.showInfo('Refreshing transcript...');
    await loadTranscript();
    if (transcript.value != null) {
      ToastUtils.showSuccess('Transcript refreshed successfully');
    }
  }

  /// Download transcript as PDF (placeholder functionality)
  Future<void> downloadTranscript() async {
    if (transcript.value == null) {
      ToastUtils.showError('No transcript data available to download');
      return;
    }

    try {
      isDownloading.value = true;
      ToastUtils.showInfo('Preparing transcript download...');

      // Simulate download process
      await Future.delayed(const Duration(seconds: 2));

      ToastUtils.showSuccess('Transcript download completed');
      LoggerUtils.info('Transcript downloaded successfully');
    } catch (e) {
      LoggerUtils.error('Error downloading transcript', e);
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      ToastUtils.showError(errorMessage);
    } finally {
      isDownloading.value = false;
    }
  }

  /// Check if user has access to transcript
  bool get hasTranscriptAccess {
    return _profileController.userRole.value == 'STUDENT';
  }

  /// Get formatted CGPA
  String get formattedCGPA {
    final cgpa = transcript.value?.cumulativeGradePointAverage;
    if (cgpa == null) return '0.00';
    return cgpa.toStringAsFixed(2);
  }

  /// Get total semesters count
  int get totalSemesters {
    return transcript.value?.semesters?.length ?? 0;
  }

  /// Calculate completion percentage
  double get completionPercentage {
    final transcriptData = transcript.value;
    if (transcriptData == null) return 0.0;

    final creditsStudied = transcriptData.numberOfCreditsStudied ?? 0;
    final creditsEarned = transcriptData.totalNumberOfCreditsEarned ?? 0;

    if (creditsStudied == 0) return 0.0;
    return (creditsEarned / creditsStudied) * 100;
  }
}
