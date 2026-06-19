// lib/features/profile/widgets/profile_info_card_widget.dart
import 'package:flutter/material.dart';
import 'package:ksit_mobile/core/constants/app_colors.dart';
import 'package:ksit_mobile/core/constants/app_constants.dart';

class ProfileInfoCardWidget extends StatelessWidget {
  final String title;
  final List<ProfileInfoItem> items;
  final bool isCollapsible;
  final bool initiallyExpanded;
  final Widget? trailing;

  const ProfileInfoCardWidget({
    super.key,
    required this.title,
    required this.items,
    this.isCollapsible = false,
    this.initiallyExpanded = true,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    if (isCollapsible) {
      return _buildCollapsibleCard();
    } else {
      return _buildStaticCard();
    }
  }

  Widget _buildStaticCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppConstants.borderRadius),
        boxShadow: const [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 16),
          _buildItems(),
        ],
      ),
    );
  }

  Widget _buildCollapsibleCard() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppConstants.borderRadius),
        boxShadow: const [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: ExpansionTile(
        initiallyExpanded: initiallyExpanded,
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        trailing: trailing ?? const Icon(Icons.expand_more),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: _buildItems(),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }

  Widget _buildItems() {
    if (items.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            'No information available',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
              fontStyle: FontStyle.italic,
            ),
          ),
        ),
      );
    }

    return Column(
      children: items.asMap().entries.map((entry) {
        final index = entry.key;
        final item = entry.value;
        final isLast = index == items.length - 1;

        return Column(
          children: [
            _buildInfoRow(item),
            if (!isLast) const SizedBox(height: 12),
          ],
        );
      }).toList(),
    );
  }

  Widget _buildInfoRow(ProfileInfoItem item) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (item.icon != null) ...[
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: (item.color ?? AppColors.primary).withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Icon(
              item.icon,
              size: 16,
              color: item.color ?? AppColors.primary,
            ),
          ),
          const SizedBox(width: 12),
        ],
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.label,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                item.value,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: item.valueColor ?? AppColors.textPrimary,
                ),
              ),
              if (item.subtitle != null) ...[
                const SizedBox(height: 2),
                Text(
                  item.subtitle!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textHint,
                  ),
                ),
              ],
            ],
          ),
        ),
        if (item.trailing != null) item.trailing!,
      ],
    );
  }
}

class ProfileInfoItem {
  final String label;
  final String value;
  final String? subtitle;
  final IconData? icon;
  final Color? color;
  final Color? valueColor;
  final Widget? trailing;

  const ProfileInfoItem({
    required this.label,
    required this.value,
    this.subtitle,
    this.icon,
    this.color,
    this.valueColor,
    this.trailing,
  });

  // Factory constructors for common info types
  factory ProfileInfoItem.contact({
    required String label,
    required String value,
    String? subtitle,
  }) {
    IconData icon;
    Color color;

    if (label.toLowerCase().contains('email')) {
      icon = Icons.email_outlined;
      color = AppColors.info;
    } else if (label.toLowerCase().contains('phone')) {
      icon = Icons.phone_outlined;
      color = AppColors.success;
    } else if (label.toLowerCase().contains('address')) {
      icon = Icons.location_on_outlined;
      color = AppColors.warning;
    } else {
      icon = Icons.info_outline;
      color = AppColors.primary;
    }

    return ProfileInfoItem(
      label: label,
      value: value,
      subtitle: subtitle,
      icon: icon,
      color: color,
    );
  }

  factory ProfileInfoItem.identity({
    required String label,
    required String value,
    String? subtitle,
  }) {
    IconData icon;
    Color color;

    if (label.toLowerCase().contains('id')) {
      icon = Icons.badge_outlined;
      color = AppColors.primary;
    } else if (label.toLowerCase().contains('birth')) {
      icon = Icons.cake_outlined;
      color = AppColors.success;
    } else if (label.toLowerCase().contains('nationality')) {
      icon = Icons.flag_outlined;
      color = AppColors.info;
    } else {
      icon = Icons.person_outline;
      color = AppColors.textSecondary;
    }

    return ProfileInfoItem(
      label: label,
      value: value,
      subtitle: subtitle,
      icon: icon,
      color: color,
    );
  }

  factory ProfileInfoItem.academic({
    required String label,
    required String value,
    String? subtitle,
  }) {
    IconData icon;
    Color color;

    if (label.toLowerCase().contains('class')) {
      icon = Icons.class_outlined;
      color = AppColors.primary;
    } else if (label.toLowerCase().contains('major')) {
      icon = Icons.school_outlined;
      color = AppColors.success;
    } else if (label.toLowerCase().contains('department')) {
      icon = Icons.business_outlined;
      color = AppColors.info;
    } else if (label.toLowerCase().contains('year')) {
      icon = Icons.calendar_today_outlined;
      color = AppColors.warning;
    } else {
      icon = Icons.book_outlined;
      color = AppColors.textSecondary;
    }

    return ProfileInfoItem(
      label: label,
      value: value,
      subtitle: subtitle,
      icon: icon,
      color: color,
    );
  }

  factory ProfileInfoItem.work({
    required String label,
    required String value,
    String? subtitle,
  }) {
    IconData icon;
    Color color;

    if (label.toLowerCase().contains('position')) {
      icon = Icons.work_outline;
      color = AppColors.primary;
    } else if (label.toLowerCase().contains('start')) {
      icon = Icons.play_arrow_outlined;
      color = AppColors.success;
    } else if (label.toLowerCase().contains('salary')) {
      icon = Icons.attach_money_outlined;
      color = AppColors.warning;
    } else {
      icon = Icons.business_center_outlined;
      color = AppColors.info;
    }

    return ProfileInfoItem(
      label: label,
      value: value,
      subtitle: subtitle,
      icon: icon,
      color: color,
    );
  }
}
