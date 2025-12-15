package com.studentcard.app.data.api

import com.studentcard.app.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Authentication
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
    
    @GET("auth/me")
    suspend fun getCurrentUser(): Response<UserResponse>
    
    // Students
    @GET("students")
    suspend fun getAllStudents(): Response<List<Student>>
    
    @GET("students/{id}")
    suspend fun getStudentById(@Path("id") id: Int): Response<Student>
    
    @POST("students")
    suspend fun createStudent(@Body student: Student): Response<Student>
    
    @PUT("students/{id}")
    suspend fun updateStudent(@Path("id") id: Int, @Body student: Student): Response<Student>
    
    @DELETE("students/{id}")
    suspend fun deleteStudent(@Path("id") id: Int): Response<Unit>
    
    // QR Code Scanning
    @POST("students/scan-qr")
    suspend fun scanQRCode(@Body request: QRScanRequest): Response<QRScanResponse>
    
    // Staff (for admin)
    @GET("staff")
    suspend fun getAllStaff(): Response<List<Staff>>
    
    @GET("staff/{id}")
    suspend fun getStaffById(@Path("id") id: Int): Response<Staff>
    
    @POST("staff")
    suspend fun createStaff(@Body staff: Staff): Response<Staff>
    
    @PUT("staff/{id}")
    suspend fun updateStaff(@Path("id") id: Int, @Body staff: Staff): Response<Staff>
    
    @DELETE("staff/{id}")
    suspend fun deleteStaff(@Path("id") id: Int): Response<Unit>
}

