// lib/routes/app_router.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:get/get.dart';
import 'package:ksit_mobile/core/constants/app_routes.dart';
import 'package:ksit_mobile/features/attandance/screens/attendance_history_screen.dart';
import 'package:ksit_mobile/features/home/screens/schedule_detail_screen.dart';
import 'package:ksit_mobile/features/profile/screens/change_password_screen.dart';
import 'package:ksit_mobile/features/profile/screens/configuration_screen.dart';
import 'package:ksit_mobile/features/profile/screens/edit_profile_screen.dart';
import 'package:ksit_mobile/features/profile/screens/profile_view_screen.dart';
import 'package:ksit_mobile/features/requet/screens/request_screen.dart';
import 'package:ksit_mobile/features/requet/screens/request_detail_screen.dart';
import 'package:ksit_mobile/features/survey/screens/survey_screen.dart';
import 'package:ksit_mobile/features/transcript/screens/student_transcript_screen.dart';
import '../core/config/app_config.dart';
import '../core/services/storage_service.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/scan/screens/scan_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../shared/screens/main_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    navigatorKey: Get.key, // Use GetX navigator key
    initialLocation:
        AppRoutes.loginRoute, // Default to login, redirect will handle auth
    redirect: _redirect,
    routes: [
      // Login Screen
      GoRoute(
        path: AppRoutes.loginRoute,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),

      // Profile View Screen
      GoRoute(
        path: AppRoutes.profileViewRoute,
        name: 'profile-view',
        builder: (context, state) => const StduentViewScreen(),
      ),

      // Profile Edit Screen
      GoRoute(
        path: AppRoutes.editProfileRoute,
        name: 'edit-profile',
        builder: (context, state) => const EditProfileScreen(),
      ),

      // Configuration Screen
      GoRoute(
        path: AppRoutes.configurationRoute,
        name: 'configuration',
        builder: (context, state) => const ConfigurationScreen(),
      ),

      // Change Password Screen
      GoRoute(
        path: AppRoutes.changePasswordRoute,
        name: 'change-password',
        builder: (context, state) => const ChangePasswordScreen(),
      ),

      // Attendance History Screen
      GoRoute(
        path: AppRoutes.attendanceHistoryRoute,
        name: 'attendance-history',
        builder: (context, state) => const AttendanceHistoryScreen(),
      ),

      // Transcript Screen
      GoRoute(
        path: AppRoutes.transcriptRoute,
        name: 'transcript',
        builder: (context, state) => const StudentTranscriptScreen(),
      ),

      // Survey Screen
      GoRoute(
        path: AppRoutes.surveyRoute,
        name: 'survey',
        builder: (context, state) {
          final scheduleIdString = state.uri.queryParameters['scheduleId'];
          if (scheduleIdString == null) {
            return const Scaffold(
              body: Center(
                child: Text('Invalid schedule ID'),
              ),
            );
          }

          final scheduleId = int.tryParse(scheduleIdString);
          if (scheduleId == null) {
            return const Scaffold(
              body: Center(
                child: Text('Invalid schedule ID format'),
              ),
            );
          }

          return SurveyScreen(scheduleId: scheduleId);
        },
      ),

      // Main App Routes with Bottom Navigation
      ShellRoute(
        navigatorKey: GlobalKey<NavigatorState>(),
        builder: (context, state, child) => MainScreen(child: child),
        routes: [
          // Bottom Navigation Routes with Pop Animation
          GoRoute(
            path: AppRoutes.homeRoute,
            name: 'home',
            pageBuilder: (context, state) => _buildBottomNavPage(
              state: state,
              child: const HomeScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.scanRoute,
            name: 'scan',
            pageBuilder: (context, state) => _buildBottomNavPage(
              state: state,
              child: const ScanScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.requestRoute,
            name: 'request',
            pageBuilder: (context, state) => _buildBottomNavPage(
              state: state,
              child: const RequestScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.profileRoute,
            name: 'profile',
            pageBuilder: (context, state) => _buildBottomNavPage(
              state: state,
              child: const ProfileScreen(),
            ),
          ),

          // Other routes with default push animation
          GoRoute(
            path: AppRoutes.scheduleDetailRoute,
            name: 'schedule-detail',
            builder: (context, state) {
              final scheduleId = state.uri.queryParameters['id'];
              if (scheduleId == null) {
                return const Scaffold(
                  body: Center(
                    child: Text('Schedule not found'),
                  ),
                );
              }

              return ScheduleDetailScreen(scheduleId: int.parse(scheduleId));
            },
          ),
          GoRoute(
            path: '${AppRoutes.requestDetailRoute}/:id',
            name: 'request-detail',
            builder: (context, state) {
              final requestIdString = state.pathParameters['id'];
              if (requestIdString == null) {
                return const Scaffold(
                  body: Center(
                    child: Text('Invalid request ID'),
                  ),
                );
              }

              final requestId = int.tryParse(requestIdString);
              if (requestId == null) {
                return const Scaffold(
                  body: Center(
                    child: Text('Invalid request ID format'),
                  ),
                );
              }

              return RequestDetailScreen(requestId: requestId);
            },
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              state.error.toString(),
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go(AppRoutes.homeRoute),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );

  /// Build custom page with pop-style animation for bottom navigation
  static CustomTransitionPage<void> _buildBottomNavPage({
    required GoRouterState state,
    required Widget child,
  }) {
    return CustomTransitionPage<void>(
      key: state.pageKey,
      child: child,
      transitionDuration: const Duration(milliseconds: 200),
      reverseTransitionDuration: const Duration(milliseconds: 200),
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return _buildPopTransition(
          animation: animation,
          secondaryAnimation: secondaryAnimation,
          child: child,
        );
      },
    );
  }

  /// Build pop-style transition animation
  static Widget _buildPopTransition({
    required Animation<double> animation,
    required Animation<double> secondaryAnimation,
    required Widget child,
  }) {
    // Combine scale and fade animations for a "pop" effect
    return AnimatedBuilder(
      animation: animation,
      builder: (context, child) {
        // Scale animation (starts small and grows to normal size)
        final scaleAnimation = Tween<double>(
          begin: 0.85,
          end: 1.0,
        ).animate(
          CurvedAnimation(
            parent: animation,
            curve: Curves.easeOutBack, // This gives the "pop" effect
          ),
        );

        // Fade animation
        final fadeAnimation = Tween<double>(
          begin: 0.0,
          end: 1.0,
        ).animate(
          CurvedAnimation(
            parent: animation,
            curve: const Interval(0.0, 0.8, curve: Curves.easeOut),
          ),
        );

        return Transform.scale(
          scale: scaleAnimation.value,
          child: FadeTransition(
            opacity: fadeAnimation,
            child: child,
          ),
        );
      },
      child: child,
    );
  }

  static String? _redirect(BuildContext context, GoRouterState state) {
    final storageService = Get.find<StorageService>();
    final token = storageService.getString(AppConfig.tokenKey);
    final isLoggedIn = token != null && token.isNotEmpty;
    final currentLocation = state.fullPath;

    // If not logged in and trying to access protected routes
    if (!isLoggedIn && _isProtectedRoute(currentLocation)) {
      return AppRoutes.loginRoute;
    }

    // If logged in and trying to access auth routes
    if (isLoggedIn && _isAuthRoute(currentLocation)) {
      return AppRoutes.homeRoute;
    }

    return null; // No redirect needed
  }

  static bool _isProtectedRoute(String? path) {
    if (path == null) return false;

    final protectedRoutes = [
      AppRoutes.homeRoute,
      AppRoutes.scanRoute,
      AppRoutes.requestRoute,
      AppRoutes.profileRoute,
      AppRoutes.surveyRoute,
      AppRoutes.profileViewRoute,
      AppRoutes.editProfileRoute,
      AppRoutes.configurationRoute,
      AppRoutes.changePasswordRoute,
      AppRoutes.attendanceHistoryRoute,
      AppRoutes.transcriptRoute,
      AppRoutes.scheduleDetailRoute,
    ];

    // Check exact matches and route patterns
    return protectedRoutes.any((route) =>
        path == route ||
        path.startsWith(route) ||
        (route == AppRoutes.requestDetailRoute &&
            path.contains('/request-detail/')));
  }

  static bool _isAuthRoute(String? path) {
    if (path == null) return false;

    final authRoutes = [
      AppRoutes.loginRoute,
    ];

    return authRoutes.contains(path);
  }
}

// Additional custom transition options you can use:

/// Alternative slide from bottom transition (like iOS modal)
class SlideFromBottomTransition {
  static Widget build({
    required Animation<double> animation,
    required Animation<double> secondaryAnimation,
    required Widget child,
  }) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0.0, 1.0),
        end: Offset.zero,
      ).animate(
        CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutCubic,
        ),
      ),
      child: child,
    );
  }
}

/// Alternative fade transition
class FadeTransitionCustom {
  static Widget build({
    required Animation<double> animation,
    required Animation<double> secondaryAnimation,
    required Widget child,
  }) {
    return FadeTransition(
      opacity: CurvedAnimation(
        parent: animation,
        curve: Curves.easeInOut,
      ),
      child: child,
    );
  }
}

/// Alternative zoom transition (like Instagram navigation)
class ZoomTransition {
  static Widget build({
    required Animation<double> animation,
    required Animation<double> secondaryAnimation,
    required Widget child,
  }) {
    return ScaleTransition(
      scale: Tween<double>(
        begin: 0.8,
        end: 1.0,
      ).animate(
        CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutQuart,
        ),
      ),
      child: FadeTransition(
        opacity: animation,
        child: child,
      ),
    );
  }
}
