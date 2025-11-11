package com.studentcard.app.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.studentcard.app.data.api.RetrofitClient
import com.studentcard.app.data.local.preferences.AuthPreferences
import com.studentcard.app.data.repository.AuthRepository
import com.studentcard.app.databinding.ActivityLoginBinding
import com.studentcard.app.ui.admin.AdminDashboardActivity
import com.studentcard.app.ui.auth.LoginViewModelFactory
import com.studentcard.app.ui.staff.StaffDashboardActivity
import com.studentcard.app.utils.Constants

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding
    private lateinit var viewModel: LoginViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Initialize ViewModel
        val authRepository = AuthRepository(RetrofitClient.apiService)
        val factory = LoginViewModelFactory(authRepository)
        viewModel = ViewModelProvider(this, factory)[LoginViewModel::class.java]
        
        // Check if already logged in
        if (AuthPreferences.isLoggedIn()) {
            navigateToDashboard()
            return
        }
        
        setupObservers()
        setupLoginButton()
    }
    
    private fun setupObservers() {
        viewModel.loginResult.observe(this) { result ->
            result.onSuccess { loginResponse ->
                // Save token and user data
                AuthPreferences.saveToken(loginResponse.token)
                AuthPreferences.saveUser(
                    loginResponse.user.id,
                    loginResponse.user.email,
                    loginResponse.user.role,
                    loginResponse.user.name
                )
                
                // Validate role - only allow admin and staff
                val role = loginResponse.user.role.lowercase()
                if (role != Constants.ROLE_ADMIN && role != Constants.ROLE_STAFF) {
                    Toast.makeText(this, "Access denied. Only staff and admin can use this app.", Toast.LENGTH_LONG).show()
                    AuthPreferences.clearAuth()
                    return@onSuccess
                }
                
                navigateToDashboard()
            }.onFailure { error ->
                Toast.makeText(this, "Login failed: ${error.message}", Toast.LENGTH_LONG).show()
            }
        }
        
        viewModel.isLoading.observe(this) { isLoading ->
            binding.loginButton.isEnabled = !isLoading
            binding.progressBar.visibility = if (isLoading) android.view.View.VISIBLE else android.view.View.GONE
        }
    }
    
    private fun setupLoginButton() {
        binding.loginButton.setOnClickListener {
            val email = binding.emailEditText.text.toString().trim()
            val password = binding.passwordEditText.text.toString()
            
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter email and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            viewModel.login(email, password)
        }
    }
    
    private fun navigateToDashboard() {
        val role = AuthPreferences.getUserRole() ?: return
        val intent = when (role.lowercase()) {
            Constants.ROLE_ADMIN -> Intent(this, AdminDashboardActivity::class.java)
            Constants.ROLE_STAFF -> Intent(this, StaffDashboardActivity::class.java)
            else -> {
                Toast.makeText(this, "Invalid role", Toast.LENGTH_SHORT).show()
                return
            }
        }
        startActivity(intent)
        finish()
    }
}

