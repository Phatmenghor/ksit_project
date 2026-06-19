class ChangePasswordResponse {
  final String status;
  final String message;

  const ChangePasswordResponse({
    required this.status,
    required this.message,
  });

  factory ChangePasswordResponse.fromJson(Map<String, dynamic> json) {
    return ChangePasswordResponse(
      status: json['status'] as String,
      message: json['message'] as String,
    );
  }
}
