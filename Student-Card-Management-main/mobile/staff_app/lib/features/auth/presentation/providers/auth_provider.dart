import 'dart:io';
import 'package:flutter/material.dart';
import 'package:shule_inadvantage/core/services/secure_storage_service.dart';
import 'package:shule_inadvantage/features/auth/data/repositories/auth_repository.dart';

enum AuthStatus { initial, authenticating, authenticated, unauthenticated, error }

class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository = AuthRepository();
  final SecureStorageService _storage = SecureStorageService();

  AuthStatus _status = AuthStatus.initial;
  String? _error;
  Map<String, dynamic>? _user;

  AuthStatus get status => _status;
  String? get error => _error;
  Map<String, dynamic>? get user => _user;

  AuthProvider() {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    final hasToken = await _storage.hasToken();
    if (hasToken) {
      // Load user data from storage
      _user = await _storage.getUser();
      
      try {
        final isValid = await _authRepository.validateToken();
        if (isValid) {
          _status = AuthStatus.authenticated;
        } else {
          await _storage.deleteToken();
          await _storage.deleteUser();
          _user = null;
          _status = AuthStatus.unauthenticated;
        }
      } catch (e) {
        // If network error (offline), trust the token for now if we have user data
        if (_user != null) {
          _status = AuthStatus.authenticated;
        } else {
          _status = AuthStatus.unauthenticated;
        }
      }
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _status = AuthStatus.authenticating;
    _error = null;
    notifyListeners();

    try {
      final data = await _authRepository.login(email, password);
      final token = data['token'];
      _user = data['user'];
      
      await _storage.saveToken(token);
      await _storage.saveUser(_user!);
      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } on SocketException {
      _status = AuthStatus.error;
      _error = 'It seems you\'re offline. Mind checking your internet connection and trying again?';
      notifyListeners();
      return false;
    } catch (e) {
      _status = AuthStatus.error;
      _error = 'We couldn\'t sign you in. Mind checking your Staff ID and PIN?';
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authRepository.logout();
    await _storage.deleteToken();
    await _storage.deleteUser();
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
