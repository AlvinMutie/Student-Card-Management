import 'package:shared_preferences/shared_preferences.dart';
import 'package:shule_inadvantage/core/constants/constants.dart';

class UserPreferencesService {
  static final UserPreferencesService _instance = UserPreferencesService._internal();
  factory UserPreferencesService() => _instance;
  UserPreferencesService._internal();

  late SharedPreferences _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  Future<void> setDarkMode(bool value) async {
    await _prefs.setBool('${AppConstants.userPrefsKey}_dark_mode', value);
  }

  bool isDarkMode() {
    return _prefs.getBool('${AppConstants.userPrefsKey}_dark_mode') ?? false;
  }

  Future<void> setLastLoggedInUser(String email) async {
    await _prefs.setString('${AppConstants.userPrefsKey}_last_user', email);
  }

  String? getLastLoggedInUser() {
    return _prefs.getString('${AppConstants.userPrefsKey}_last_user');
  }

  Future<void> clearPreferences() async {
    await _prefs.clear();
  }
}
