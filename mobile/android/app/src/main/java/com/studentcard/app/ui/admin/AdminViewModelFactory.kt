package com.studentcard.app.ui.admin

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.studentcard.app.data.repository.StaffRepository
import com.studentcard.app.data.repository.StudentRepository

class AdminViewModelFactory(
    private val studentRepository: StudentRepository,
    private val staffRepository: StaffRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AdminViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return AdminViewModel(studentRepository, staffRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

