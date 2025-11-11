package com.studentcard.app.data.repository

import com.studentcard.app.data.api.ApiService
import com.studentcard.app.data.models.QRScanRequest
import com.studentcard.app.data.models.QRScanResponse

class QRRepository(private val apiService: ApiService) {
    suspend fun scanQRCode(qrData: String, scannedBy: Int): Result<QRScanResponse> {
        return try {
            val response = apiService.scanQRCode(QRScanRequest(qrData, scannedBy))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val errorMessage = response.errorBody()?.string() ?: "Failed to scan QR code"
                Result.failure(Exception("QR scan failed: $errorMessage"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

