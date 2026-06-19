class LoginResponseModel {
  final String accessToken;
  final String tokenType;
  final int userId;
  final String username;
  final String? email; // Made nullable
  final List<String>? roles; // Made nullable
  final String fullToken;

  const LoginResponseModel({
    required this.accessToken,
    required this.tokenType,
    required this.userId,
    required this.username,
    this.email, // Optional parameter
    this.roles, // Optional parameter
    required this.fullToken,
  });

  Map<String, dynamic> toJson() {
    return {
      'accessToken': accessToken,
      'tokenType': tokenType,
      'userId': userId,
      'username': username,
      'email': email,
      'roles': roles,
      'fullToken': fullToken,
    };
  }

  factory LoginResponseModel.fromJson(Map<String, dynamic> json) {
    return LoginResponseModel(
      accessToken: json['accessToken']?.toString() ?? '',
      tokenType: json['tokenType']?.toString() ?? '',
      userId: json['userId'] != null ? (json['userId'] as num).toInt() : 0,
      username: json['username']?.toString() ?? '',
      email: json['email']?.toString(), // Can be null
      roles: json['roles'] != null
          ? (json['roles'] as List<dynamic>?)
              ?.map((e) => e?.toString() ?? '')
              .where((role) => role.isNotEmpty)
              .toList()
          : null, // Can be null
      fullToken: json['fullToken']?.toString() ?? '',
    );
  }

  LoginResponseModel copyWith({
    String? accessToken,
    String? tokenType,
    int? userId,
    String? username,
    String? email,
    List<String>? roles,
    String? fullToken,
  }) {
    return LoginResponseModel(
      accessToken: accessToken ?? this.accessToken,
      tokenType: tokenType ?? this.tokenType,
      userId: userId ?? this.userId,
      username: username ?? this.username,
      email: email ?? this.email,
      roles: roles ?? this.roles,
      fullToken: fullToken ?? this.fullToken,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LoginResponseModel &&
        other.accessToken == accessToken &&
        other.tokenType == tokenType &&
        other.userId == userId &&
        other.username == username &&
        other.email == email &&
        _listEquals(other.roles, roles) &&
        other.fullToken == fullToken;
  }

  @override
  int get hashCode {
    return accessToken.hashCode ^
        tokenType.hashCode ^
        userId.hashCode ^
        username.hashCode ^
        (email?.hashCode ?? 0) ^
        (roles?.hashCode ?? 0) ^
        fullToken.hashCode;
  }

  @override
  String toString() {
    return 'LoginResponseModel(accessToken: $accessToken, tokenType: $tokenType, userId: $userId, username: $username, email: $email, roles: $roles, fullToken: $fullToken)';
  }

  bool _listEquals<T>(List<T>? a, List<T>? b) {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }

  // Helper methods for convenience
  bool get hasEmail => email != null && email!.isNotEmpty;
  bool get hasRoles => roles != null && roles!.isNotEmpty;

  /// Returns email or empty string if null
  String get safeEmail => email ?? '';

  /// Returns roles or empty list if null
  List<String> get safeRoles => roles ?? [];
}
