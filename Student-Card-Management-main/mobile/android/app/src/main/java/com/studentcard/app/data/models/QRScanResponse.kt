package com.studentcard.app.data.models

data class QRScanResponse(
    val success: Boolean,
    val message: String,
    val student: Student? = null
)

