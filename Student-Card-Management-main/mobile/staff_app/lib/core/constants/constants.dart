class AppConstants {
  // API URL - should be changed to the actual production URL
  static const String apiBaseUrl = 'https://shuleniadvantage.co.ke/api';
  
  // API Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String validateTokenEndpoint = '/auth/profile'; // Changed from /auth/validate
  static const String logoutEndpoint = '/auth/logout';
  
  static const String visitorEndpoint = '/visitors';
  static const String visitorVerifyEndpoint = '/visitors/verify';
  static const String visitorCheckInEndpoint = '/visitors/check-in'; // Documentation says POST /check-in
  static const String visitorCheckOutEndpoint = '/visitors/check-out';
  static const String visitorRegisterEndpoint = '/visitors/check-in';
  static const String visitorApproveEndpoint = '/visitors/approve';
  static const String visitorRejectEndpoint = '/visitors/reject';
  
  static const String studentLookupEndpoint = '/students/scan-qr'; // Documentation says POST /scan-qr

  // Storage Keys
  static const String tokenKey = 'jwt_token';
  static const String userPrefsKey = 'user_preferences';
}
