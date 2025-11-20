package com.studentcard.app.utils

object Constants {
    // API Base URLs
    const val BASE_URL_EMULATOR = "http://10.0.2.2:3000/api/"
    const val BASE_URL_LOCAL = "http://192.168.1.100:3000/api/" // Replace with your local IP
    
    // SharedPreferences Keys
    const val PREFS_NAME = "student_card_prefs"
    const val KEY_TOKEN = "auth_token"
    const val KEY_USER_ID = "user_id"
    const val KEY_USER_EMAIL = "user_email"
    const val KEY_USER_ROLE = "user_role"
    const val KEY_USER_NAME = "user_name"
    
    // Roles
    const val ROLE_ADMIN = "admin"
    const val ROLE_STAFF = "staff"
    
    // Request Codes
    const val REQUEST_CAMERA_PERMISSION = 100
    const val REQUEST_SCAN_QR = 200
}

