package com.studentcard.app.data.models

data class ApiError(
    val message: String,
    val errors: Map<String, List<String>>? = null
)

