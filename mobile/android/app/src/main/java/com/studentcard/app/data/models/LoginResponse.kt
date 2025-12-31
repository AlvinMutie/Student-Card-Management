package com.studentcard.app.data.models

data class LoginResponse(
    val token: String,
    val user: User
)

