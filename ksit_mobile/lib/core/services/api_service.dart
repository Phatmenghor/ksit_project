// lib/core/services/api_service.dart
import 'package:dio/dio.dart';
import 'package:get/get.dart' hide Response, FormData, MultipartFile;
import 'package:ksit_mobile/core/constants/app_routes.dart';
import 'package:ksit_mobile/core/constants/app_storages.dart';
import '../config/app_config.dart';
import '../utils/logger_utils.dart';
import 'storage_service.dart';

class ApiService extends GetxService {
  late Dio _dio;
  final StorageService _storageService = Get.find<StorageService>();

  @override
  void onInit() {
    super.onInit();
    _initializeDio();
  }

  void _initializeDio() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConfig.baseUrl,
      connectTimeout: Duration(milliseconds: AppConfig.connectTimeout),
      receiveTimeout: Duration(milliseconds: AppConfig.receiveTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Add auth token if available
          final token = _storageService.getString(AppStorages.tokenKey);
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          LoggerUtils.info('API Request: ${options.method} ${options.path}');
          LoggerUtils.debug('Request Headers: ${options.headers}');
          LoggerUtils.debug(
              'Request Data: ${_formatRequestData(options.data)}');

          handler.next(options);
        },
        onResponse: (response, handler) {
          LoggerUtils.info(
              'API Response: ${response.statusCode} ${response.requestOptions.path}');
          LoggerUtils.debug(
              'Response Data: ${_formatResponseData(response.data)}');
          handler.next(response);
        },
        onError: (error, handler) {
          LoggerUtils.error('API Error: ${error.message}', error);
          _handleError(error);
          handler.next(error);
        },
      ),
    );
  }

  /// Smart formatting for request data
  String _formatRequestData(dynamic data) {
    if (data == null) return 'null';

    try {
      final String dataStr = data.toString();
      if (dataStr.length > 500) {
        return '${dataStr.substring(0, 500)}... [Request data truncated - ${dataStr.length} chars total]';
      }
      return dataStr;
    } catch (e) {
      return 'Error formatting request data: $e';
    }
  }

  /// Smart formatting for response data with list handling
  String _formatResponseData(dynamic data) {
    if (data == null) return 'null';

    try {
      // Handle Map responses
      if (data is Map<String, dynamic>) {
        return _formatMapResponse(data);
      }

      // Handle List responses
      if (data is List) {
        return _formatListResponse(data);
      }

      // Handle other types
      final String dataStr = data.toString();
      if (dataStr.length > 1000) {
        return '${dataStr.substring(0, 1000)}... [Response truncated - ${dataStr.length} chars total]';
      }
      return dataStr;
    } catch (e) {
      return 'Error formatting response data: $e';
    }
  }

  /// Format Map response with special handling for common structures
  String _formatMapResponse(Map<String, dynamic> data) {
    final buffer = StringBuffer();
    buffer.write('{');

    bool isFirst = true;
    for (final entry in data.entries) {
      if (!isFirst) buffer.write(', ');
      isFirst = false;

      final key = entry.key;
      final value = entry.value;

      buffer.write('"$key": ');

      if (value is List) {
        buffer.write(_formatListValue(value));
      } else if (value is Map) {
        if (value.toString().length > 200) {
          buffer.write('{...${value.length} properties}');
        } else {
          buffer.write(value.toString());
        }
      } else if (value is String && value.length > 100) {
        buffer.write('"${value.substring(0, 100)}..."');
      } else {
        buffer.write(value is String ? '"$value"' : value.toString());
      }
    }

    buffer.write('}');

    final result = buffer.toString();
    if (result.length > 1500) {
      return '${result.substring(0, 1500)}... [Map response truncated]';
    }
    return result;
  }

  /// Format List response with smart truncation
  String _formatListResponse(List data) {
    if (data.isEmpty) return '[]';

    if (data.length == 1) {
      return '[${_formatSingleItem(data[0])}]';
    }

    if (data.length <= 3) {
      final items = data.map((item) => _formatSingleItem(item)).join(', ');
      return '[$items]';
    }

    // For larger lists, show first 2 items and summary
    final firstItem = _formatSingleItem(data[0]);
    final secondItem = _formatSingleItem(data[1]);

    return '[$firstItem, $secondItem, ... +${data.length - 2} more items (${data.length} total)]';
  }

  /// Format List value in Map response
  String _formatListValue(List value) {
    if (value.isEmpty) return '[]';

    if (value.length == 1) {
      return '[${_formatSingleItem(value[0])}]';
    }

    if (value.length <= 2) {
      final items = value.map((item) => _formatSingleItem(item)).join(', ');
      return '[$items]';
    }

    return '[${_formatSingleItem(value[0])}, ... +${value.length - 1} more (${value.length} total)]';
  }

  /// Format single item with truncation
  String _formatSingleItem(dynamic item) {
    if (item == null) return 'null';

    if (item is Map) {
      final Map<String, dynamic> map = item as Map<String, dynamic>;
      if (map.length <= 3) {
        return map.toString();
      }
      final keys = map.keys.take(3).join(', ');
      return '{$keys... +${map.length - 3} more}';
    }

    if (item is String && item.length > 50) {
      return '"${item.substring(0, 50)}..."';
    }

    final itemStr = item.toString();
    if (itemStr.length > 100) {
      return '${itemStr.substring(0, 100)}...';
    }

    return item is String ? '"$item"' : itemStr;
  }

  void _handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        LoggerUtils.error('Connection timeout');
        break;
      case DioExceptionType.sendTimeout:
        LoggerUtils.error('Send timeout');
        break;
      case DioExceptionType.receiveTimeout:
        LoggerUtils.error('Receive timeout');
        break;
      case DioExceptionType.badResponse:
        LoggerUtils.error('Bad response: ${error.response?.statusCode}');
        if (error.response?.statusCode == 401) {
          _handleUnauthorized();
        }
        break;
      case DioExceptionType.cancel:
        LoggerUtils.error('Request cancelled');
        break;
      case DioExceptionType.unknown:
        LoggerUtils.error('Unknown error: ${error.message}');
        break;
      default:
        LoggerUtils.error('Unexpected error: ${error.message}');
    }
  }

  void _handleUnauthorized() {
    // Clear token and redirect to login
    _storageService.remove(AppStorages.tokenKey);
    _storageService.remove(AppStorages.userKey);
    Get.offAllNamed(AppRoutes.loginRoute);
  }

  // GET Request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } catch (e) {
      LoggerUtils.error('GET Request failed: $path', e);
      rethrow;
    }
  }

  // POST Request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } catch (e) {
      LoggerUtils.error('POST Request failed: $path', e);
      rethrow;
    }
  }

  // PUT Request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } catch (e) {
      LoggerUtils.error('PUT Request failed: $path', e);
      rethrow;
    }
  }

  // DELETE Request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } catch (e) {
      LoggerUtils.error('DELETE Request failed: $path', e);
      rethrow;
    }
  }

  // PATCH Request
  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.patch<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } catch (e) {
      LoggerUtils.error('PATCH Request failed: $path', e);
      rethrow;
    }
  }

  // Upload File
  Future<Response<T>> uploadFile<T>(
    String path,
    String filePath, {
    String? fileName,
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
    CancelToken? cancelToken,
  }) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
        ...?data,
      });

      return await _dio.post<T>(
        path,
        data: formData,
        onSendProgress: onSendProgress,
        cancelToken: cancelToken,
      );
    } catch (e) {
      LoggerUtils.error('File upload failed: $path', e);
      rethrow;
    }
  }

  // Download File
  Future<Response> downloadFile(
    String path,
    String savePath, {
    Map<String, dynamic>? queryParameters,
    ProgressCallback? onReceiveProgress,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.download(
        path,
        savePath,
        queryParameters: queryParameters,
        onReceiveProgress: onReceiveProgress,
        cancelToken: cancelToken,
      );
    } catch (e) {
      LoggerUtils.error('File download failed: $path', e);
      rethrow;
    }
  }

  // Helper method to get full endpoint URL
  String getEndpointUrl(String endpoint) {
    return AppConfig.baseUrl + endpoint;
  }

  // Helper method to get current environment info
  Map<String, dynamic> get environmentInfo => AppConfig.debugInfo;
}
