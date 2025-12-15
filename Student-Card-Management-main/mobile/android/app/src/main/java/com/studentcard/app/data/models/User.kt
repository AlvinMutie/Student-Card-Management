package com.studentcard.app.data.models

data class User(
    val id: Int,
    val email: String,
    val role: String,
    val name: String? = null
)

