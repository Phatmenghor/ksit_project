import 'package:get/get.dart';
import 'package:ksit_mobile/core/services/api_service.dart';
import 'package:ksit_mobile/core/services/firebase_service.dart';
import 'package:ksit_mobile/core/services/storage_service.dart';
import 'package:ksit_mobile/features/attandance/services/attendance_service.dart';
import 'package:ksit_mobile/features/auth/controllers/auth_controller.dart';
import 'package:ksit_mobile/features/auth/services/auth_service.dart';
import 'package:ksit_mobile/features/home/controllers/home_controller.dart';
import 'package:ksit_mobile/features/home/services/home_service.dart';
import 'package:ksit_mobile/features/profile/controllers/profile_controller.dart';
import 'package:ksit_mobile/features/profile/services/profile_service.dart';
import 'package:ksit_mobile/features/requet/controllers/request_controller.dart';
import 'package:ksit_mobile/features/requet/services/request_service.dart';
import 'package:ksit_mobile/features/survey/services/survey_service.dart';
import 'package:ksit_mobile/features/transcript/services/transcript_service.dart';

class InitialBinding extends Bindings {
  @override
  Future<void> dependencies() async {
    // Permanent services — survive Get.reset()
    final storageService = await StorageService.getInstance();
    Get.put<StorageService>(storageService, permanent: true);
    Get.put<ApiService>(ApiService(), permanent: true);
    Get.put<FirebaseService>(FirebaseService(), permanent: true);

    // Auth
    Get.lazyPut<AuthService>(() => AuthService(), fenix: true);
    Get.lazyPut<AuthController>(() => AuthController(), fenix: true);

    // Home
    Get.lazyPut<HomeService>(() => HomeService(), fenix: true);
    Get.lazyPut<HomeController>(() => HomeController(), fenix: true);

    // Profile — registered globally so HomeScreen.Get.find<ProfileController>()
    // always succeeds, even before ProfileScreen has been visited.
    Get.lazyPut<ProfileService>(() => ProfileService(), fenix: true);
    Get.lazyPut<ProfileController>(() => ProfileController(), fenix: true);

    // Request
    Get.lazyPut<RequestService>(() => RequestService(), fenix: true);
    Get.lazyPut<RequestController>(() => RequestController(), fenix: true);

    // Attendance — service registered globally so AttendanceController can
    // safely use Get.find<AttendanceService>() whenever it's created.
    Get.lazyPut<AttendanceService>(() => AttendanceService(), fenix: true);

    // Transcript — same reason as attendance
    Get.lazyPut<TranscriptService>(() => TranscriptService(), fenix: true);

    Get.lazyPut<SurveyService>(() => SurveyService(), fenix: true);
  }
}
