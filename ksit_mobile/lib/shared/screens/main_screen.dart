import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:ksit_mobile/core/constants/app_routes.dart';

import '../../core/constants/app_colors.dart';

class MainScreen extends StatefulWidget {
  final Widget child;

  const MainScreen({
    super.key,
    required this.child,
  });

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<BottomNavigationItem> _navigationItems = [
    const BottomNavigationItem(
      route: AppRoutes.homeRoute,
      icon: Icons.home_outlined,
      activeIcon: Icons.home,
      label: 'Home',
    ),
    const BottomNavigationItem(
      route: AppRoutes.scanRoute,
      icon: Icons.qr_code_scanner_outlined,
      activeIcon: Icons.qr_code_scanner,
      label: 'Scan',
    ),
    const BottomNavigationItem(
      route: AppRoutes.requestRoute,
      icon: Icons.request_page_outlined,
      activeIcon: Icons.request_page,
      label: 'Requests',
    ),
    const BottomNavigationItem(
      route: AppRoutes.profileRoute,
      icon: Icons.person_outline,
      activeIcon: Icons.person,
      label: 'Profile',
    ),
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _updateSelectedIndex();
  }

  void _updateSelectedIndex() {
    final String location = GoRouterState.of(context).fullPath ?? '';
    for (int i = 0; i < _navigationItems.length; i++) {
      if (location == _navigationItems[i].route) {
        _selectedIndex = i;
        break;
      }
    }
  }

  void _onItemTapped(int index) {
    if (index != _selectedIndex) {
      context.go(_navigationItems[index].route);
      setState(() {
        _selectedIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.bottomNavBackground,
          boxShadow: [
            BoxShadow(
              color: AppColors.shadowLight,
              blurRadius: 10,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: _navigationItems.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                final isSelected = index == _selectedIndex;

                return _buildNavigationItem(
                  item: item,
                  isSelected: isSelected,
                  onTap: () => _onItemTapped(index),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavigationItem({
    required BottomNavigationItem item,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.primary.withOpacity(0.1)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  isSelected ? item.activeIcon : item.icon,
                  size: 24,
                  color: isSelected
                      ? AppColors.bottomNavSelected
                      : AppColors.bottomNavUnselected,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                item.label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected
                      ? AppColors.bottomNavSelected
                      : AppColors.bottomNavUnselected,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class BottomNavigationItem {
  final String route;
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const BottomNavigationItem({
    required this.route,
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}
