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

class _ScanScreenState extends State<ScanScreen> with TickerProviderStateMixin {
  final scanController = Get.put(ScanController());
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _animationController.repeat();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
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
    return Container(
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.4),
      ),
      child: Center(
        child: Container(
          width: 280,
          height: 280,
          decoration: BoxDecoration(
            border: Border.all(
              color: AppColors.primary,
              width: 2.5,
            ),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Stack(
            children: [
              // Scanning line animation
              AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  return Positioned(
                    top: _animationController.value * 260,
                    left: 8,
                    right: 8,
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
                            color: AppColors.primary.withOpacity(0.8),
                            blurRadius: 8,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),

              // Corner indicators (subtle)
              ..._buildCornerIndicators(),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _buildCornerIndicators() {
    return [
      // Top-left
      Positioned(
        top: 0,
        left: 0,
        child: Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(color: AppColors.primary, width: 2.5),
              left: BorderSide(color: AppColors.primary, width: 2.5),
            ),
            borderRadius: const BorderRadius.only(topLeft: Radius.circular(8)),
          ),
        ),
      ),
      // Top-right
      Positioned(
        top: 0,
        right: 0,
        child: Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(color: AppColors.primary, width: 2.5),
              right: BorderSide(color: AppColors.primary, width: 2.5),
            ),
            borderRadius: const BorderRadius.only(topRight: Radius.circular(8)),
          ),
        ),
      ),
      // Bottom-left
      Positioned(
        bottom: 0,
        left: 0,
        child: Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(color: AppColors.primary, width: 2.5),
              left: BorderSide(color: AppColors.primary, width: 2.5),
            ),
            borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(8),
            ),
          ),
        ),
      ),
      // Bottom-right
      Positioned(
        bottom: 0,
        right: 0,
        child: Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(color: AppColors.primary, width: 2.5),
              right: BorderSide(color: AppColors.primary, width: 2.5),
            ),
            borderRadius: const BorderRadius.only(
              bottomRight: Radius.circular(8),
            ),
          ),
        ),
      ),
    ];
  }

  Widget _buildDetectionCountdown() {
    return Container(
      color: Colors.black.withOpacity(0.8),
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
      color: Colors.black.withOpacity(0.8),
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
      color: Colors.black.withOpacity(0.8),
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
              Colors.black.withOpacity(0.3),
              Colors.black.withOpacity(0.7),
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
