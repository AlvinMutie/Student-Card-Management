package com.studentcard.app.data.models

data class Student(
    val id: Int,
    val name: String,
    val email: String?,
    val phone: String?,
    val studentId: String,
    val grade: String?,
    val parentId: Int? = null,
    val createdAt: String? = null
)

