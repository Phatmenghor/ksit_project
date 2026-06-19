// lib/features/scan/controllers/scan_controller.dart (Bank-Style - Minimal)
import 'dart:async';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:ksit_mobile/features/scan/models/qr_attendance_response_models.dart';

import '../../../core/utils/logger_utils.dart';
import '../../../core/utils/api_error_utils.dart';
import '../services/qr_attendance_service.dart';
import '../widgets/attendance_result_modal.dart';

class ScanController extends GetxController {
  final QrAttendanceService _qrAttendanceService =
      Get.put(QrAttendanceService());

  // Mobile Scanner Controller
  late MobileScannerController scannerController;

  // Observables
  final RxBool isFlashOn = false.obs;
  final RxBool isSubmittingAttendance = false.obs;
  final RxString scannedQrCode = ''.obs;
  final RxBool canScan = true.obs;

  // Detection and scanning states
  final RxBool isDetecting = false.obs;
  final RxBool isScanning = false.obs;
  final RxInt scanCooldownSeconds = 0.obs;
  final RxInt detectionCountdown = 0.obs;
  final RxBool hasScannedInSession = false.obs;

  // Auto-zoom
  final RxDouble currentZoom = 1.0.obs;
  final RxDouble minZoom = 1.0.obs;
  final RxDouble maxZoom = 3.0.obs;
  final RxBool isAutoZoomEnabled = true.obs;

  // Timing settings
  static const int detectionDelayDuration = 2;
  static const int scanCooldownDuration = 3;
  static const double autoZoomThreshold = 0.5;

  Timer? _cooldownTimer;
  Timer? _detectionTimer;
  Timer? _detectionCountdownTimer;
  String? _pendingQrCode;
  int _qrDetectionCount = 0;
  static const int qrDetectionCountThreshold = 2;

  @override
  void onInit() {
    super.onInit();
    _initializeScanner();
  }

  @override
  void onClose() {
    _cooldownTimer?.cancel();
    _detectionTimer?.cancel();
    _detectionCountdownTimer?.cancel();
    try {
      scannerController.dispose();
    } catch (e) {
      LoggerUtils.error('Error disposing scanner controller', e);
    }
    super.onClose();
  }

  void _initializeScanner() {
    try {
      scannerController = MobileScannerController(
        detectionSpeed: DetectionSpeed.normal,
        facing: CameraFacing.back,
        torchEnabled: false,
        autoStart: true,
      );

      LoggerUtils.info('Scanner initialized');
    } catch (e) {
      LoggerUtils.error('Failed to initialize scanner', e);
    }
  }

  /// Auto-zoom based on QR code detection
  void _performAutoZoom(BarcodeCapture capture) {
    if (!isAutoZoomEnabled.value) return;

    try {
      final barcodes = capture.barcodes;
      if (barcodes.isEmpty) {
        if (_qrDetectionCount > 0) {
          _qrDetectionCount--;
        }
        if (_qrDetectionCount <= 0) {
          _resetAutoZoom();
        }
        return;
      }

      final barcode = barcodes.first;
      final boundingBox = barcode.corners;

      if (boundingBox.isNotEmpty) {
        final qrSize = _calculateQrSize(boundingBox);
        final optimalZoom = _calculateOptimalZoom(qrSize);

        _qrDetectionCount++;

        if (_qrDetectionCount >= qrDetectionCountThreshold) {
          if ((optimalZoom - currentZoom.value).abs() > 0.1) {
            currentZoom.value = optimalZoom;
            LoggerUtils.debug('Auto-zoom: ${optimalZoom.toStringAsFixed(2)}x');
          }
        }
      }
    } catch (e) {
      LoggerUtils.debug('Auto-zoom error: $e');
    }
  }

  /// Calculate QR code size from bounding box
  double _calculateQrSize(List<Offset> corners) {
    if (corners.isEmpty) return 0;

    double minX = corners.first.dx;
    double maxX = corners.first.dx;
    double minY = corners.first.dy;
    double maxY = corners.first.dy;

    for (var corner in corners) {
      minX = minX > corner.dx ? corner.dx : minX;
      maxX = maxX < corner.dx ? corner.dx : maxX;
      minY = minY > corner.dy ? corner.dy : minY;
      maxY = maxY < corner.dy ? corner.dy : maxY;
    }

    return ((maxX - minX) + (maxY - minY)) / 2;
  }

  /// Calculate optimal zoom level
  double _calculateOptimalZoom(double qrSize) {
    const double targetQrSize = 200;
    const double screenSize = 400;

    if (qrSize <= 0) return 1.0;

    final zoom = (targetQrSize / qrSize) * (screenSize / 400);
    return zoom.clamp(minZoom.value, maxZoom.value);
  }

  /// Reset zoom to default
  void _resetAutoZoom() {
    if (currentZoom.value != 1.0) {
      currentZoom.value = 1.0;
      _qrDetectionCount = 0;
    }
  }

  void onDetect(BarcodeCapture capture) {
    if (!canScan.value ||
        isScanning.value ||
        isSubmittingAttendance.value ||
        isDetecting.value) {
      return;
    }

    if (scanCooldownSeconds.value > 0) {
      return;
    }

    // Auto-zoom when QR detected
    _performAutoZoom(capture);

    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final String? code = barcode.rawValue;
      if (code != null && code.isNotEmpty) {
        _startDetectionDelay(code);
        break;
      }
    }
  }

  void _startDetectionDelay(String qrCode) {
    if (isDetecting.value) return;

    isDetecting.value = true;
    _pendingQrCode = qrCode;
    detectionCountdown.value = detectionDelayDuration;

    HapticFeedback.selectionClick();

    LoggerUtils.info('QR Code detected: $qrCode');

    _detectionCountdownTimer =
        Timer.periodic(const Duration(seconds: 1), (timer) {
      if (detectionCountdown.value <= 1) {
        detectionCountdown.value = 0;
        timer.cancel();
        _processScanResult();
      } else {
        detectionCountdown.value--;
      }
    });

    _detectionTimer = Timer(Duration(seconds: detectionDelayDuration), () {
      if (isDetecting.value && _pendingQrCode == qrCode) {
        _processScanResult();
      }
    });
  }

  void _cancelDetection() {
    _detectionTimer?.cancel();
    _detectionCountdownTimer?.cancel();
    isDetecting.value = false;
    detectionCountdown.value = 0;
    _pendingQrCode = null;
  }

  void _processScanResult() {
    if (_pendingQrCode == null ||
        isScanning.value ||
        isSubmittingAttendance.value) return;

    _detectionTimer?.cancel();
    _detectionCountdownTimer?.cancel();
    isDetecting.value = false;
    detectionCountdown.value = 0;

    isScanning.value = true;
    canScan.value = false;
    scannedQrCode.value = _pendingQrCode!;

    HapticFeedback.mediumImpact();

    _submitAttendance(_pendingQrCode!);
    _pendingQrCode = null;
  }

  Future<void> _submitAttendance(String qrCode) async {
    try {
      isSubmittingAttendance.value = true;

      final response = await _qrAttendanceService.markAttendanceByQr(qrCode);

      if (response.isSuccess) {
        hasScannedInSession.value = true;
        _showSuccessModal(response);
      } else {
        _showErrorModal(response.message);
      }
    } catch (e) {
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      _showErrorModal(errorMessage);
      LoggerUtils.error('Error submitting attendance', e);
    } finally {
      isSubmittingAttendance.value = false;
      isScanning.value = false;
      _startScanCooldown();
    }
  }

  void _showSuccessModal(QrAttendanceResponse response) {
    HapticFeedback.lightImpact();

    AttendanceResultModal.showSuccess(
      title: 'Attendance Recorded',
      message: response.message,
      attendanceData: response.data,
      onDone: () {
        Get.back();
      },
    );
  }

  void _showErrorModal(String errorMessage) {
    HapticFeedback.vibrate();

    AttendanceResultModal.showError(
      title: 'Scan Failed',
      message: errorMessage,
      onRetry: () {
        Get.back();
        _startScanCooldown(duration: 1);
      },
    );
  }

  void _startScanCooldown({int duration = scanCooldownDuration}) {
    scanCooldownSeconds.value = duration;

    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (scanCooldownSeconds.value <= 1) {
        scanCooldownSeconds.value = 0;
        canScan.value = true;
        timer.cancel();
      } else {
        scanCooldownSeconds.value--;
      }
    });
  }

  void cancelCurrentDetection() {
    if (isDetecting.value) {
      _cancelDetection();
      HapticFeedback.selectionClick();
    }
  }

  Future<void> toggleFlash() async {
    try {
      await scannerController.toggleTorch();
      isFlashOn.value = !isFlashOn.value;
      HapticFeedback.selectionClick();
    } catch (e) {
      LoggerUtils.error('Failed to toggle flash', e);
    }
  }

  void resetSession() {
    _cooldownTimer?.cancel();
    _detectionTimer?.cancel();
    _detectionCountdownTimer?.cancel();

    isDetecting.value = false;
    isScanning.value = false;
    isSubmittingAttendance.value = false;
    canScan.value = true;
    scanCooldownSeconds.value = 0;
    detectionCountdown.value = 0;
    hasScannedInSession.value = false;
    scannedQrCode.value = '';
    currentZoom.value = 1.0;
    _pendingQrCode = null;
    _qrDetectionCount = 0;

    LoggerUtils.info('Scan session reset');
  }

  bool get canStartNewScan =>
      canScan.value &&
      !isScanning.value &&
      !isDetecting.value &&
      scanCooldownSeconds.value == 0;

  String get scanStatus {
    if (isSubmittingAttendance.value) return 'Processing...';
    if (isScanning.value) return 'Scanning...';
    if (isDetecting.value)
      return 'Detected! Scanning in ${detectionCountdown.value}s';
    if (scanCooldownSeconds.value > 0)
      return 'Wait ${scanCooldownSeconds.value}s';
    if (!canScan.value) return 'Ready';
    return 'Position QR Code';
  }
}
