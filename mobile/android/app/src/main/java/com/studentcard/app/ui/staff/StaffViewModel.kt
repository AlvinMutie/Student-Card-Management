package com.studentcard.app.ui.staff

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.studentcard.app.data.models.QRScanResponse
import com.studentcard.app.data.repository.QRRepository
import kotlinx.coroutines.launch

class StaffViewModel(
    private val qrRepository: QRRepository
) : ViewModel() {
    
    private val _qrScanResult = MutableLiveData<Result<QRScanResponse>>()
    val qrScanResult: LiveData<Result<QRScanResponse>> = _qrScanResult
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    fun scanQRCode(qrData: String, scannedBy: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = qrRepository.scanQRCode(qrData, scannedBy)
            _qrScanResult.value = result
            _isLoading.value = false
        }
    }
}

