package com.studentcard.app.data.models

data class QRScanRequest(
    val qrData: String,
    val scannedBy: Int // staff/admin user id
)

