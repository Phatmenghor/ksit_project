// lib/features/profile/widgets/profile_image_widget.dart
import 'package:flutter/material.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';

class ProfileImageWidget extends StatelessWidget {
  final String? imageUrl;
  final double radius;
  final bool showEditButton;
  final VoidCallback? onEditPressed;
  final String? placeholder;

  const ProfileImageWidget({
    super.key,
    this.imageUrl,
    this.radius = 50,
    this.showEditButton = false,
    this.onEditPressed,
    this.placeholder,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        CircleAvatar(
          radius: radius,
          backgroundColor: AppColors.primary.withOpacity(0.1),
          backgroundImage: _getImageProvider(),
          child: _buildPlaceholder(),
        ),
        if (showEditButton)
          Positioned(
            bottom: 0,
            right: 0,
            child: GestureDetector(
              onTap: onEditPressed,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.camera_alt,
                  color: Colors.white,
                  size: radius * 0.3,
                ),
              ),
            ),
          ),
      ],
    );
  }

  ImageProvider? _getImageProvider() {
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      if (imageUrl!.startsWith('http')) {
        return NetworkImage(imageUrl!);
      } else {
        // Local asset image
        return AssetImage(imageUrl!);
      }
    }
    return null;
  }

  Widget? _buildPlaceholder() {
    if (imageUrl == null || imageUrl!.isEmpty) {
      if (placeholder != null && placeholder!.isNotEmpty) {
        // Show initials
        return Text(
          _getInitials(placeholder!),
          style: TextStyle(
            fontSize: radius * 0.4,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          ),
        );
      } else {
        // Show default icon
        return Icon(
          Icons.person,
          size: radius * 0.8,
          color: AppColors.primary,
        );
      }
    }
    return null;
  }

  String _getInitials(String name) {
    List<String> names = name.split(' ');
    String initials = '';

    if (names.isNotEmpty) {
      initials += names[0][0].toUpperCase();
    }
    if (names.length > 1) {
      initials += names[1][0].toUpperCase();
    }

    return initials;
  }
}
