// lib/features/home/controllers/schedule_detail_controller.dart
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/utils/toast_utils.dart';
import 'package:ksit_mobile/features/home/models/schedule_models.dart';
import 'package:ksit_mobile/features/home/services/home_service.dart';

class ScheduleDetailController extends GetxController {
  final int scheduleId;
  final HomeService _homeService = Get.find<HomeService>();

  ScheduleDetailController({required this.scheduleId});

  // Observables
  final RxBool isLoading = true.obs;
  final RxString errorMessage = ''.obs;
  final Rx<ScheduleModel?> schedule = Rx<ScheduleModel?>(null);

  @override
  void onInit() {
    super.onInit();
    loadScheduleDetails();
  }

  Future<void> loadScheduleDetails() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final scheduleData = await _homeService.getScheduleById(scheduleId);

      if (scheduleData != null) {
        schedule.value = scheduleData;
      } else {
        errorMessage.value = 'Schedule not found';
      }
    } catch (e) {
      errorMessage.value = 'Failed to load schedule details. Please try again.';
      ToastUtils.showError('Failed to load schedule details');
    } finally {
      isLoading.value = false;
    }
  }

  void refreshSchedule() {
    loadScheduleDetails();
  }

  void navigateBack() {
    if (Get.context != null) {
      Get.context!.pop();
    }
  }
}
