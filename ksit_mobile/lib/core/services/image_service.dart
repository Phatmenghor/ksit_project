// lib/core/services/image_service.dart
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:ksit_mobile/core/services/api_service.dart';
import 'package:ksit_mobile/core/utils/api_error_utils.dart';
import 'package:ksit_mobile/core/utils/logger_utils.dart';
import 'package:ksit_mobile/shared/models/image_upload_models.dart';

class ImageService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();
  final ImagePicker _imagePicker = ImagePicker();

  /// Upload image from gallery
  Future<ImageDto> uploadImageFromGallery({
    required String type,
    int imageQuality = 80,
    double maxWidth = 1024,
    double maxHeight = 1024,
  }) async {
    try {
      final XFile? pickedFile = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: imageQuality,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
      );

      if (pickedFile == null) {
        throw Exception('No image selected');
      }

      return await _uploadImageFile(pickedFile, type);
    } catch (e) {
      ApiErrorUtils.throwApiError(e, 'Failed to upload image from gallery');
    }
  }

  /// Upload image from camera
  Future<ImageDto> uploadImageFromCamera({
    required String type,
    int imageQuality = 80,
    double maxWidth = 1024,
    double maxHeight = 1024,
  }) async {
    try {
      final XFile? pickedFile = await _imagePicker.pickImage(
        source: ImageSource.camera,
        imageQuality: imageQuality,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
      );

      if (pickedFile == null) {
        throw Exception('No image captured');
      }

      return await _uploadImageFile(pickedFile, type);
    } catch (e) {
      ApiErrorUtils.throwApiError(e, 'Failed to upload image from camera');
    }
  }

  Future<ImageDto> _uploadImageFile(XFile imageFile, String category) async {
    try {
      // Read image file as bytes
      final Uint8List imageBytes = await imageFile.readAsBytes();

      // Convert to base64 (without data URL prefix)
      final String base64Image = base64Encode(imageBytes);

      // Extract actual file extension from the file path
      final String fileExtension = imageFile.path.split('.').last.toLowerCase();

      // Validate file extension
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
      if (!validExtensions.contains(fileExtension)) {
        throw Exception('Unsupported file type: $fileExtension');
      }

      // Create upload request with correct type (file extension, not category)
      final request = ImageUploadRequest(
        type: fileExtension, // 'jpg', 'png', etc. - NOT 'profile'
        base64: base64Image,
      );

      LoggerUtils.info('Sending request: ${request.toJson()}');
      return await uploadImage(request);
    } catch (e) {
      LoggerUtils.error('Failed to process image file: $e');
      ApiErrorUtils.throwApiError(e, 'Failed to process image file');
    }
  }

  /// Upload image with base64 data
  Future<ImageDto> uploadImage(ImageUploadRequest request) async {
    try {
      final response = await _apiService.post(
        '/images', // Remove '/api' to match web endpoint
        data: request.toJson(),
      );

      if (response.statusCode == 201 && response.data != null) {
        final responseData = response.data;

        return ImageDto.fromJson(responseData);
      } else {
        throw Exception('Failed to upload image: ${response.statusCode}');
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(
          e, 'Failed to upload image. Please try again.');
    }
  }

  /// Show image picker options
  Future<ImageDto?> showImagePickerOptions({
    required String type,
    int imageQuality = 80,
    double maxWidth = 1024,
    double maxHeight = 1024,
  }) async {
    try {
      final result = await Get.bottomSheet<String>(
        Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              // Title
              const Text(
                'Select Image Source',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),

              const SizedBox(height: 20),

              // Gallery option
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Gallery'),
                onTap: () => Get.back(result: 'gallery'),
              ),

              // Camera option
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Camera'),
                onTap: () => Get.back(result: 'camera'),
              ),

              // Cancel option
              ListTile(
                leading: const Icon(Icons.cancel),
                title: const Text('Cancel'),
                onTap: () => Get.back(),
              ),
            ],
          ),
        ),
        isScrollControlled: true,
      );

      if (result == null) return null;

      switch (result) {
        case 'gallery':
          return await uploadImageFromGallery(
            type: type,
            imageQuality: imageQuality,
            maxWidth: maxWidth,
            maxHeight: maxHeight,
          );
        case 'camera':
          return await uploadImageFromCamera(
            type: type,
            imageQuality: imageQuality,
            maxWidth: maxWidth,
            maxHeight: maxHeight,
          );
        default:
          return null;
      }
    } catch (e) {
      ApiErrorUtils.throwApiError(e, 'Failed to upload image');
    }
  }

  /// Convert file to base64
  static Future<String> fileToBase64(File file) async {
    try {
      final bytes = await file.readAsBytes();
      return base64Encode(bytes);
    } catch (e) {
      throw Exception('Failed to convert file to base64: $e');
    }
  }

  /// Get image file size in KB
  static Future<int> getImageSizeKB(XFile imageFile) async {
    try {
      final bytes = await imageFile.readAsBytes();
      return (bytes.length / 1024).round();
    } catch (e) {
      return 0;
    }
  }

  /// Validate image file
  static Future<bool> validateImageFile(
    XFile imageFile, {
    int maxSizeKB = 5000, // 5MB default
    List<String> allowedExtensions = const ['jpg', 'jpeg', 'png'],
  }) async {
    try {
      // Check file extension
      final extension = imageFile.path.split('.').last.toLowerCase();
      if (!allowedExtensions.contains(extension)) {
        throw Exception(
            'Invalid file type. Allowed: ${allowedExtensions.join(', ')}');
      }

      // Check file size
      final sizeKB = await getImageSizeKB(imageFile);
      if (sizeKB > maxSizeKB) {
        throw Exception('File size too large. Max size: ${maxSizeKB}KB');
      }

      return true;
    } catch (e) {
      throw Exception('Image validation failed: $e');
    }
  }
}
