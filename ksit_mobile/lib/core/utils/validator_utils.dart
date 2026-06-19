// lib/core/utils/validation_utils.dart
import '../constants/app_constants.dart';

class ValidationUtils {
  // Private constructor to prevent instantiation
  ValidationUtils._();

  /// Required field validator
  static String? required(String? value, {String? fieldName}) {
    if (value == null || value.trim().isEmpty) {
      return '${fieldName ?? 'This field'} is required';
    }
    return null;
  }

  /// Email validation
  static String? validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Email is required';
    }

    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value.trim())) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  /// Password validation
  static String? validatePassword(String? value,
      {int minLength = AppConstants.minPasswordLength}) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    if (value.length < minLength) {
      return 'Password must be at least $minLength characters';
    }
    return null;
  }

  /// Strong password validation
  static String? validateStrongPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }

    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!value.contains(RegExp(r'[a-z]'))) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'Password must contain at least one number';
    }

    if (!value.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) {
      return 'Password must contain at least one special character';
    }

    return null;
  }

  /// Confirm password validation
  static String? validateConfirmPassword(
      String? value, String? originalPassword) {
    if (value == null || value.isEmpty) {
      return 'Please confirm your password';
    }
    if (value != originalPassword) {
      return 'Passwords do not match';
    }
    return null;
  }

  /// Name validation
  static String? validateName(String? value, {int minLength = 2}) {
    if (value == null || value.trim().isEmpty) {
      return 'Name is required';
    }
    if (value.trim().length < minLength) {
      return 'Name must be at least $minLength characters';
    }
    if (!RegExp(r'^[a-zA-Z\s]+$').hasMatch(value.trim())) {
      return 'Name can only contain letters and spaces';
    }
    return null;
  }

  /// Phone validation
  static String? validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Phone number is required';
    }

    // Remove all non-digit characters for validation
    final digitsOnly = value.replaceAll(RegExp(r'\D'), '');

    if (digitsOnly.length < 8) {
      return 'Phone number must be at least 8 digits';
    }

    if (digitsOnly.length > 15) {
      return 'Phone number cannot exceed 15 digits';
    }

    return null;
  }

  /// Number validation
  static String? validateNumber(String? value, {int? min, int? max}) {
    if (value == null || value.trim().isEmpty) {
      return 'Number is required';
    }

    final number = int.tryParse(value.trim());
    if (number == null) {
      return 'Please enter a valid number';
    }

    if (min != null && number < min) {
      return 'Number must be at least $min';
    }

    if (max != null && number > max) {
      return 'Number cannot exceed $max';
    }

    return null;
  }

  /// Decimal validation
  static String? validateDecimal(String? value,
      {double? min, double? max, int? decimalPlaces}) {
    if (value == null || value.trim().isEmpty) {
      return 'Decimal number is required';
    }

    final number = double.tryParse(value.trim());
    if (number == null) {
      return 'Please enter a valid decimal number';
    }

    if (min != null && number < min) {
      return 'Number must be at least $min';
    }

    if (max != null && number > max) {
      return 'Number cannot exceed $max';
    }

    if (decimalPlaces != null) {
      final parts = value.split('.');
      if (parts.length > 1 && parts[1].length > decimalPlaces) {
        return 'Number can have at most $decimalPlaces decimal places';
      }
    }

    return null;
  }

  /// URL validation
  static String? validateUrl(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'URL is required';
    }

    final uri = Uri.tryParse(value.trim());
    if (uri == null || !uri.hasScheme || !uri.hasAuthority) {
      return 'Please enter a valid URL';
    }

    return null;
  }

  /// Minimum length validation
  static String? validateMinLength(String? value, int minLength,
      {String? fieldName}) {
    if (value == null || value.trim().isEmpty) {
      return '${fieldName ?? 'This field'} is required';
    }
    if (value.trim().length < minLength) {
      return '${fieldName ?? 'This field'} must be at least $minLength characters';
    }
    return null;
  }

  /// Maximum length validation
  static String? validateMaxLength(String? value, int maxLength,
      {String? fieldName}) {
    if (value != null && value.length > maxLength) {
      return '${fieldName ?? 'This field'} cannot exceed $maxLength characters';
    }
    return null;
  }

  /// Length range validation
  static String? validateLengthRange(
      String? value, int minLength, int maxLength,
      {String? fieldName}) {
    final field = fieldName ?? 'This field';

    if (value == null || value.trim().isEmpty) {
      return '$field is required';
    }

    if (value.trim().length < minLength) {
      return '$field must be at least $minLength characters';
    }

    if (value.length > maxLength) {
      return '$field cannot exceed $maxLength characters';
    }

    return null;
  }

  /// Credit card validation (Luhn algorithm)
  static String? validateCreditCard(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Credit card number is required';
    }

    final cardNumber = value.replaceAll(RegExp(r'\s+'), '');

    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return 'Credit card number must be between 13 and 19 digits';
    }

    if (!RegExp(r'^[0-9]+$').hasMatch(cardNumber)) {
      return 'Credit card number can only contain digits';
    }

    // Luhn algorithm
    int sum = 0;
    bool alternate = false;

    for (int i = cardNumber.length - 1; i >= 0; i--) {
      int digit = int.parse(cardNumber[i]);

      if (alternate) {
        digit *= 2;
        if (digit > 9) digit = (digit % 10) + 1;
      }

      sum += digit;
      alternate = !alternate;
    }

    if (sum % 10 != 0) {
      return 'Invalid credit card number';
    }

    return null;
  }

  /// Date validation (yyyy-mm-dd format)
  static String? validateDate(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Date is required';
    }

    try {
      DateTime.parse(value.trim());
      return null;
    } catch (e) {
      return 'Please enter a valid date (yyyy-mm-dd)';
    }
  }

  /// Future date validation
  static String? validateFutureDate(String? value) {
    final dateError = validateDate(value);
    if (dateError != null) return dateError;

    final date = DateTime.parse(value!.trim());
    if (date.isBefore(DateTime.now())) {
      return 'Date must be in the future';
    }

    return null;
  }

  /// Past date validation
  static String? validatePastDate(String? value) {
    final dateError = validateDate(value);
    if (dateError != null) return dateError;

    final date = DateTime.parse(value!.trim());
    if (date.isAfter(DateTime.now())) {
      return 'Date must be in the past';
    }

    return null;
  }

  /// Age validation
  static String? validateAge(String? value,
      {int minAge = 0, int maxAge = 150}) {
    final dateError = validatePastDate(value);
    if (dateError != null) return dateError;

    final birthDate = DateTime.parse(value!.trim());
    final now = DateTime.now();
    int age = now.year - birthDate.year;

    if (now.month < birthDate.month ||
        (now.month == birthDate.month && now.day < birthDate.day)) {
      age--;
    }

    if (age < minAge) {
      return 'Age must be at least $minAge years';
    }

    if (age > maxAge) {
      return 'Age cannot exceed $maxAge years';
    }

    return null;
  }

  /// Username validation
  static String? validateUsername(String? value,
      {int minLength = 3, int maxLength = 50}) {
    if (value == null || value.trim().isEmpty) {
      return 'Username is required';
    }

    if (value.length < minLength) {
      return 'Username must be at least $minLength characters';
    }

    if (value.length > maxLength) {
      return 'Username cannot exceed $maxLength characters';
    }

    return null;
  }

  /// Postal code validation
  static String? validatePostalCode(String? value, {String? countryCode}) {
    if (value == null || value.trim().isEmpty) {
      return 'Postal code is required';
    }

    // Default to US postal code format
    String pattern = r'^\d{5}(-\d{4})?$';
    String errorMessage =
        'Please enter a valid postal code (e.g., 12345 or 12345-6789)';

    switch (countryCode?.toUpperCase()) {
      case 'CA': // Canada
        pattern = r'^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$';
        errorMessage =
            'Please enter a valid Canadian postal code (e.g., A1A 1A1)';
        break;
      case 'UK':
      case 'GB': // United Kingdom
        pattern = r'^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$';
        errorMessage = 'Please enter a valid UK postal code (e.g., SW1A 1AA)';
        break;
      case 'DE': // Germany
        pattern = r'^\d{5}$';
        errorMessage = 'Please enter a valid German postal code (e.g., 12345)';
        break;
    }

    if (!RegExp(pattern).hasMatch(value.trim())) {
      return errorMessage;
    }

    return null;
  }

  /// Custom pattern validation
  static String? validatePattern(
      String? value, String pattern, String errorMessage) {
    if (value == null || value.trim().isEmpty) {
      return 'This field is required';
    }

    if (!RegExp(pattern).hasMatch(value.trim())) {
      return errorMessage;
    }

    return null;
  }

  /// Multiple validators combiner
  static String? Function(String?) combineValidators(
      List<String? Function(String?)> validators) {
    return (String? value) {
      for (final validator in validators) {
        final result = validator(value);
        if (result != null) return result;
      }
      return null;
    };
  }

  /// Conditional validator
  static String? Function(String?) conditionalValidator({
    required bool Function() condition,
    required String? Function(String?) validator,
  }) {
    return (String? value) {
      if (condition()) {
        return validator(value);
      }
      return null;
    };
  }
}
