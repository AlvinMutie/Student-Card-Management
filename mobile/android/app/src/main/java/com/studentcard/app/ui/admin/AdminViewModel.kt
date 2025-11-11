package com.studentcard.app.ui.admin

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.studentcard.app.data.models.Student
import com.studentcard.app.data.models.Staff
import com.studentcard.app.data.repository.StudentRepository
import com.studentcard.app.data.repository.StaffRepository
import kotlinx.coroutines.launch

class AdminViewModel(
    private val studentRepository: StudentRepository,
    private val staffRepository: StaffRepository
) : ViewModel() {
    
    // Students
    private val _students = MutableLiveData<List<Student>>()
    val students: LiveData<List<Student>> = _students
    
    private val _studentError = MutableLiveData<String?>()
    val studentError: LiveData<String?> = _studentError
    
    private val _isLoadingStudents = MutableLiveData<Boolean>()
    val isLoadingStudents: LiveData<Boolean> = _isLoadingStudents
    
    // Staff
    private val _staff = MutableLiveData<List<Staff>>()
    val staff: LiveData<List<Staff>> = _staff
    
    private val _staffError = MutableLiveData<String?>()
    val staffError: LiveData<String?> = _staffError
    
    private val _isLoadingStaff = MutableLiveData<Boolean>()
    val isLoadingStaff: LiveData<Boolean> = _isLoadingStaff
    
    // Student operations
    fun loadStudents() {
        viewModelScope.launch {
            _isLoadingStudents.value = true
            _studentError.value = null
            val result = studentRepository.getAllStudents()
            result.onSuccess { studentList ->
                _students.value = studentList
            }.onFailure { error ->
                _studentError.value = error.message
            }
            _isLoadingStudents.value = false
        }
    }
    
    fun createStudent(student: Student) {
        viewModelScope.launch {
            val result = studentRepository.createStudent(student)
            result.onSuccess {
                loadStudents() // Refresh list
            }.onFailure { error ->
                _studentError.value = error.message
            }
        }
    }
    
    fun updateStudent(id: Int, student: Student) {
        viewModelScope.launch {
            val result = studentRepository.updateStudent(id, student)
            result.onSuccess {
                loadStudents() // Refresh list
            }.onFailure { error ->
                _studentError.value = error.message
            }
        }
    }
    
    fun deleteStudent(id: Int) {
        viewModelScope.launch {
            val result = studentRepository.deleteStudent(id)
            result.onSuccess {
                loadStudents() // Refresh list
            }.onFailure { error ->
                _studentError.value = error.message
            }
        }
    }
    
    // Staff operations
    fun loadStaff() {
        viewModelScope.launch {
            _isLoadingStaff.value = true
            _staffError.value = null
            val result = staffRepository.getAllStaff()
            result.onSuccess { staffList ->
                _staff.value = staffList
            }.onFailure { error ->
                _staffError.value = error.message
            }
            _isLoadingStaff.value = false
        }
    }
    
    fun createStaff(staff: Staff) {
        viewModelScope.launch {
            val result = staffRepository.createStaff(staff)
            result.onSuccess {
                loadStaff() // Refresh list
            }.onFailure { error ->
                _staffError.value = error.message
            }
        }
    }
    
    fun updateStaff(id: Int, staff: Staff) {
        viewModelScope.launch {
            val result = staffRepository.updateStaff(id, staff)
            result.onSuccess {
                loadStaff() // Refresh list
            }.onFailure { error ->
                _staffError.value = error.message
            }
        }
    }
    
    fun deleteStaff(id: Int) {
        viewModelScope.launch {
            val result = staffRepository.deleteStaff(id)
            result.onSuccess {
                loadStaff() // Refresh list
            }.onFailure { error ->
                _staffError.value = error.message
            }
        }
    }
}

