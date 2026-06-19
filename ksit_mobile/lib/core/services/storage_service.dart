import 'package:shared_preferences/shared_preferences.dart';
import '../utils/logger_utils.dart';

class StorageService {
  static StorageService? _instance;
  static SharedPreferences? _preferences;

  StorageService._();

  static Future<StorageService> getInstance() async {
    _instance ??= StorageService._();
    _preferences ??= await SharedPreferences.getInstance();
    return _instance!;
  }

  // String operations
  Future<bool> setString(String key, String value) async {
    try {
      final result = await _preferences!.setString(key, value);
      LoggerUtils.debug('Storage: Set string $key = $value');
      return result;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to set string $key', e);
      return false;
    }
  }

  String? getString(String key) {
    try {
      final value = _preferences!.getString(key);
      LoggerUtils.debug('Storage: Get string $key = $value');
      return value;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to get string $key', e);
      return null;
    }
  }

  // Boolean operations
  Future<bool> setBool(String key, bool value) async {
    try {
      final result = await _preferences!.setBool(key, value);
      LoggerUtils.debug('Storage: Set bool $key = $value');
      return result;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to set bool $key', e);
      return false;
    }
  }

  bool? getBool(String key) {
    try {
      final value = _preferences!.getBool(key);
      LoggerUtils.debug('Storage: Get bool $key = $value');
      return value;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to get bool $key', e);
      return null;
    }
  }

  // Integer operations
  Future<bool> setInt(String key, int value) async {
    try {
      final result = await _preferences!.setInt(key, value);
      LoggerUtils.debug('Storage: Set int $key = $value');
      return result;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to set int $key', e);
      return false;
    }
  }

  int? getInt(String key) {
    try {
      final value = _preferences!.getInt(key);
      LoggerUtils.debug('Storage: Get int $key = $value');
      return value;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to get int $key', e);
      return null;
    }
  }

  // Double operations
  Future<bool> setDouble(String key, double value) async {
    try {
      final result = await _preferences!.setDouble(key, value);
      LoggerUtils.debug('Storage: Set double $key = $value');
      return result;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to set double $key', e);
      return false;
    }
  }

  double? getDouble(String key) {
    try {
      final value = _preferences!.getDouble(key);
      LoggerUtils.debug('Storage: Get double $key = $value');
      return value;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to get double $key', e);
      return null;
    }
  }

  // String list operations
  Future<bool> setStringList(String key, List<String> value) async {
    try {
      final result = await _preferences!.setStringList(key, value);
      LoggerUtils.debug('Storage: Set string list $key = $value');
      return result;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to set string list $key', e);
      return false;
    }
  }

  List<String>? getStringList(String key) {
    try {
      final value = _preferences!.getStringList(key);
      LoggerUtils.debug('Storage: Get string list $key = $value');
      return value;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to get string list $key', e);
      return null;
    }
  }

  // Remove operations
  Future<bool> remove(String key) async {
    try {
      final result = await _preferences!.remove(key);
      LoggerUtils.debug('Storage: Removed key $key');
      return result;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to remove key $key', e);
      return false;
    }
  }

  // Clear all
  Future<bool> clear() async {
    try {
      final result = await _preferences!.clear();
      LoggerUtils.debug('Storage: Cleared all data');
      return result;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to clear all data', e);
      return false;
    }
  }

  // Check if key exists
  bool containsKey(String key) {
    try {
      final result = _preferences!.containsKey(key);
      LoggerUtils.debug('Storage: Contains key $key = $result');
      return result;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to check key $key', e);
      return false;
    }
  }

  // Get all keys
  Set<String> getKeys() {
    try {
      final keys = _preferences!.getKeys();
      LoggerUtils.debug('Storage: All keys = $keys');
      return keys;
    } catch (e) {
      LoggerUtils.error('Storage: Failed to get all keys', e);
      return <String>{};
    }
  }
}
