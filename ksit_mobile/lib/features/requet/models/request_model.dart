import 'package:ksit_mobile/core/utils/enums_utils.dart';

extension RequestStatusExtension on RequestStatus {
  String get name {
    switch (this) {
      case RequestStatus.pending:
        return 'PENDING';
      case RequestStatus.accepted:
        return 'ACCEPTED';
      case RequestStatus.done:
        return 'DONE';
      case RequestStatus.rejected:
        return 'REJECTED';
      case RequestStatus.return_:
        return 'RETURN';
    }
  }

  String get displayName {
    switch (this) {
      case RequestStatus.pending:
        return 'Pending';
      case RequestStatus.accepted:
        return 'Accepted';
      case RequestStatus.done:
        return 'Done';
      case RequestStatus.rejected:
        return 'Rejected';
      case RequestStatus.return_:
        return 'Return';
    }
  }

  static RequestStatus fromString(String value) {
    switch (value.toUpperCase()) {
      case 'PENDING':
        return RequestStatus.pending;
      case 'ACCEPTED':
        return RequestStatus.accepted;
      case 'DONE':
        return RequestStatus.done;
      case 'REJECTED':
        return RequestStatus.rejected;
      case 'RETURN':
        return RequestStatus.return_;
      default:
        throw ArgumentError('Invalid RequestStatus: $value');
    }
  }
}

class UserClass {
  final int id;
  final String code;
  final String createdAt;

  const UserClass({
    required this.id,
    required this.code,
    required this.createdAt,
  });

  factory UserClass.fromJson(Map<String, dynamic> json) {
    return UserClass(
      id: (json['id'] as num).toInt(),
      code: json['code'] as String,
      createdAt: json['createdAt'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'createdAt': createdAt,
    };
  }
}

class User {
  final int id;
  final String username;
  final String? khmerFirstName;
  final String? khmerLastName;
  final String? englishFirstName;
  final String? englishLastName;
  final String? email;
  final String? phoneNumber;
  final String identifyNumber;
  final String degree;
  final String? dateOfBirth;
  final String? gender;
  final String? currentAddress;
  final String? profileUrl;
  final String majorName;
  final String departmentName;
  final UserClass userClass;
  final List<String> roles;
  final bool isStudent;
  final String createdAt;

  const User({
    required this.id,
    required this.username,
    this.khmerFirstName,
    this.khmerLastName,
    this.englishFirstName,
    this.englishLastName,
    this.email,
    this.phoneNumber,
    required this.identifyNumber,
    required this.degree,
    this.dateOfBirth,
    this.gender,
    this.currentAddress,
    this.profileUrl,
    required this.majorName,
    required this.departmentName,
    required this.userClass,
    required this.roles,
    required this.isStudent,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: (json['id'] as num).toInt(),
      username: json['username'] as String,
      khmerFirstName: json['khmerFirstName'] as String?,
      khmerLastName: json['khmerLastName'] as String?,
      englishFirstName: json['englishFirstName'] as String?,
      englishLastName: json['englishLastName'] as String?,
      email: json['email'] as String?,
      phoneNumber: json['phoneNumber'] as String?,
      identifyNumber: json['identifyNumber'] as String,
      degree: json['degree'] as String,
      dateOfBirth: json['dateOfBirth'] as String?,
      gender: json['gender'] as String?,
      currentAddress: json['currentAddress'] as String?,
      profileUrl: json['profileUrl'] as String?,
      majorName: json['majorName'] as String,
      departmentName: json['departmentName'] as String,
      userClass: UserClass.fromJson(json['userClass'] as Map<String, dynamic>),
      roles: (json['roles'] as List<dynamic>).map((e) => e as String).toList(),
      isStudent: json['isStudent'] as bool,
      createdAt: json['createdAt'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'khmerFirstName': khmerFirstName,
      'khmerLastName': khmerLastName,
      'englishFirstName': englishFirstName,
      'englishLastName': englishLastName,
      'email': email,
      'phoneNumber': phoneNumber,
      'identifyNumber': identifyNumber,
      'degree': degree,
      'dateOfBirth': dateOfBirth,
      'gender': gender,
      'currentAddress': currentAddress,
      'profileUrl': profileUrl,
      'majorName': majorName,
      'departmentName': departmentName,
      'userClass': userClass.toJson(),
      'roles': roles,
      'isStudent': isStudent,
      'createdAt': createdAt,
    };
  }

  // Helper getter for display name
  String get displayName {
    if (englishFirstName != null && englishLastName != null) {
      return '$englishFirstName $englishLastName';
    }
    if (khmerFirstName != null && khmerLastName != null) {
      return '$khmerFirstName $khmerLastName';
    }
    return username;
  }
}

class RequestModel {
  final int id;
  final String title;
  final RequestStatus status;
  final String requestComment;
  final String? staffComment;
  final User user;
  final String createdAt;
  final String? updatedAt;

  const RequestModel({
    required this.id,
    required this.title,
    required this.status,
    required this.requestComment,
    this.staffComment,
    required this.user,
    required this.createdAt,
    this.updatedAt,
  });

  factory RequestModel.fromJson(Map<String, dynamic> json) {
    return RequestModel(
      id: (json['id'] as num).toInt(),
      title: json['title'] as String,
      status: RequestStatusExtension.fromString(json['status'] as String),
      requestComment: json['requestComment'] as String,
      staffComment: json['staffComment'] as String?,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'status': status.name,
      'requestComment': requestComment,
      'staffComment': staffComment,
      'user': user.toJson(),
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  RequestModel copyWith({
    int? id,
    String? title,
    RequestStatus? status,
    String? requestComment,
    String? staffComment,
    User? user,
    String? createdAt,
    String? updatedAt,
  }) {
    return RequestModel(
      id: id ?? this.id,
      title: title ?? this.title,
      status: status ?? this.status,
      requestComment: requestComment ?? this.requestComment,
      staffComment: staffComment ?? this.staffComment,
      user: user ?? this.user,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is RequestModel &&
        other.id == id &&
        other.title == title &&
        other.status == status &&
        other.requestComment == requestComment &&
        other.staffComment == staffComment &&
        other.user == user &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        title.hashCode ^
        status.hashCode ^
        requestComment.hashCode ^
        staffComment.hashCode ^
        user.hashCode ^
        createdAt.hashCode ^
        updatedAt.hashCode;
  }

  @override
  String toString() {
    return 'RequestModel(id: $id, title: $title, status: $status, requestComment: $requestComment, staffComment: $staffComment, user: $user, createdAt: $createdAt, updatedAt: $updatedAt)';
  }
}

// Request creation model
class CreateRequestModel {
  final String title;
  final String requestComment;

  const CreateRequestModel({
    required this.title,
    required this.requestComment,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'status': 'PENDING',
      'requestComment': requestComment,
    };
  }
}

// API response models
class RequestListResponse {
  final String status;
  final String message;
  final RequestPaginatedData data;

  const RequestListResponse({
    required this.status,
    required this.message,
    required this.data,
  });

  factory RequestListResponse.fromJson(Map<String, dynamic> json) {
    return RequestListResponse(
      status: json['status'] as String,
      message: json['message'] as String,
      data: RequestPaginatedData.fromJson(json['data'] as Map<String, dynamic>),
    );
  }
}

class RequestPaginatedData {
  final List<RequestModel> content;
  final int pageNo;
  final int pageSize;
  final int totalElements;
  final int totalPages;
  final bool last;

  const RequestPaginatedData({
    required this.content,
    required this.pageNo,
    required this.pageSize,
    required this.totalElements,
    required this.totalPages,
    required this.last,
  });

  factory RequestPaginatedData.fromJson(Map<String, dynamic> json) {
    return RequestPaginatedData(
      content: (json['content'] as List<dynamic>)
          .map((e) => RequestModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      pageNo: (json['pageNo'] as num).toInt(),
      pageSize: (json['pageSize'] as num).toInt(),
      totalElements: (json['totalElements'] as num).toInt(),
      totalPages: (json['totalPages'] as num).toInt(),
      last: json['last'] as bool,
    );
  }
}

class CreateRequestResponse {
  final String status;
  final String message;
  final RequestModel data;

  const CreateRequestResponse({
    required this.status,
    required this.message,
    required this.data,
  });

  factory CreateRequestResponse.fromJson(Map<String, dynamic> json) {
    return CreateRequestResponse(
      status: json['status'] as String,
      message: json['message'] as String,
      data: RequestModel.fromJson(json['data'] as Map<String, dynamic>),
    );
  }
}
