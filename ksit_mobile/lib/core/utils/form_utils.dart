// lib/core/utils/form_utils.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:ksit_mobile/core/utils/validator_utils.dart';
import '../constants/app_constants.dart';
import '../../shared/widgets/custom_text_field.dart';
import '../../shared/widgets/custom_button.dart';

class FormUtils {
  // Private constructor to prevent instantiation
  FormUtils._();

  /// Show form dialog with custom fields
  static Future<Map<String, dynamic>?> showFormDialog({
    required String title,
    required List<FormFieldConfig> fields,
    String confirmText = 'Submit',
    String cancelText = 'Cancel',
    GlobalKey<FormState>? formKey,
    Map<String, dynamic>? initialValues,
  }) {
    final key = formKey ?? GlobalKey<FormState>();
    final controllers = <String, TextEditingController>{};
    final values = <String, dynamic>{};

    // Initialize controllers with initial values
    for (final field in fields) {
      final controller = TextEditingController();
      if (initialValues?.containsKey(field.key) == true) {
        controller.text = initialValues![field.key]?.toString() ?? '';
        values[field.key] = initialValues[field.key];
      }
      controllers[field.key] = controller;
    }

    return Get.dialog<Map<String, dynamic>>(
      AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(
          child: Form(
            key: key,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: fields
                  .map((field) => _buildFormField(
                        field: field,
                        controller: controllers[field.key]!,
                        onChanged: (value) => values[field.key] = value,
                      ))
                  .toList(),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              // Dispose controllers
              for (final controller in controllers.values) {
                controller.dispose();
              }
              Get.back();
            },
            child: Text(cancelText),
          ),
          CustomButton(
            text: confirmText,
            onPressed: () {
              if (key.currentState?.validate() == true) {
                // Update values from controllers
                for (final field in fields) {
                  final controller = controllers[field.key]!;
                  if (field.type == FormFieldType.number) {
                    values[field.key] = int.tryParse(controller.text) ?? 0;
                  } else if (field.type == FormFieldType.decimal) {
                    values[field.key] = double.tryParse(controller.text) ?? 0.0;
                  } else {
                    values[field.key] = controller.text;
                  }
                }

                // Dispose controllers
                for (final controller in controllers.values) {
                  controller.dispose();
                }

                Get.back(result: values);
              }
            },
          ),
        ],
      ),
    );
  }

  /// Build form field widget
  static Widget _buildFormField({
    required FormFieldConfig field,
    required TextEditingController controller,
    required Function(String) onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: CustomTextField(
        label: field.label,
        hint: field.hint,
        controller: controller,
        validator: field.validator,
        onChanged: onChanged,
        keyboardType: _getKeyboardType(field.type),
        textInputAction: field.textInputAction,
        maxLines: field.maxLines,
        obscureText: field.obscureText,
        readOnly: field.readOnly,
        prefixIcon: field.prefixIcon,
        suffixIcon: field.suffixIcon,
      ),
    );
  }

  /// Get keyboard type based on field type
  static TextInputType _getKeyboardType(FormFieldType type) {
    switch (type) {
      case FormFieldType.email:
        return TextInputType.emailAddress;
      case FormFieldType.phone:
        return TextInputType.phone;
      case FormFieldType.number:
        return TextInputType.number;
      case FormFieldType.decimal:
        return const TextInputType.numberWithOptions(decimal: true);
      case FormFieldType.url:
        return TextInputType.url;
      case FormFieldType.multiline:
        return TextInputType.multiline;
      default:
        return TextInputType.text;
    }
  }

  /// Clear form controllers
  static void clearControllers(List<TextEditingController> controllers) {
    for (final controller in controllers) {
      controller.clear();
    }
  }

  /// Dispose form controllers
  static void disposeControllers(List<TextEditingController> controllers) {
    for (final controller in controllers) {
      controller.dispose();
    }
  }

  /// Validate form and show error messages
  static bool validateFormWithMessages({
    required GlobalKey<FormState> formKey,
    bool showSnackbar = true,
  }) {
    final isValid = formKey.currentState?.validate() ?? false;

    if (!isValid && showSnackbar) {
      Get.snackbar(
        'Validation Error',
        'Please fix the errors in the form',
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 2),
      );
    }

    return isValid;
  }

  /// Create form field config for common inputs
  static FormFieldConfig createTextFieldConfig({
    required String key,
    required String label,
    String? hint,
    String? Function(String?)? validator,
    FormFieldType type = FormFieldType.text,
    bool required = false,
    int maxLines = 1,
    bool obscureText = false,
    Widget? prefixIcon,
    Widget? suffixIcon,
  }) {
    return FormFieldConfig(
      key: key,
      label: label,
      hint: hint,
      validator: validator ?? (required ? ValidationUtils.required : null),
      type: type,
      maxLines: maxLines,
      obscureText: obscureText,
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
    );
  }

  /// Create email field config
  static FormFieldConfig createEmailFieldConfig({
    required String key,
    String label = 'Email',
    String hint = 'Enter your email',
    bool required = true,
  }) {
    return FormFieldConfig(
      key: key,
      label: label,
      hint: hint,
      validator: required ? ValidationUtils.validateEmail : null,
      type: FormFieldType.email,
      prefixIcon: const Icon(Icons.email_outlined),
    );
  }

  /// Create password field config
  static FormFieldConfig createPasswordFieldConfig({
    required String key,
    String label = 'Password',
    String hint = 'Enter your password',
    bool required = true,
    int minLength = AppConstants.minPasswordLength,
  }) {
    return FormFieldConfig(
      key: key,
      label: label,
      hint: hint,
      validator: required
          ? (value) =>
              ValidationUtils.validatePassword(value, minLength: minLength)
          : null,
      type: FormFieldType.password,
      obscureText: true,
      prefixIcon: const Icon(Icons.lock_outlined),
    );
  }

  /// Create phone field config
  static FormFieldConfig createPhoneFieldConfig({
    required String key,
    String label = 'Phone',
    String hint = 'Enter your phone number',
    bool required = true,
  }) {
    return FormFieldConfig(
      key: key,
      label: label,
      hint: hint,
      validator: required ? ValidationUtils.validatePhone : null,
      type: FormFieldType.phone,
      prefixIcon: const Icon(Icons.phone_outlined),
    );
  }

  /// Create name field config
  static FormFieldConfig createNameFieldConfig({
    required String key,
    String label = 'Name',
    String hint = 'Enter your name',
    bool required = true,
  }) {
    return FormFieldConfig(
      key: key,
      label: label,
      hint: hint,
      validator: required ? ValidationUtils.validateName : null,
      type: FormFieldType.text,
      prefixIcon: const Icon(Icons.person_outlined),
    );
  }

  /// Create number field config
  static FormFieldConfig createNumberFieldConfig({
    required String key,
    required String label,
    String? hint,
    bool required = true,
    int? min,
    int? max,
  }) {
    return FormFieldConfig(
      key: key,
      label: label,
      hint: hint,
      validator: required
          ? (value) => ValidationUtils.validateNumber(value, min: min, max: max)
          : null,
      type: FormFieldType.number,
    );
  }

  /// Create multiline text field config
  static FormFieldConfig createMultilineFieldConfig({
    required String key,
    required String label,
    String? hint,
    bool required = true,
    int minLength = 10,
    int maxLines = 3,
  }) {
    return FormFieldConfig(
      key: key,
      label: label,
      hint: hint,
      validator: required
          ? (value) => ValidationUtils.validateMinLength(value, minLength)
          : null,
      type: FormFieldType.multiline,
      maxLines: maxLines,
    );
  }

  /// Auto-save form data to storage
  static void autoSaveFormData({
    required String formKey,
    required Map<String, dynamic> data,
  }) {
    // Implementation would depend on your storage service
    // Get.find<StorageService>().setString('form_$formKey', jsonEncode(data));
  }

  /// Load saved form data from storage
  static Map<String, dynamic>? loadSavedFormData(String formKey) {
    // Implementation would depend on your storage service
    // final jsonString = Get.find<StorageService>().getString('form_$formKey');
    // if (jsonString != null) {
    //   return jsonDecode(jsonString) as Map<String, dynamic>;
    // }
    return null;
  }

  /// Clear saved form data from storage
  static void clearSavedFormData(String formKey) {
    // Implementation would depend on your storage service
    // Get.find<StorageService>().remove('form_$formKey');
  }

  /// Build form with sections
  static Widget buildSectionedForm({
    required List<FormSection> sections,
    GlobalKey<FormState>? formKey,
    EdgeInsetsGeometry? padding,
  }) {
    return Form(
      key: formKey,
      child: Padding(
        padding: padding ?? const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children:
              sections.map((section) => _buildFormSection(section)).toList(),
        ),
      ),
    );
  }

  /// Build form section
  static Widget _buildFormSection(FormSection section) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (section.title != null) ...[
          Text(
            section.title!,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
        ],
        if (section.subtitle != null) ...[
          Text(
            section.subtitle!,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 16),
        ],
        ...section.fields.map((field) => Container(
              margin: const EdgeInsets.only(bottom: 16),
              child: _buildFormField(
                field: field,
                controller: field.controller ?? TextEditingController(),
                onChanged: field.onChanged ?? (value) {},
              ),
            )),
        const SizedBox(height: 24),
      ],
    );
  }

  /// Validate all form sections
  static bool validateSectionedForm({
    required List<FormSection> sections,
    bool showSnackbar = true,
  }) {
    bool isValid = true;
    String? firstError;

    for (final section in sections) {
      for (final field in section.fields) {
        if (field.validator != null && field.controller != null) {
          final error = field.validator!(field.controller!.text);
          if (error != null) {
            isValid = false;
            firstError ??= error;
          }
        }
      }
    }

    if (!isValid && showSnackbar && firstError != null) {
      Get.snackbar(
        'Validation Error',
        firstError,
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 3),
      );
    }

    return isValid;
  }

  /// Get form data from sections
  static Map<String, dynamic> getFormDataFromSections(
      List<FormSection> sections) {
    final data = <String, dynamic>{};

    for (final section in sections) {
      for (final field in section.fields) {
        if (field.controller != null) {
          final value = field.controller!.text;
          if (field.type == FormFieldType.number) {
            data[field.key] = int.tryParse(value) ?? 0;
          } else if (field.type == FormFieldType.decimal) {
            data[field.key] = double.tryParse(value) ?? 0.0;
          } else {
            data[field.key] = value;
          }
        }
      }
    }

    return data;
  }

  /// Reset all form sections
  static void resetFormSections(List<FormSection> sections) {
    for (final section in sections) {
      for (final field in section.fields) {
        field.controller?.clear();
      }
    }
  }

  /// Dispose all form sections
  static void disposeFormSections(List<FormSection> sections) {
    for (final section in sections) {
      for (final field in section.fields) {
        field.controller?.dispose();
      }
    }
  }
}

/// Configuration for a form field
class FormFieldConfig {
  final String key;
  final String label;
  final String? hint;
  final String? Function(String?)? validator;
  final FormFieldType type;
  final TextInputAction textInputAction;
  final int maxLines;
  final bool obscureText;
  final bool readOnly;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final TextEditingController? controller;
  final Function(String)? onChanged;

  const FormFieldConfig({
    required this.key,
    required this.label,
    this.hint,
    this.validator,
    this.type = FormFieldType.text,
    this.textInputAction = TextInputAction.next,
    this.maxLines = 1,
    this.obscureText = false,
    this.readOnly = false,
    this.prefixIcon,
    this.suffixIcon,
    this.controller,
    this.onChanged,
  });
}

/// Form field types
enum FormFieldType {
  text,
  email,
  password,
  phone,
  number,
  decimal,
  url,
  multiline,
}

/// Form section configuration
class FormSection {
  final String? title;
  final String? subtitle;
  final List<FormFieldConfig> fields;

  const FormSection({
    this.title,
    this.subtitle,
    required this.fields,
  });
}
