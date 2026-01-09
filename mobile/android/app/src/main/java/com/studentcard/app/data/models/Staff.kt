package com.studentcard.app.data.models

data class Staff(
    val id: Int,
    val name: String,
    val email: String,
    val phone: String? = null,
    val role: String? = null,
    val createdAt: String? = null
)

