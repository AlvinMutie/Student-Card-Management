import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shule_inadvantage/core/constants/constants.dart';
import 'package:shule_inadvantage/core/services/secure_storage_service.dart';
import 'package:logger/logger.dart';

class ApiClient {
  final http.Client _client = http.Client();
  final SecureStorageService _storage = SecureStorageService();
  final Logger _logger = Logger();

  // Singleton pattern
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  Future<Map<String, String>> _getHeaders({bool includeAuth = true}) async {
    final Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth) {
      final token = await _storage.getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  Future<http.Response> get(String endpoint, {bool includeAuth = true}) async {
    try {
      final url = Uri.parse('${AppConstants.apiBaseUrl}$endpoint');
      final headers = await _getHeaders(includeAuth: includeAuth);
      
      _logger.d('GET Request to: $url');
      final response = await _client.get(url, headers: headers).timeout(const Duration(seconds: 15));
      
      _handleResponse(response);
      return response;
    } catch (e) {
      _logger.e('GET Request Error: $e');
      rethrow;
    }
  }

  Future<http.Response> post(String endpoint, dynamic body, {bool includeAuth = true}) async {
    try {
      final url = Uri.parse('${AppConstants.apiBaseUrl}$endpoint');
      final headers = await _getHeaders(includeAuth: includeAuth);
      
      _logger.d('POST Request to: $url with body: $body');
      final response = await _client.post(
        url, 
        headers: headers, 
        body: jsonEncode(body)
      ).timeout(const Duration(seconds: 15));
      
      _handleResponse(response);
      return response;
    } catch (e) {
      _logger.e('POST Request Error: $e');
      rethrow;
    }
  }

  Future<http.Response> put(String endpoint, dynamic body, {bool includeAuth = true}) async {
    try {
      final url = Uri.parse('${AppConstants.apiBaseUrl}$endpoint');
      final headers = await _getHeaders(includeAuth: includeAuth);
      
      _logger.d('PUT Request to: $url with body: $body');
      final response = await _client.put(
        url, 
        headers: headers, 
        body: jsonEncode(body)
      ).timeout(const Duration(seconds: 15));
      
      _handleResponse(response);
      return response;
    } catch (e) {
      _logger.e('PUT Request Error: $e');
      rethrow;
    }
  }

  void _handleResponse(http.Response response) {
    _logger.d('Response status: ${response.statusCode}');
    if (response.statusCode >= 200 && response.statusCode < 300) {
      // Debug logging to inspect response structure
      _logger.d('Response Body: ${response.body}');
    }
    
    if (response.statusCode >= 400) {
      _logger.e('API Error ${response.statusCode}: ${response.body}');
      
      if (response.statusCode == 401) {
        _logger.w('Unauthorized request - 401');
      }
    }
  }
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}
