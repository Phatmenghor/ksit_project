enum Environment {
  development,
  staging,
  production,
}

class AppConfig {
  static Environment _environment = Environment.development;

  static Environment get environment => _environment;

  static void setEnvironment(Environment env) {
    _environment = env;
  }

  // API Configuration
  static String get baseUrl {
    switch (_environment) {
      case Environment.development:
        return 'http://165.22.247.142:7000/api';
      case Environment.staging:
        return 'http://165.22.247.142:7000/api';
      case Environment.production:
        return 'http://165.22.247.142:7000/api';
    }
  }

  static String get baseImageUrl {
    switch (_environment) {
      case Environment.development:
        return 'http://165.22.247.142:7000';
      case Environment.staging:
        return 'http://165.22.247.142:7000';
      case Environment.production:
        return 'http://165.22.247.142:7000';
    }
  }

  // Firebase Configuration
  static String get firebaseProjectId {
    switch (_environment) {
      case Environment.development:
        return 'your-project-dev';
      case Environment.staging:
        return 'your-project-staging';
      case Environment.production:
        return 'your-project-prod';
    }
  }

  // Feature Flags
  static bool get enableLogging {
    switch (_environment) {
      case Environment.development:
      case Environment.staging:
        return true;
      case Environment.production:
        return false;
    }
  }

  static bool get enableCrashReporting {
    switch (_environment) {
      case Environment.development:
        return false;
      case Environment.staging:
      case Environment.production:
        return true;
    }
  }

  static bool get enableAnalytics {
    switch (_environment) {
      case Environment.development:
        return false;
      case Environment.staging:
      case Environment.production:
        return true;
    }
  }

  // Timeouts
  static int get connectTimeout => 30000; // 30 seconds
  static int get receiveTimeout => 30000; // 30 seconds

  // Cache Configuration
  static Duration get cacheExpiration => const Duration(hours: 1);

  // Pagination
  static int get defaultPageSize => 10;
  static int get maxPageSize => 50;

  // App Configuration
  static String get appName => 'Flutter App';
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

  // UI Configuration
  static double get defaultPadding => 16.0;
  static double get smallPadding => 8.0;
  static double get largePadding => 24.0;
  static double get borderRadius => 8.0;

  // Animation Duration
  static Duration get defaultAnimationDuration =>
      const Duration(milliseconds: 300);
  static Duration get splashDuration => const Duration(seconds: 3);

  // Debug Information
  static Map<String, dynamic> get debugInfo {
    return {
      'environment': _environment.name,
      'baseUrl': baseUrl,
      'appName': appName,
      'appVersion': appVersion,
      'enableLogging': enableLogging,
      'enableCrashReporting': enableCrashReporting,
      'enableAnalytics': enableAnalytics,
      'connectTimeout': connectTimeout,
      'receiveTimeout': receiveTimeout,
      'cacheExpiration': cacheExpiration.inMinutes,
      'fcmTopic': fcmTopic,
    };
  }

  // Initialize configuration
  static void initialize({Environment? environment}) {
    if (environment != null) {
      setEnvironment(environment);
    }
  }

  // Check if current environment is development
  static bool get isDevelopment => _environment == Environment.development;

  // Check if current environment is staging
  static bool get isStaging => _environment == Environment.staging;

  // Check if current environment is production
  static bool get isProduction => _environment == Environment.production;

  // Get environment-specific endpoint URL
  static String getEndpointUrl(String endpoint) {
    return baseUrl + endpoint;
  }

  // Get API headers
  static Map<String, String> get defaultHeaders => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-App-Version': appVersion,
        'X-Environment': _environment.name,
      };
}
