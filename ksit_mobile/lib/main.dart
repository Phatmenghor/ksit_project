import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:get/get.dart';
import 'package:ksit_mobile/bindings/initial_bindings.dart';
import 'package:ksit_mobile/core/constants/app_constants.dart';
import 'package:ksit_mobile/firebase_options.dart';

import 'core/constants/app_colors.dart';
import 'core/services/firebase_service.dart';
import 'core/utils/logger_utils.dart';
import 'routes/app_router.dart';

void main() async {
  // Preserve native splash screen
  final WidgetsBinding widgetsBinding =
      WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  try {
    LoggerUtils.info('Starting app initialization...');

    // // Initialize Firebase with platform-specific options
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    LoggerUtils.info('Firebase initialized successfully');

    // Initialize services
    await InitialBinding().dependencies();
    LoggerUtils.info('Initial bindings completed');

    // Initialize Firebase messaging
    await Get.find<FirebaseService>().initializeMessaging();
    LoggerUtils.info('Firebase messaging initialized');

    // Minimum splash time for better UX (optional)
    await Future.delayed(const Duration(milliseconds: 800));

    LoggerUtils.info('App initialization completed successfully');
  } catch (e) {
    LoggerUtils.error('Failed to initialize app: $e');
    // Continue anyway - router will handle authentication redirect
  } finally {
    // Remove native splash screen
    FlutterNativeSplash.remove();
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp.router(
      title: 'KSIT Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primary),
        useMaterial3: true,
        fontFamily: 'Poppins',
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: true,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppConstants.borderRadius),
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppConstants.borderRadius),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppConstants.borderRadius),
            borderSide: const BorderSide(color: AppColors.primary),
          ),
        ),
        splashColor: AppColors.primary.withOpacity(0.1),
        highlightColor: AppColors.primary.withOpacity(0.05),
      ),
      routerDelegate: AppRouter.router.routerDelegate,
      routeInformationParser: AppRouter.router.routeInformationParser,
      routeInformationProvider: AppRouter.router.routeInformationProvider,
    );
  }
}
