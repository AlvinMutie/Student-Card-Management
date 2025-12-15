package com.studentcard.app.data.repository

import com.studentcard.app.data.api.ApiService
import com.studentcard.app.data.models.Staff

class StaffRepository(private val apiService: ApiService) {
    suspend fun getAllStaff(): Result<List<Staff>> {
        return try {
            val response = apiService.getAllStaff()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch staff"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getStaffById(id: Int): Result<Staff> {
        return try {
            val response = apiService.getStaffById(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch staff"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createStaff(staff: Staff): Result<Staff> {
        return try {
            val response = apiService.createStaff(staff)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to create staff"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateStaff(id: Int, staff: Staff): Result<Staff> {
        return try {
            val response = apiService.updateStaff(id, staff)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update staff"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteStaff(id: Int): Result<Unit> {
        return try {
            val response = apiService.deleteStaff(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to delete staff"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

