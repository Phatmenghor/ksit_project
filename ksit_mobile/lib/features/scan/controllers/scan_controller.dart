// lib/features/scan/controllers/scan_controller.dart (Bank-Style - Minimal)
import 'dart:async';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:image_picker/image_picker.dart';
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
  final RxBool isFocusLocked = false.obs;
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

  // Require the same QR to be read for several consecutive frames before
  // locking focus and submitting, so a brief/blurry partial read can't
  // trigger a scan before the code is fully and steadily in frame.
  String? _stableQrCode;
  int _stableDetectionFrames = 0;
  static const int stableDetectionThreshold = 5;

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
        final optimalZoom = _calculateOptimalZoom(qrSize, capture.size);

        _qrDetectionCount++;

        if (_qrDetectionCount >= qrDetectionCountThreshold) {
          if ((optimalZoom - currentZoom.value).abs() > 0.1) {
            currentZoom.value = optimalZoom;
            // Map 1.0 - 3.0 multiplier to 0.0 - 1.0 zoom scale
            final zoomScale = (optimalZoom - 1.0) / (maxZoom.value - 1.0);
            scannerController.setZoomScale(zoomScale.clamp(0.0, 1.0));
            LoggerUtils.debug('Auto-zoom: ${optimalZoom.toStringAsFixed(2)}x (scale: ${zoomScale.toStringAsFixed(2)})');
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

  /// Calculate optimal zoom level so the QR code fills a healthy portion of
  /// the frame (better focus/read reliability when the code is small/far away).
  ///
  /// [qrSize] and [frameSize] must both be in the same image-pixel space
  /// (i.e. straight from the camera frame), not screen/widget pixels —
  /// otherwise the ratio is meaningless across devices/resolutions.
  double _calculateOptimalZoom(double qrSize, Size frameSize) {
    final referenceDimension = frameSize.shortestSide;
    if (qrSize <= 0 || referenceDimension <= 0) return currentZoom.value;

    // Aim for the QR to occupy ~38% of the frame's shorter side.
    const double targetFraction = 0.38;
    final targetSize = referenceDimension * targetFraction;

    // qrSize already reflects whatever zoom is currently applied, so scale
    // relative to the current zoom to get the new absolute zoom needed.
    final zoom = currentZoom.value * (targetSize / qrSize);
    return zoom.clamp(minZoom.value, maxZoom.value);
  }

  /// Reset zoom to default
  void _resetAutoZoom() {
    if (currentZoom.value != 1.0) {
      currentZoom.value = 1.0;
      try {
        scannerController.setZoomScale(0.0);
      } catch (e) {
        LoggerUtils.debug('Failed to reset zoom: $e');
      }
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
    String? code;
    for (final barcode in barcodes) {
      final String? value = barcode.rawValue;
      if (value != null && value.isNotEmpty) {
        code = value;
        break;
      }
    }

    if (code == null) {
      _stableQrCode = null;
      _stableDetectionFrames = 0;
      return;
    }

    if (_stableQrCode != code) {
      // New or different code in frame: restart the stability count so a
      // changing/blurry read doesn't carry over a stale streak.
      _stableQrCode = code;
      _stableDetectionFrames = 1;
      return;
    }

    _stableDetectionFrames++;
    if (_stableDetectionFrames >= stableDetectionThreshold) {
      _startDetectionDelay(code);
    }
  }

  void _startDetectionDelay(String qrCode) {
    if (isDetecting.value || isFocusLocked.value) return;

    isDetecting.value = true;
    isFocusLocked.value = true;
    _pendingQrCode = qrCode;

    LoggerUtils.info('QR Code detected: $qrCode');
    
    HapticFeedback.mediumImpact();

    _detectionTimer?.cancel();
    _detectionTimer = Timer(const Duration(milliseconds: 800), () {
      if (isFocusLocked.value) {
        _processScanResult();
      }
    });
  }

  void _cancelDetection() {
    _detectionTimer?.cancel();
    _detectionCountdownTimer?.cancel();
    isDetecting.value = false;
    isFocusLocked.value = false;
    detectionCountdown.value = 0;
    _pendingQrCode = null;
    _stableQrCode = null;
    _stableDetectionFrames = 0;
  }

  void _processScanResult() {
    if (_pendingQrCode == null ||
        isScanning.value ||
        isSubmittingAttendance.value) {
      return;
    }

    _detectionTimer?.cancel();
    _detectionCountdownTimer?.cancel();
    isDetecting.value = false;
    isFocusLocked.value = false;
    detectionCountdown.value = 0;

    isScanning.value = true;
    canScan.value = false;
    scannedQrCode.value = _pendingQrCode!;

    HapticFeedback.lightImpact();

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
        _handleAttendanceFailure(response.message);
      }
    } catch (e) {
      final errorMessage = ApiErrorUtils.extractApiErrorMessage(e);
      _handleAttendanceFailure(errorMessage);
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

  /// Route a failed scan to the right modal: a friendly warning when
  /// attendance was already recorded, an error for everything else.
  void _handleAttendanceFailure(String message) {
    if (_isAlreadyMarkedMessage(message)) {
      _showWarningModal(message);
    } else {
      _showErrorModal(message);
    }
  }

  bool _isAlreadyMarkedMessage(String message) {
    final lower = message.toLowerCase();
    return lower.contains('already been marked') ||
        lower.contains('already marked') ||
        lower.contains('already present') ||
        lower.contains('already scanned');
  }

  void _showWarningModal(String message) {
    HapticFeedback.lightImpact();

    AttendanceResultModal.showWarning(
      title: 'Already Scanned',
      message: message,
      onDone: () {
        Get.back();
        _startScanCooldown(duration: 1);
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

  Future<void> importQrFromGallery() async {
    try {
      final picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);
      if (image == null) return;

      final bool success = await scannerController.analyzeImage(image.path);

      if (!success) {
        _showErrorModal('No valid QR code found in selected image.');
      }
    } catch (e) {
      LoggerUtils.error('Failed to import QR from gallery', e);
      _showErrorModal('Failed to read image.');
    }
  }

  void resetSession() {
    _cooldownTimer?.cancel();
    _detectionTimer?.cancel();
    _detectionCountdownTimer?.cancel();

    isDetecting.value = false;
    isFocusLocked.value = false;
    isScanning.value = false;
    isSubmittingAttendance.value = false;
    canScan.value = true;
    scanCooldownSeconds.value = 0;
    detectionCountdown.value = 0;
    hasScannedInSession.value = false;
    scannedQrCode.value = '';
    currentZoom.value = 1.0;
    try {
      scannerController.setZoomScale(0.0);
    } catch (e) {
      LoggerUtils.debug('Failed to reset zoom in resetSession: $e');
    }
    _pendingQrCode = null;
    _qrDetectionCount = 0;
    _stableQrCode = null;
    _stableDetectionFrames = 0;

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
    if (isFocusLocked.value) return 'Focus locked! Processing...';
    if (isDetecting.value) {
      return 'Detected! Scanning in ${detectionCountdown.value}s';
    }
    if (scanCooldownSeconds.value > 0) {
      return 'Wait ${scanCooldownSeconds.value}s';
    }
    if (!canScan.value) return 'Ready';
    return 'Position QR Code';
  }
}
