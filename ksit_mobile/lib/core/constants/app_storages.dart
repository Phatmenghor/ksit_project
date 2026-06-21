class AppStorages {
  // Auth (cleared on logout)
  static const String tokenKey = 'auth_token';
  static const String userIdKey = 'user_id';
  static const String rolesKey = 'roles';
  static const String userKey = 'user_data';

  // Device-level (NOT cleared on logout)
  static const String fcmTokenKey = 'fcm_token';
  static const String isFirstTimeKey = 'is_first_time';

  // User preferences (cleared on logout)
  static const String locationEnabledKey = 'pref_location_enabled';
  static const String notificationEnabledKey = 'pref_notification_enabled';

  /// All keys that must be wiped when a user logs out.
  static const List<String> userScopedKeys = [
    tokenKey,
    userIdKey,
    rolesKey,
    userKey,
    locationEnabledKey,
    notificationEnabledKey,
  ];
}
