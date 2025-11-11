package com.studentcard.app

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.studentcard.app.data.local.preferences.AuthPreferences
import com.studentcard.app.ui.auth.LoginActivity
import com.studentcard.app.ui.admin.AdminDashboardActivity
import com.studentcard.app.ui.staff.StaffDashboardActivity
import com.studentcard.app.utils.Constants

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize AuthPreferences
        AuthPreferences.init(this)
        
        // Check if user is already logged in
        if (AuthPreferences.isLoggedIn()) {
            val role = AuthPreferences.getUserRole() ?: ""
            val intent = when (role.lowercase()) {
                Constants.ROLE_ADMIN -> Intent(this, AdminDashboardActivity::class.java)
                Constants.ROLE_STAFF -> Intent(this, StaffDashboardActivity::class.java)
                else -> Intent(this, LoginActivity::class.java)
            }
            startActivity(intent)
            finish()
        } else {
            // Navigate to login
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
            finish()
        }
    }
}

