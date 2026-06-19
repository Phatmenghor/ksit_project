import 'package:get/get.dart';
import 'package:ksit_mobile/core/services/api_service.dart';
import 'package:ksit_mobile/core/services/firebase_service.dart';
import 'package:ksit_mobile/core/services/storage_service.dart';
import 'package:ksit_mobile/features/auth/controllers/auth_controller.dart';
import 'package:ksit_mobile/features/auth/services/auth_service.dart';
import 'package:ksit_mobile/features/home/controllers/home_controller.dart';
import 'package:ksit_mobile/features/home/services/home_service.dart';
import 'package:ksit_mobile/features/requet/controllers/request_controller.dart';
import 'package:ksit_mobile/features/requet/services/request_service.dart';
import 'package:ksit_mobile/features/survey/services/survey_service.dart';

class InitialBinding extends Bindings {
  @override
  Future<void> dependencies() async {
    // Initialize storage service first
    final storageService = await StorageService.getInstance();
    Get.put<StorageService>(storageService, permanent: true);

    // Initialize other services
    Get.put<ApiService>(ApiService(), permanent: true);
    Get.put<FirebaseService>(FirebaseService(), permanent: true);

    // Initialize auth service and controller login
    Get.lazyPut<AuthService>(() => AuthService(), fenix: true);
    Get.lazyPut<AuthController>(() => AuthController(), fenix: true);

    Get.lazyPut<HomeService>(() => HomeService());
    Get.lazyPut<HomeController>(() => HomeController());

    // Initialize request services and controllers
    Get.lazyPut<RequestService>(() => RequestService());
    Get.lazyPut<RequestController>(() => RequestController());

    Get.lazyPut<SurveyService>(() => SurveyService());
  }
}
