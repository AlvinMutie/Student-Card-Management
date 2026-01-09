package com.studentcard.app.data.repository

import com.studentcard.app.data.api.ApiService
import com.studentcard.app.data.models.LoginRequest
import com.studentcard.app.data.models.LoginResponse
import com.studentcard.app.data.models.User
import com.studentcard.app.data.models.UserResponse

class AuthRepository(private val apiService: ApiService) {
    suspend fun login(email: String, password: String): Result<LoginResponse> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val errorMessage = response.errorBody()?.string() ?: "Login failed"
                Result.failure(Exception("Login failed: $errorMessage"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCurrentUser(): Result<User> {
        return try {
            val response = apiService.getCurrentUser()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.user)
            } else {
                Result.failure(Exception("Failed to get user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

