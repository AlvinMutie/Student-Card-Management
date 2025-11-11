package com.studentcard.app.ui.staff

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.studentcard.app.data.repository.QRRepository

class StaffViewModelFactory(
    private val qrRepository: QRRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(StaffViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return StaffViewModel(qrRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

