// lib/features/scan/screens/scan_screen.dart (Bank-Style - Minimal UI)
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../core/constants/app_colors.dart';
import '../controllers/scan_controller.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> with TickerProviderStateMixin, WidgetsBindingObserver {
  final scanController = Get.put(ScanController());
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _animationController.repeat();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _animationController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      try {
        scanController.scannerController.stop();
      } catch (e) {
        // Ignored
      }
    } else if (state == AppLifecycleState.resumed) {
      try {
        scanController.scannerController.start();
      } catch (e) {
        // Ignored
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Mobile Scanner
          MobileScanner(
            controller: scanController.scannerController,
            onDetect: scanController.onDetect,
            overlay: _buildScanOverlay(),
          ),

          // Top Header - Minimal
          _buildTopHeader(),

          // Detection Countdown - When QR detected
          Obx(() => scanController.isDetecting.value
              ? _buildDetectionCountdown()
              : const SizedBox.shrink()),

          // Processing Overlay
          Obx(() => scanController.isSubmittingAttendance.value
              ? _buildProcessingOverlay()
              : const SizedBox.shrink()),

          // Cooldown Overlay
          Obx(() => scanController.scanCooldownSeconds.value > 0
              ? _buildCooldownOverlay()
              : const SizedBox.shrink()),

          // Bottom Info
          _buildBottomInfo(),
        ],
      ),
    );
  }

  Widget _buildTopHeader() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Back Button
            GestureDetector(
              onTap: () => Get.back(),
              child: Container(
                padding: const EdgeInsets.all(8),
                child: const Icon(
                  Icons.close,
                  color: Colors.white,
                  size: 24,
                ),
              ),
            ),

            // Title
            const Text(
              'Scan QR Code',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),

            // Flash Button
            Obx(() => GestureDetector(
                  onTap: scanController.toggleFlash,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    child: Icon(
                      scanController.isFlashOn.value
                          ? Icons.flashlight_on
                          : Icons.flashlight_off,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                )),
          ],
        ),
      ),
    );
  }

  Widget _buildScanOverlay() {
    return CustomPaint(
      painter: ScannerOverlayPainter(
        scanAreaWidth: 280,
        scanAreaHeight: 280,
        borderRadius: 24,
        borderColor: AppColors.primary.withValues(alpha: 0.3),
        cornerColor: AppColors.primary,
      ),
      child: Center(
        child: SizedBox(
          width: 280,
          height: 280,
          child: Stack(
            children: [
              // Scanning line animation
              AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  return Positioned(
                    top: 10 + _animationController.value * 260,
                    left: 12,
                    right: 12,
                    child: Container(
                      height: 2.5,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [
                            Colors.transparent,
                            AppColors.primary,
                            Colors.transparent,
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.8),
                            blurRadius: 8,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetectionCountdown() {
    return Container(
      color: Colors.black.withValues(alpha: 0.8),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Countdown circle
            Obx(() => Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.warning,
                      width: 3,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      '${scanController.detectionCountdown.value}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                )),

            const SizedBox(height: 32),

            const Text(
              'QR Code Detected',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),

            const SizedBox(height: 16),

            // Cancel button
            GestureDetector(
              onTap: scanController.cancelCurrentDetection,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white, width: 1.5),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Text(
                  'Cancel',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProcessingOverlay() {
    return Container(
      color: Colors.black.withValues(alpha: 0.8),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 50,
              height: 50,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
            SizedBox(height: 24),
            Text(
              'Processing...',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCooldownOverlay() {
    return Container(
      color: Colors.black.withValues(alpha: 0.8),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Obx(() => Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.white54,
                      width: 3,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      '${scanController.scanCooldownSeconds.value}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                )),
            const SizedBox(height: 24),
            const Text(
              'Ready to scan',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomInfo() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.transparent,
              Colors.black.withValues(alpha: 0.3),
              Colors.black.withValues(alpha: 0.7),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Obx(() {
                String message;

                if (scanController.isSubmittingAttendance.value) {
                  message = 'Processing attendance...';
                } else if (scanController.isDetecting.value) {
                  message = 'Scanning...';
                } else if (scanController.scanCooldownSeconds.value > 0) {
                  message =
                      'Ready in ${scanController.scanCooldownSeconds.value}s';
                } else {
                  message = 'Hold camera steady';
                }

                return Text(
                  message,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                    letterSpacing: 0.3,
                  ),
                  textAlign: TextAlign.center,
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}

class ScannerOverlayPainter extends CustomPainter {
  final double scanAreaWidth;
  final double scanAreaHeight;
  final double borderRadius;
  final Color borderColor;
  final Color cornerColor;

  ScannerOverlayPainter({
    required this.scanAreaWidth,
    required this.scanAreaHeight,
    this.borderRadius = 24.0,
    this.borderColor = Colors.white24,
    this.cornerColor = const Color(0xFF024D3E),
  });

  @override
  void paint(Canvas canvas, Size size) {
    final double left = (size.width - scanAreaWidth) / 2;
    final double top = (size.height - scanAreaHeight) / 2;
    final rect = Rect.fromLTWH(left, top, scanAreaWidth, scanAreaHeight);
    final rrect = RRect.fromRectAndRadius(rect, Radius.circular(borderRadius));

    // 1. Draw background mask
    final backgroundPaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.65)
      ..style = PaintingStyle.fill;

    final backgroundPath = Path()
      ..fillType = PathFillType.evenOdd
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height))
      ..addRRect(rrect);

    canvas.drawPath(backgroundPath, backgroundPaint);

    // 2. Draw thin border
    final borderPaint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawRRect(rrect, borderPaint);

    // 3. Draw bold corners
    final cornerPaint = Paint()
      ..color = cornerColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0
      ..strokeCap = StrokeCap.round;

    const double cornerLength = 20.0;
    
    // Top Left Corner
    final topLeftPath = Path()
      ..moveTo(rect.left, rect.top + cornerLength)
      ..lineTo(rect.left, rect.top + borderRadius)
      ..arcToPoint(
        Offset(rect.left + borderRadius, rect.top),
        radius: Radius.circular(borderRadius),
      )
      ..lineTo(rect.left + cornerLength, rect.top);
    canvas.drawPath(topLeftPath, cornerPaint);

    // Top Right Corner
    final topRightPath = Path()
      ..moveTo(rect.right - cornerLength, rect.top)
      ..lineTo(rect.right - borderRadius, rect.top)
      ..arcToPoint(
        Offset(rect.right, rect.top + borderRadius),
        radius: Radius.circular(borderRadius),
      )
      ..lineTo(rect.right, rect.top + cornerLength);
    canvas.drawPath(topRightPath, cornerPaint);

    // Bottom Left Corner
    final bottomLeftPath = Path()
      ..moveTo(rect.left, rect.top + scanAreaHeight - cornerLength)
      ..lineTo(rect.left, rect.top + scanAreaHeight - borderRadius)
      ..arcToPoint(
        Offset(rect.left + borderRadius, rect.top + scanAreaHeight),
        radius: Radius.circular(borderRadius),
        clockwise: false,
      )
      ..lineTo(rect.left + cornerLength, rect.top + scanAreaHeight);
    canvas.drawPath(bottomLeftPath, cornerPaint);

    // Bottom Right Corner
    final bottomRightPath = Path()
      ..moveTo(rect.right - cornerLength, rect.top + scanAreaHeight)
      ..lineTo(rect.right - borderRadius, rect.top + scanAreaHeight)
      ..arcToPoint(
        Offset(rect.right, rect.top + scanAreaHeight - borderRadius),
        radius: Radius.circular(borderRadius),
        clockwise: false,
      )
      ..lineTo(rect.right, rect.top + scanAreaHeight - cornerLength);
    canvas.drawPath(bottomRightPath, cornerPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
