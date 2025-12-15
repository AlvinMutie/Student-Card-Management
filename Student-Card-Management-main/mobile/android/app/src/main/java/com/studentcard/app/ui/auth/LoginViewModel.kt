package com.studentcard.app.ui.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.studentcard.app.data.models.LoginResponse
import com.studentcard.app.data.repository.AuthRepository
import kotlinx.coroutines.launch

class LoginViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _loginResult = MutableLiveData<Result<LoginResponse>>()
    val loginResult: LiveData<Result<LoginResponse>> = _loginResult
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = authRepository.login(email, password)
            _loginResult.value = result
            _isLoading.value = false
        }
    }
}

