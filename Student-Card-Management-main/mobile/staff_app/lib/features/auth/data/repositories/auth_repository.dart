import 'dart:convert';
import 'package:shule_inadvantage/core/api/api_client.dart';
import 'package:shule_inadvantage/core/constants/constants.dart';

class AuthRepository {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _apiClient.post(
      AppConstants.loginEndpoint,
      {
        'email': email,
        'password': password,
      },
      includeAuth: false,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      try {
        final data = jsonDecode(response.body);
        throw ApiException(data['message'] ?? 'Login failed', statusCode: response.statusCode);
      } on FormatException {
        // If the server returns HTML (e.g., 404 Not Found or 500 Internal Server Error)
        throw ApiException(
          'Server Error (${response.statusCode}): The server returned an invalid response. Please check if the backend is running.',
          statusCode: response.statusCode,
        );
      }
    }
  }

  Future<bool> validateToken() async {
    try {
      final response = await _apiClient.get(AppConstants.validateTokenEndpoint);
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _apiClient.post(AppConstants.logoutEndpoint, {});
    } catch (_) {
      // Ignore logout errors as we'll clear local data anyway
    }
  }
}
