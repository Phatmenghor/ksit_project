import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:get/get.dart';
import 'package:ksit_mobile/core/constants/app_routes.dart';

import '../config/app_config.dart';
import '../utils/logger_utils.dart';
import 'storage_service.dart';

class FirebaseService extends GetxService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final StorageService _storageService = Get.find<StorageService>();

  String? _fcmToken;
  String? get fcmToken => _fcmToken;

  @override
  void onInit() {
    super.onInit();
    _initializeMessaging();
  }

  Future<void> _initializeMessaging() async {
    await initializeMessaging();
  }

  Future<void> initializeMessaging() async {
    try {
      // Request permission for iOS
      NotificationSettings settings =
          await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      LoggerUtils.info(
          'User granted permission: ${settings.authorizationStatus}');

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        // Get FCM token
        await _getFCMToken();

        // Setup message handlers
        _setupMessageHandlers();

        // Subscribe to topic
        await _subscribeToTopic();

        LoggerUtils.info('Firebase messaging initialized successfully');
      } else {
        LoggerUtils.warning('User denied notification permission');
      }
    } catch (e) {
      LoggerUtils.error('Error initializing Firebase messaging', e);
    }
  }

  Future<void> _getFCMToken() async {
    try {
      _fcmToken = await _firebaseMessaging.getToken();
      if (_fcmToken != null) {
        await _storageService.setString(AppConfig.fcmTokenKey, _fcmToken!);
        LoggerUtils.info('FCM Token: $_fcmToken');
      }

      // Listen for token refresh
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        _fcmToken = newToken;
        _storageService.setString(AppConfig.fcmTokenKey, newToken);
        LoggerUtils.info('FCM Token refreshed: $newToken');
        // TODO: Send new token to backend
      });
    } catch (e) {
      LoggerUtils.error('Error getting FCM token', e);
    }
  }

  void _setupMessageHandlers() {
    // Handle messages when app is in foreground
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle messages when app is in background and user taps notification
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);

    // Handle messages when app is terminated and user taps notification
    _handleTerminatedMessage();
  }

  void _handleForegroundMessage(RemoteMessage message) {
    LoggerUtils.info('Received foreground message: ${message.messageId}');

    // Show custom notification dialog or toast
    _showNotificationDialog(message);
  }

  void _handleBackgroundMessage(RemoteMessage message) {
    LoggerUtils.info('Received background message: ${message.messageId}');

    // Handle navigation or data processing
    _processNotificationData(message);
  }

  Future<void> _handleTerminatedMessage() async {
    RemoteMessage? initialMessage =
        await _firebaseMessaging.getInitialMessage();

    if (initialMessage != null) {
      LoggerUtils.info(
          'Received terminated message: ${initialMessage.messageId}');
      _processNotificationData(initialMessage);
    }
  }

  void _showNotificationDialog(RemoteMessage message) {
    if (Get.context != null) {
      // Show custom alert dialog
      showDialog(
        context: Get.context!,
        builder: (context) => AlertDialog(
          title: Text(message.notification?.title ?? 'Notification'),
          content:
              Text(message.notification?.body ?? 'You have a new notification'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Close'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _processNotificationData(message);
              },
              child: const Text('View'),
            ),
          ],
        ),
      );
    } else {
      // Fallback to toast
      Fluttertoast.showToast(
        msg: message.notification?.body ?? 'New notification',
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.TOP,
      );
    }
  }

  void _processNotificationData(RemoteMessage message) {
    final data = message.data;
    LoggerUtils.info('Processing notification data: $data');

    // Handle different notification types
    final type = data['type'];
    switch (type) {
      case 'home_update':
        // Navigate to home and refresh data
        Get.toNamed(AppRoutes.homeRoute);
        break;
      case 'request_update':
        // Navigate to requests
        Get.toNamed(AppRoutes.requestRoute);
        break;
      case 'profile_update':
        // Navigate to profile
        Get.toNamed(AppRoutes.profileRoute);
        break;
      default:
        // Default behavior
        break;
    }
  }

  Future<void> _subscribeToTopic() async {
    try {
      await _firebaseMessaging.subscribeToTopic(AppConfig.fcmTopic);
      LoggerUtils.info('Subscribed to topic: ${AppConfig.fcmTopic}');
    } catch (e) {
      LoggerUtils.error('Error subscribing to topic', e);
    }
  }

  Future<void> unsubscribeFromTopic() async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(AppConfig.fcmTopic);
      LoggerUtils.info('Unsubscribed from topic: ${AppConfig.fcmTopic}');
    } catch (e) {
      LoggerUtils.error('Error unsubscribing from topic', e);
    }
  }

  // Background message handler (top-level function)
  static Future<void> firebaseMessagingBackgroundHandler(
      RemoteMessage message) async {
    LoggerUtils.info('Handling background message: ${message.messageId}');
    // Handle background message processing here
  }
}
