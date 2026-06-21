// lib/features/scan/screens/scan_screen.dart (Bank-Style - Minimal UI)
import 'dart:ui';
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

class _ScanScreenState extends State<ScanScreen> with WidgetsBindingObserver {
  late final ScanController scanController;

  @override
  void initState() {
    super.initState();
    scanController = Get.isRegistered<ScanController>()
        ? Get.find<ScanController>()
        : Get.put(ScanController());
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    // ScanController.onClose() cancels timers and disposes MobileScannerController.
    Get.delete<ScanController>(force: true);
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

          // Processing Overlay
          Obx(() => scanController.isSubmittingAttendance.value
              ? _buildProcessingOverlay()
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
            // Back & Title & Info
            Row(
              children: [
                GestureDetector(
                  onTap: () => Get.back(),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    child: const Icon(
                      Icons.arrow_back_ios_new,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Scan Attendance',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(
                  Icons.info_outline,
                  color: Colors.white70,
                  size: 18,
                ),
              ],
            ),

            // Brand logo on the right
            const Icon(
              Icons.qr_code_scanner,
              color: AppColors.primary,
              size: 24,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScanOverlay() {
    return Obx(() {
      final isLocked = scanController.isFocusLocked.value;
      return CustomPaint(
        painter: ScannerOverlayPainter(
          scanAreaWidth: 280,
          scanAreaHeight: 280,
          borderRadius: 24,
          borderColor: isLocked
              ? AppColors.success.withValues(alpha: 0.15)
              : const Color(0xFFFFB300).withValues(alpha: 0.15),
          cornerColor: const Color(0xFFFFB300),
          isFocusLocked: isLocked,
        ),
        child: Center(
          child: SizedBox(
            width: 280,
            height: 280,
            child: Stack(
              children: [
                // Focus-locked indicator line (static, only while locked)
                Obx(() {
                  final isCooldown = scanController.scanCooldownSeconds.value > 0;
                  final isLockedNow = scanController.isFocusLocked.value;
                  if (isCooldown || !isLockedNow) return const SizedBox.shrink();

                  return Positioned(
                    top: 140, // Freeze in center
                    left: 12,
                    right: 12,
                    child: Container(
                      height: 3.0,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.transparent,
                            AppColors.success,
                            Colors.transparent,
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.success,
                            blurRadius: 12,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                    ),
                  );
                }),

                // Cooldown Overlay clipped to the scanning frame
                Obx(() {
                  final cooldown = scanController.scanCooldownSeconds.value;
                  if (cooldown <= 0) return const SizedBox.shrink();
                  return ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Container(
                      color: Colors.white.withValues(alpha: 0.75),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 52,
                              height: 52,
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary.withValues(alpha: 0.2),
                                    blurRadius: 6,
                                    spreadRadius: 1,
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  '$cooldown',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Ready in...',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        ),
      );
    });
  }

  Widget _buildProcessingOverlay() {
    return Positioned.fill(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: Container(
          color: Colors.black.withValues(alpha: 0.35),
          child: Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.9),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 40,
                    height: 40,
                    child: CircularProgressIndicator(
                      strokeWidth: 3.5,
                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Recording Attendance...',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
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
        padding: const EdgeInsets.only(left: 24, right: 24, bottom: 32, top: 16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.transparent,
              Colors.black.withValues(alpha: 0.5),
              Colors.black.withValues(alpha: 0.8),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Instruction text
              const Text(
                'Scan QR to Record Attendance',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.2,
                ),
              ),
              const SizedBox(height: 40),

              // Circular Action Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  // Flashlight Action
                  Column(
                    children: [
                      GestureDetector(
                        onTap: scanController.toggleFlash,
                        child: Obx(() => Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white24, width: 1.0),
                          ),
                          child: Icon(
                            scanController.isFlashOn.value
                                ? Icons.flashlight_on
                                : Icons.flashlight_off,
                            color: Colors.white,
                            size: 24,
                          ),
                        )),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Flashlight',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),

                  // Gallery Import Action
                  Column(
                    children: [
                      GestureDetector(
                        onTap: scanController.importQrFromGallery,
                        child: Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white24, width: 1.0),
                          ),
                          child: const Icon(
                            Icons.image_outlined,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Import QR',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
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
    final bool isFocusLocked;

    ScannerOverlayPainter({
      required this.scanAreaWidth,
      required this.scanAreaHeight,
      this.borderRadius = 24.0,
      this.borderColor = Colors.white24,
      this.cornerColor = const Color(0xFF024D3E),
      required this.isFocusLocked,
    });

    @override
    void paint(Canvas canvas, Size size) {
      final double left = (size.width - scanAreaWidth) / 2;
      final double top = (size.height - scanAreaHeight) / 2;
      final rect = Rect.fromLTWH(left, top, scanAreaWidth, scanAreaHeight);
      final rrect = RRect.fromRectAndRadius(rect, Radius.circular(borderRadius));

      // 1. Draw background mask (using a clean dark translucent overlay)
      final backgroundPaint = Paint()
        ..color = Colors.black.withValues(alpha: 0.4)
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

      // 3. Draw bold corners (solid success green when locked, otherwise static gold/yellow)
      final currentThemeColor = isFocusLocked ? AppColors.success : const Color(0xFFFFB300);
      final double cornerOpacity = isFocusLocked ? 1.0 : 0.85;
      final cornerPaint = Paint()
        ..color = currentThemeColor.withValues(alpha: cornerOpacity)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 4.5
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

      // 4. Draw central camera focus target
      final center = Offset(size.width / 2, size.height / 2);
      
      if (isFocusLocked) {
        // Shrunk, thicker green circle
        final focusPaint = Paint()
          ..color = AppColors.success
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.5;
        canvas.drawCircle(center, 20.0, focusPaint);

        // Green checkmark in center
        final checkPaint = Paint()
          ..color = AppColors.success
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.5
          ..strokeCap = StrokeCap.round;
        final checkPath = Path()
          ..moveTo(center.dx - 6, center.dy)
          ..lineTo(center.dx - 2, center.dy + 4)
          ..lineTo(center.dx + 6, center.dy - 4);
        canvas.drawPath(checkPath, checkPaint);
      } else {
        // Static gold circle
        const focusRadius = 32.0;
        const focusOpacity = 0.55;
        final focusPaint = Paint()
          ..color = currentThemeColor.withValues(alpha: focusOpacity)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.5;
        canvas.drawCircle(center, focusRadius, focusPaint);

        // Central crosshair
        final crossHairPaint = Paint()
          ..color = currentThemeColor.withValues(alpha: focusOpacity * 0.5)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.2;
        
        const double crossLength = 5.0;
        canvas.drawLine(Offset(center.dx - crossLength, center.dy), Offset(center.dx + crossLength, center.dy), crossHairPaint);
        canvas.drawLine(Offset(center.dx, center.dy - crossLength), Offset(center.dx, center.dy + crossLength), crossHairPaint);
      }
    }

    @override
    bool shouldRepaint(covariant ScannerOverlayPainter oldDelegate) =>
        oldDelegate.isFocusLocked != isFocusLocked;
  }
