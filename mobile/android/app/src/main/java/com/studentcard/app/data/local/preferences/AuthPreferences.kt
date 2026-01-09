package com.studentcard.app.data.local.preferences

import android.content.Context
import android.content.SharedPreferences
import com.studentcard.app.utils.Constants

object AuthPreferences {
    private var prefsInstance: SharedPreferences? = null
    
    fun init(context: Context) {
        if (prefsInstance == null) {
            prefsInstance = context.getSharedPreferences(Constants.PREFS_NAME, Context.MODE_PRIVATE)
        }
    }
    
    private fun getPreferences(): SharedPreferences {
        return prefsInstance ?: throw IllegalStateException("AuthPreferences not initialized. Call init() first.")
    }
    
    fun saveToken(token: String) {
        getPreferences().edit().putString(Constants.KEY_TOKEN, token).apply()
    }
    
    fun getToken(): String? {
        return getPreferences().getString(Constants.KEY_TOKEN, null)
    }
    
    fun saveUser(userId: Int, email: String, role: String, name: String? = null) {
        getPreferences().edit().apply {
            putInt(Constants.KEY_USER_ID, userId)
            putString(Constants.KEY_USER_EMAIL, email)
            putString(Constants.KEY_USER_ROLE, role)
            if (name != null) {
                putString(Constants.KEY_USER_NAME, name)
            }
            apply()
        }
    }
    
    fun getUserId(): Int {
        return getPreferences().getInt(Constants.KEY_USER_ID, -1)
    }
    
    fun getUserEmail(): String? {
        return getPreferences().getString(Constants.KEY_USER_EMAIL, null)
    }
    
    fun getUserRole(): String? {
        return getPreferences().getString(Constants.KEY_USER_ROLE, null)
    }
    
    fun getUserName(): String? {
        return getPreferences().getString(Constants.KEY_USER_NAME, null)
    }
    
    fun isLoggedIn(): Boolean {
        return getToken() != null
    }
    
    fun clearAuth() {
        getPreferences().edit().clear().apply()
    }
    
    fun isAdmin(): Boolean {
        return getUserRole() == Constants.ROLE_ADMIN
    }
    
    fun isStaff(): Boolean {
        return getUserRole() == Constants.ROLE_STAFF
    }
}

