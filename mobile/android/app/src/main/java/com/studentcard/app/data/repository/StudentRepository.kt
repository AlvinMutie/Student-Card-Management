package com.studentcard.app.data.repository

import com.studentcard.app.data.api.ApiService
import com.studentcard.app.data.models.Student

class StudentRepository(private val apiService: ApiService) {
    suspend fun getAllStudents(): Result<List<Student>> {
        return try {
            val response = apiService.getAllStudents()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch students"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getStudentById(id: Int): Result<Student> {
        return try {
            val response = apiService.getStudentById(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch student"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createStudent(student: Student): Result<Student> {
        return try {
            val response = apiService.createStudent(student)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to create student"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateStudent(id: Int, student: Student): Result<Student> {
        return try {
            val response = apiService.updateStudent(id, student)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update student"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteStudent(id: Int): Result<Unit> {
        return try {
            val response = apiService.deleteStudent(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to delete student"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

