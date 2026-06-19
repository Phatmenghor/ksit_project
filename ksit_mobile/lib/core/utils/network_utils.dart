import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';

class NetworkUtils {
  static final Connectivity _connectivity = Connectivity();

  // Check if device has internet connection
  static Future<bool> hasInternetConnection() async {
    try {
      final connectivityResult = await _connectivity.checkConnectivity();

      if (connectivityResult == ConnectivityResult.none) {
        return false;
      }

      // Additional check by trying to resolve a host
      final result = await InternetAddress.lookup('google.com');
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  // Get connectivity type
  static Future<ConnectivityType> getConnectivityType() async {
    final connectivityResult = await _connectivity.checkConnectivity();

    switch (connectivityResult) {
      case ConnectivityResult.wifi:
        return ConnectivityType.wifi;
      case ConnectivityResult.mobile:
        return ConnectivityType.mobile;
      case ConnectivityResult.ethernet:
        return ConnectivityType.ethernet;
      case ConnectivityResult.bluetooth:
        return ConnectivityType.bluetooth;
      default:
        return ConnectivityType.none;
    }
  }

  // Listen to connectivity changes
  static Stream<ConnectivityResult> get connectivityStream {
    return _connectivity.onConnectivityChanged;
  }

  // Check if on mobile data
  static Future<bool> isOnMobileData() async {
    final connectivityType = await getConnectivityType();
    return connectivityType == ConnectivityType.mobile;
  }

  // Check if on WiFi
  static Future<bool> isOnWiFi() async {
    final connectivityType = await getConnectivityType();
    return connectivityType == ConnectivityType.wifi;
  }

  // Get network info as string
  static Future<String> getNetworkInfo() async {
    final connectivityType = await getConnectivityType();
    final hasInternet = await hasInternetConnection();

    String status = 'Connected via ${connectivityType.name}';
    if (!hasInternet) {
      status += ' (No Internet)';
    }

    return status;
  }

  // Check if should show network-dependent content
  static Future<bool> shouldShowNetworkContent() async {
    return await hasInternetConnection();
  }

  // Get connection quality estimation
  static Future<ConnectionQuality> getConnectionQuality() async {
    if (!await hasInternetConnection()) {
      return ConnectionQuality.none;
    }

    final connectivityType = await getConnectivityType();

    switch (connectivityType) {
      case ConnectivityType.wifi:
      case ConnectivityType.ethernet:
        return ConnectionQuality.high;
      case ConnectivityType.mobile:
        // Could be enhanced with actual speed testing
        return ConnectionQuality.medium;
      default:
        return ConnectionQuality.low;
    }
  }

  // Format bytes to human readable
  static String formatBytes(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }
}

enum ConnectivityType {
  wifi,
  mobile,
  ethernet,
  bluetooth,
  none,
}

enum ConnectionQuality {
  none,
  low,
  medium,
  high,
}
