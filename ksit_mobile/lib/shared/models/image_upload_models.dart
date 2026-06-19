// lib/shared/models/image_upload_models.dart
class ImageUploadRequest {
  final String type;
  final String base64;

  const ImageUploadRequest({
    required this.type,
    required this.base64,
  });

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'base64': base64,
    };
  }

  factory ImageUploadRequest.fromJson(Map<String, dynamic> json) {
    return ImageUploadRequest(
      type: json['type'] as String,
      base64: json['base64'] as String,
    );
  }

  ImageUploadRequest copyWith({
    String? type,
    String? base64,
  }) {
    return ImageUploadRequest(
      type: type ?? this.type,
      base64: base64 ?? this.base64,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ImageUploadRequest &&
        other.type == type &&
        other.base64 == base64;
  }

  @override
  int get hashCode => type.hashCode ^ base64.hashCode;

  @override
  String toString() {
    return 'ImageUploadRequest(type: $type, base64: ${base64.substring(0, 50)}...)';
  }
}

class ImageDto {
  final String? id;
  final String imageUrl;
  final String type;

  const ImageDto({
    this.id,
    required this.imageUrl,
    required this.type,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'imageUrl': imageUrl,
      'type': type,
    };
  }

  factory ImageDto.fromJson(Map<String, dynamic> json) {
    return ImageDto(
      id: json['id'] as String?,
      imageUrl: json['imageUrl'] as String,
      type: json['type'] as String,
    );
  }

  ImageDto copyWith({
    String? id,
    String? imageUrl,
    String? type,
  }) {
    return ImageDto(
      id: id ?? this.id,
      imageUrl: imageUrl ?? this.imageUrl,
      type: type ?? this.type,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ImageDto &&
        other.id == id &&
        other.imageUrl == imageUrl &&
        other.type == type;
  }

  @override
  int get hashCode => id.hashCode ^ imageUrl.hashCode ^ type.hashCode;

  @override
  String toString() {
    return 'ImageDto(id: $id, imageUrl: $imageUrl, type: $type)';
  }
}
