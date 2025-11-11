package com.studentcard.app.ui.staff

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.studentcard.app.data.api.RetrofitClient
import com.studentcard.app.data.local.preferences.AuthPreferences
import com.studentcard.app.data.repository.QRRepository
import com.studentcard.app.databinding.ActivityStaffDashboardBinding
import com.studentcard.app.ui.auth.LoginActivity
import com.studentcard.app.ui.qr.QRScannerActivity
import com.studentcard.app.ui.staff.StaffViewModelFactory

class StaffDashboardActivity : AppCompatActivity() {
    private lateinit var binding: ActivityStaffDashboardBinding
    private lateinit var viewModel: StaffViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityStaffDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Check authentication
        if (!AuthPreferences.isLoggedIn() || !AuthPreferences.isStaff()) {
            navigateToLogin()
            return
        }
        
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Staff Dashboard"
        
        // Initialize ViewModel
        val qrRepository = QRRepository(RetrofitClient.apiService)
        val factory = StaffViewModelFactory(qrRepository)
        viewModel = ViewModelProvider(this, factory)[StaffViewModel::class.java]
        
        setupViews()
    }
    
    private fun setupViews() {
        binding.welcomeText.text = "Welcome, ${AuthPreferences.getUserName() ?: AuthPreferences.getUserEmail()}"
        
        binding.scanQRButton.setOnClickListener {
            val intent = Intent(this, QRScannerActivity::class.java)
            startActivity(intent)
        }
    }
    
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(com.studentcard.app.R.menu.menu_main, menu)
        return true
    }
    
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            com.studentcard.app.R.id.action_logout -> {
                logout()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    private fun logout() {
        AuthPreferences.clearAuth()
        navigateToLogin()
    }
    
    private fun navigateToLogin() {
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}

