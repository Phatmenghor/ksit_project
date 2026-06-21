// lib/features/auth/screens/login_screen.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ksit_mobile/features/auth/widgets/help_modal_bottom_sheet.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/constants/app_image.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../controllers/auth_controller.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authController = Get.find<AuthController>();

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage(AppImages.loginBg),
            fit: BoxFit.cover,
          ),
        ),
        child: SafeArea(
          child: Obx(() {
            return Column(
              children: [
                // Main content with centered form
                Expanded(
                  child: Center(
                    child: SingleChildScrollView(
                      padding:
                          const EdgeInsets.all(AppConstants.defaultPadding),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 24,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.1),
                              blurRadius: 30,
                              offset: const Offset(0, 15),
                            ),
                          ],
                        ),
                        child: Form(
                          key: authController.formKey,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const Text(
                                "Welcome,",
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(
                                height: 4,
                              ),
                              const Text(
                                "Please login to continue",
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w400,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(
                                height: 32,
                              ),
                              // Username Field
                              CustomTextField(
                                hint: 'Enter your username',
                                controller: authController.usernameController,
                                keyboardType: TextInputType.text,
                                textInputAction: TextInputAction.next,
                                prefixIcon: const Icon(
                                  Icons.person_outlined,
                                  color: AppColors.primary,
                                ),
                                validator: authController.validateUsername,
                                fillColor: Colors.white,
                              ),

                              const SizedBox(height: 16),

                              // Password Field
                              CustomTextField(
                                hint: 'Enter your password',
                                controller: authController.passwordController,
                                obscureText: true,
                                textInputAction: TextInputAction.done,
                                prefixIcon: const Icon(
                                  Icons.lock_outlined,
                                  color: AppColors.primary,
                                ),
                                validator: authController.validatePassword,
                                onSubmitted: (_) => authController.login(),
                                fillColor: Colors.white,
                              ),

                              const SizedBox(height: 16),

                              // Login Button
                              CustomButton(
                                text: 'Sign In',
                                onPressed: authController.login,
                                isLoading: authController.isLoading.value,
                                height: 44,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                borderRadius: BorderRadius.circular(8),
                              ),

                              const SizedBox(height: 20),

                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Forgot username or password?',
                                    style: TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: () {
                                      HelpModalBottomSheet.show(context);
                                    },
                                    child: const Text(
                                      'Get help!',
                                      style: TextStyle(
                                        decoration: TextDecoration.underline,
                                        decorationColor: AppColors
                                            .warning, // Custom underline color
                                        color: AppColors.warning,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w400,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),

                // Version Info  bottom
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Version ${AppConstants.appVersion}',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }
}
