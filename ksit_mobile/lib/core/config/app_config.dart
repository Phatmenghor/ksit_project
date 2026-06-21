import 'dart:io';

enum Environment {
  local,
  dev,
  prod,
}

class AppConfig {
  static Environment _environment = Environment.prod;

  static Environment get environment => _environment;

  static void setEnvironment(Environment env) {
    _environment = env;
  }

  // API Base URLs
  // local : physical device → machine LAN IP (192.168.18.32:8080)
  // dev   : remote dev server
  // prod  : production server
  // Local: Android emulator → 10.0.2.2 (maps to host localhost)
  //        iOS simulator    → localhost
  //        Physical device  → update to your machine LAN IP (e.g. 192.168.x.x)
  static String get _localHost =>
      Platform.isAndroid ? '10.0.2.2' : 'localhost';

  static String get baseUrl {
    switch (_environment) {
      case Environment.local:
        return 'http://$_localHost:8080/api';
      case Environment.dev:
        return 'http://165.22.247.142:7000/api';
      case Environment.prod:
        return 'http://165.22.247.142:7000/api';
    }
  }

  static String get baseImageUrl {
    switch (_environment) {
      case Environment.local:
        return 'http://$_localHost:8080';
      case Environment.dev:
        return 'http://165.22.247.142:7000';
      case Environment.prod:
        return 'http://165.22.247.142:7000';
    }
  }

  // App display name shown in OS (helps identify which build is running)
  static String get appName {
    switch (_environment) {
      case Environment.local:
        return 'ims ksit[local]';
      case Environment.dev:
        return 'ims ksit[dev]';
      case Environment.prod:
        return 'ims ksit';
    }
  }

  // Feature Flags
  static bool get enableLogging {
    switch (_environment) {
      case Environment.local:
      case Environment.dev:
        return true;
      case Environment.prod:
        return false;
    }
  }

  static bool get enableCrashReporting {
    switch (_environment) {
      case Environment.local:
        return false;
      case Environment.dev:
      case Environment.prod:
        return true;
    }
  }

  static bool get enableAnalytics {
    switch (_environment) {
      case Environment.local:
        return false;
      case Environment.dev:
      case Environment.prod:
        return true;
    }
  }

  // Timeouts
  static int get connectTimeout => 30000;
  static int get receiveTimeout => 30000;

  // Cache
  static Duration get cacheExpiration => const Duration(hours: 1);

  // Pagination
  static int get defaultPageSize => 10;
  static int get maxPageSize => 50;

  static String get appVersion => '1.0.0';

  // Firebase FCM Topic
  static String get fcmTopic => 'all_users';

  // Storage Keys
  static String get tokenKey => 'auth_token';
  static String get userKey => 'user_data';
  static String get fcmTokenKey => 'fcm_token';
  static String get isFirstTimeKey => 'is_first_time';

  // Validation
  static int get minPasswordLength => 6;
  static int get maxPasswordLength => 20;

  // UI
  static double get defaultPadding => 16.0;
  static double get smallPadding => 8.0;
  static double get largePadding => 24.0;
  static double get borderRadius => 8.0;

  // Animation
  static Duration get defaultAnimationDuration =>
      const Duration(milliseconds: 300);
  static Duration get splashDuration => const Duration(seconds: 3);

  // Convenience checks
  static bool get isLocal => _environment == Environment.local;
  static bool get isDev => _environment == Environment.dev;
  static bool get isProd => _environment == Environment.prod;

  static String getEndpointUrl(String endpoint) => baseUrl + endpoint;

  static Map<String, String> get defaultHeaders => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-App-Version': appVersion,
        'X-Environment': _environment.name,
      };

  static Map<String, dynamic> get debugInfo => {
        'environment': _environment.name,
        'baseUrl': baseUrl,
        'baseImageUrl': baseImageUrl,
        'appName': appName,
        'appVersion': appVersion,
        'enableLogging': enableLogging,
      };
}
