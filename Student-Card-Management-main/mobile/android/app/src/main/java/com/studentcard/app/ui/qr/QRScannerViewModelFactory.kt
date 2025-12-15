package com.studentcard.app.ui.qr

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.studentcard.app.data.repository.QRRepository

class QRScannerViewModelFactory(
    private val qrRepository: QRRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(QRScannerViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return QRScannerViewModel(qrRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

