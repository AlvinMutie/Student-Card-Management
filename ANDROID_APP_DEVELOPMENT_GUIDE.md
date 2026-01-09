# Android App Development Guide
## Student Card Management System - Mobile App

This guide provides comprehensive instructions for developing the Android mobile application for the Student Card Management System using **Android Studio** and **Kotlin**.

---

## 📱 Project Overview

The Android app will replicate the functionality of the web application, allowing users to:
- **Admin**: Manage students, parents, and staff
- **Parent**: View student information and manage profile
- **Staff**: Register and access staff features

---

## 🏗️ Architecture Overview

### Technology Stack
- **Language**: Kotlin
- **IDE**: Android Studio
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)
- **Architecture**: MVVM (Model-View-ViewModel)
- **Networking**: Retrofit 2 + OkHttp
- **JSON Parsing**: Gson or Kotlinx Serialization
- **Authentication**: JWT Token Storage (SharedPreferences/DataStore)
- **Database**: Room (for local caching, optional)
- **Image Loading**: Glide or Coil
- **Dependency Injection**: Hilt or Koin

---

## 📂 Recommended Project Structure

```
mobile/android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/studentcard/
│   │   │   │   ├── StudentCardApp/
│   │   │   │   │   ├── data/
│   │   │   │   │   │   ├── api/
│   │   │   │   │   │   │   ├── ApiService.kt
│   │   │   │   │   │   │   ├── AuthService.kt
│   │   │   │   │   │   │   └── RetrofitClient.kt
│   │   │   │   │   │   ├── local/
│   │   │   │   │   │   │   ├── database/
│   │   │   │   │   │   │   │   └── AppDatabase.kt
│   │   │   │   │   │   │   └── preferences/
│   │   │   │   │   │   │       └── AuthPreferences.kt
│   │   │   │   │   │   ├── models/
│   │   │   │   │   │   │   ├── User.kt
│   │   │   │   │   │   │   ├── Student.kt
│   │   │   │   │   │   │   ├── Parent.kt
│   │   │   │   │   │   │   ├── Staff.kt
│   │   │   │   │   │   │   └── LoginResponse.kt
│   │   │   │   │   │   └── repository/
│   │   │   │   │   │       ├── AuthRepository.kt
│   │   │   │   │   │       ├── StudentRepository.kt
│   │   │   │   │   │       ├── ParentRepository.kt
│   │   │   │   │   │       └── StaffRepository.kt
│   │   │   │   │   ├── ui/
│   │   │   │   │   │   ├── auth/
│   │   │   │   │   │   │   ├── LoginActivity.kt
│   │   │   │   │   │   │   ├── LoginViewModel.kt
│   │   │   │   │   │   │   └── fragments/
│   │   │   │   │   │   ├── admin/
│   │   │   │   │   │   │   ├── AdminDashboardActivity.kt
│   │   │   │   │   │   │   ├── AdminDashboardViewModel.kt
│   │   │   │   │   │   │   ├── students/
│   │   │   │   │   │   │   ├── parents/
│   │   │   │   │   │   │   └── staff/
│   │   │   │   │   │   ├── parent/
│   │   │   │   │   │   │   ├── ParentDashboardActivity.kt
│   │   │   │   │   │   │   ├── ParentDashboardViewModel.kt
│   │   │   │   │   │   │   └── StudentInfoFragment.kt
│   │   │   │   │   │   └── staff/
│   │   │   │   │   │       └── StaffRegistrationActivity.kt
│   │   │   │   │   ├── utils/
│   │   │   │   │   │   ├── Constants.kt
│   │   │   │   │   │   ├── TokenInterceptor.kt
│   │   │   │   │   │   └── Extensions.kt
│   │   │   │   │   └── MainActivity.kt
│   │   │   ├── res/
│   │   │   │   ├── layout/
│   │   │   │   ├── values/
│   │   │   │   ├── drawable/
│   │   │   │   └── mipmap/
│   │   │   └── AndroidManifest.xml
│   │   └── test/
│   └── build.gradle.kts
├── build.gradle.kts
└── settings.gradle.kts
```

---

## 🔧 Setup Instructions

### Step 1: Create New Android Project

1. Open **Android Studio**
2. Click **File → New → New Project**
3. Select **Empty Activity** template
4. Configure:
   - **Name**: StudentCardManagement
   - **Package name**: com.studentcard.app (or your preferred package)
   - **Language**: Kotlin
   - **Minimum SDK**: API 24 (Android 7.0)
   - **Build configuration language**: Kotlin DSL

### Step 2: Add Dependencies

Add these dependencies to your `app/build.gradle.kts`:

```kotlin
dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    
    // Lifecycle & ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.7.0")
    implementation("androidx.activity:activity-ktx:1.8.2")
    implementation("androidx.fragment:fragment-ktx:1.6.2")
    
    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    
    // DataStore (for storing tokens)
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    
    // Room Database (optional, for caching)
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    
    // Image Loading
    implementation("com.github.bumptech.glide:glide:4.16.0")
    
    // Dependency Injection (Hilt)
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
```

### Step 3: Add Internet Permission

Add to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Step 4: Configure ProGuard (Optional)

If using code obfuscation, add rules for Retrofit and Gson in `proguard-rules.pro`.

---

## 📡 API Integration

### Backend API Base URL

**Development**: `http://10.0.2.2:3000/api` (Android Emulator)
**Development (Physical Device)**: `http://YOUR_LOCAL_IP:3000/api`
**Production**: `https://your-api-domain.com/api`

### API Endpoints Reference

#### Authentication
- `POST /api/auth/login` - Login
  ```json
  Request: { "email": "string", "password": "string" }
  Response: { "token": "string", "user": { "id": int, "email": "string", "role": "string" } }
  ```

- `GET /api/auth/me` - Get current user (requires token)
  ```json
  Response: { "user": { "id": int, "email": "string", "role": "string", ... } }
  ```

#### Students
- `GET /api/students` - Get all students (admin only)
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/parent/my-students` - Get parent's children
- `POST /api/students` - Create student (admin only)
- `PUT /api/students/:id` - Update student (admin only)
- `DELETE /api/students/:id` - Delete student (admin only)

#### Parents
- `GET /api/parents` - Get all parents (admin only)
- `GET /api/parents/:id` - Get parent by ID
- `POST /api/parents` - Create parent
- `PUT /api/parents/:id` - Update parent (admin only)
- `DELETE /api/parents/:id` - Delete parent (admin only)

#### Staff
- `GET /api/staff` - Get all staff (admin only)
- `GET /api/staff/:id` - Get staff by ID
- `POST /api/staff` - Create staff
- `PUT /api/staff/:id` - Update staff (admin only)
- `DELETE /api/staff/:id` - Delete staff (admin only)

---

## 💻 Implementation Guide

### 1. Create Data Models

#### User.kt
```kotlin
data class User(
    val id: Int,
    val email: String,
    val role: String,
    val name: String? = null
)
```

#### Student.kt
```kotlin
data class Student(
    val id: Int,
    val name: String,
    val email: String?,
    val phone: String?,
    val studentId: String,
    val grade: String?,
    val parentId: Int?,
    val createdAt: String?
)
```

#### LoginResponse.kt
```kotlin
data class LoginResponse(
    val token: String,
    val user: User
)
```

### 2. Create API Service Interface

#### ApiService.kt
```kotlin
import retrofit2.http.*

interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
    
    @GET("auth/me")
    suspend fun getCurrentUser(): Response<UserResponse>
    
    @GET("students")
    suspend fun getAllStudents(): Response<List<Student>>
    
    @GET("students/{id}")
    suspend fun getStudentById(@Path("id") id: Int): Response<Student>
    
    @GET("students/parent/my-students")
    suspend fun getMyStudents(): Response<List<Student>>
    
    @POST("students")
    suspend fun createStudent(@Body student: Student): Response<Student>
    
    @PUT("students/{id}")
    suspend fun updateStudent(@Path("id") id: Int, @Body student: Student): Response<Student>
    
    @DELETE("students/{id}")
    suspend fun deleteStudent(@Path("id") id: Int): Response<Unit>
    
    // Add similar methods for Parents and Staff
}
```

### 3. Create Retrofit Client

#### RetrofitClient.kt
```kotlin
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:3000/api/" // Emulator
    // private const val BASE_URL = "http://192.168.1.100:3000/api/" // Physical device (replace with your IP)
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .addInterceptor(TokenInterceptor()) // Add token to requests
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val apiService: ApiService = retrofit.create(ApiService::class.java)
}
```

### 4. Create Token Interceptor

#### TokenInterceptor.kt
```kotlin
import okhttp3.Interceptor
import okhttp3.Response

class TokenInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = AuthPreferences.getToken() // Get stored token
        
        val newRequest = if (token != null) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }
        
        return chain.proceed(newRequest)
    }
}
```

### 5. Create Auth Preferences Manager

#### AuthPreferences.kt
```kotlin
import android.content.Context
import android.content.SharedPreferences

object AuthPreferences {
    private const val PREFS_NAME = "student_card_prefs"
    private const val KEY_TOKEN = "auth_token"
    private const val KEY_USER_ID = "user_id"
    private const val KEY_USER_ROLE = "user_role"
    private const val KEY_USER_EMAIL = "user_email"
    
    private fun getPreferences(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    fun saveToken(context: Context, token: String) {
        getPreferences(context).edit().putString(KEY_TOKEN, token).apply()
    }
    
    fun getToken(context: Context? = null): String? {
        // For interceptor, you might need a static context
        // Better to use singleton or dependency injection
        return null // Implement based on your architecture
    }
    
    fun saveUser(context: Context, userId: Int, email: String, role: String) {
        getPreferences(context).edit().apply {
            putInt(KEY_USER_ID, userId)
            putString(KEY_USER_EMAIL, email)
            putString(KEY_USER_ROLE, role)
            apply()
        }
    }
    
    fun clearAuth(context: Context) {
        getPreferences(context).edit().clear().apply()
    }
    
    fun isLoggedIn(context: Context): Boolean {
        return getPreferences(context).getString(KEY_TOKEN, null) != null
    }
}
```

### 6. Create Repository Layer

#### AuthRepository.kt
```kotlin
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData

class AuthRepository(private val apiService: ApiService) {
    suspend fun login(email: String, password: String): Result<LoginResponse> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Login failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCurrentUser(): Result<User> {
        return try {
            val response = apiService.getCurrentUser()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.user)
            } else {
                Result.failure(Exception("Failed to get user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

### 7. Create ViewModel

#### LoginViewModel.kt
```kotlin
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch

class LoginViewModel(private val authRepository: AuthRepository) : ViewModel() {
    private val _loginResult = MutableLiveData<Result<LoginResponse>>()
    val loginResult: LiveData<Result<LoginResponse>> = _loginResult
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = authRepository.login(email, password)
            _loginResult.value = result
            _isLoading.value = false
        }
    }
}
```

### 8. Create Login Activity

#### LoginActivity.kt
```kotlin
import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Observer

class LoginActivity : AppCompatActivity() {
    private val viewModel: LoginViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        
        // Check if already logged in
        if (AuthPreferences.isLoggedIn(this)) {
            navigateToDashboard()
            return
        }
        
        setupObservers()
        setupLoginButton()
    }
    
    private fun setupObservers() {
        viewModel.loginResult.observe(this, Observer { result ->
            result.onSuccess { loginResponse ->
                // Save token and user data
                AuthPreferences.saveToken(this, loginResponse.token)
                AuthPreferences.saveUser(
                    this,
                    loginResponse.user.id,
                    loginResponse.user.email,
                    loginResponse.user.role
                )
                navigateToDashboard()
            }.onFailure { error ->
                // Show error message
                showError(error.message ?: "Login failed")
            }
        })
        
        viewModel.isLoading.observe(this, Observer { isLoading ->
            // Update UI to show/hide loading indicator
        })
    }
    
    private fun setupLoginButton() {
        // Set up login button click listener
        // Get email and password from EditTexts
        // Call viewModel.login(email, password)
    }
    
    private fun navigateToDashboard() {
        val role = AuthPreferences.getUserRole(this)
        val intent = when (role) {
            "admin" -> Intent(this, AdminDashboardActivity::class.java)
            "parent" -> Intent(this, ParentDashboardActivity::class.java)
            "staff" -> Intent(this, StaffDashboardActivity::class.java)
            else -> Intent(this, MainActivity::class.java)
        }
        startActivity(intent)
        finish()
    }
    
    private fun showError(message: String) {
        // Show error toast or dialog
    }
}
```

---

## 🎨 UI/UX Guidelines

### Material Design
- Use Material Design 3 components
- Follow Android Design Guidelines
- Implement dark theme support
- Use responsive layouts for different screen sizes

### Key Screens

1. **Login Screen**
   - Email input field
   - Password input field
   - Login button
   - Registration link (for parents/staff)
   - Role selector (if needed)

2. **Admin Dashboard**
   - Navigation drawer or bottom navigation
   - Cards/buttons for Students, Parents, Staff management
   - Quick stats (if available)

3. **Student List (Admin)**
   - RecyclerView with student cards
   - Search functionality
   - Add student FAB
   - Swipe to delete/edit

4. **Parent Dashboard**
   - List of children (students)
   - Student information cards
   - Profile settings

5. **Student Detail View**
   - Student information display
   - Edit button (for admin)
   - QR code display (if implemented)

---

## 🔐 Security Considerations

1. **Token Storage**
   - Use EncryptedSharedPreferences or DataStore for sensitive data
   - Never store tokens in plain text
   - Implement token refresh mechanism

2. **Network Security**
   - Use HTTPS in production
   - Implement certificate pinning for production
   - Validate server responses

3. **Input Validation**
   - Validate all user inputs
   - Sanitize data before sending to API
   - Show appropriate error messages

4. **Authentication**
   - Implement auto-logout on token expiration
   - Clear sensitive data on logout
   - Implement biometric authentication (optional)

---

## 🧪 Testing

### Unit Tests
- Test ViewModels
- Test Repositories
- Test Utility functions

### Integration Tests
- Test API integration
- Test authentication flow
- Test data persistence

### UI Tests
- Test login flow
- Test navigation
- Test form validation

---

## 🚀 Deployment

### Build Variants
- **Debug**: For development and testing
- **Release**: For production

### Signing Configuration
1. Generate keystore for release builds
2. Configure signing in `build.gradle.kts`
3. Keep keystore secure and backed up

### ProGuard Rules
- Add rules for Retrofit, Gson, and other libraries
- Test release builds thoroughly

---

## 📝 Development Checklist

### Phase 1: Setup & Authentication
- [ ] Create Android project
- [ ] Setup dependencies
- [ ] Create data models
- [ ] Setup Retrofit client
- [ ] Implement login functionality
- [ ] Implement token storage
- [ ] Test authentication flow

### Phase 2: Admin Features
- [ ] Admin dashboard
- [ ] Student management (CRUD)
- [ ] Parent management (CRUD)
- [ ] Staff management (CRUD)
- [ ] Navigation and routing

### Phase 3: Parent Features
- [ ] Parent dashboard
- [ ] View student information
- [ ] Profile management
- [ ] Student list view

### Phase 4: Staff Features
- [ ] Staff registration
- [ ] Staff dashboard (if applicable)
- [ ] Staff-specific features

### Phase 5: Polish & Testing
- [ ] UI/UX improvements
- [ ] Error handling
- [ ] Loading states
- [ ] Offline support (optional)
- [ ] Testing
- [ ] Performance optimization

---

## 🐛 Troubleshooting

### Common Issues

1. **Network Error on Emulator**
   - Use `10.0.2.2` instead of `localhost`
   - Check if backend server is running
   - Verify API base URL

2. **CORS Issues**
   - Backend should allow Android app origin
   - Check backend CORS configuration

3. **Token Not Working**
   - Verify token is being saved correctly
   - Check token format in API requests
   - Verify token expiration

4. **Build Errors**
   - Sync Gradle files
   - Clean and rebuild project
   - Check dependency versions

---

## 📚 Additional Resources

- [Android Developers Documentation](https://developer.android.com)
- [Kotlin Documentation](https://kotlinlang.org/docs/home.html)
- [Retrofit Documentation](https://square.github.io/retrofit/)
- [Material Design Guidelines](https://material.io/design)
- [Android Architecture Components](https://developer.android.com/topic/architecture)

---

## 🔗 Backend Connection

### For Android Emulator
- Base URL: `http://10.0.2.2:3000/api`

### For Physical Device
1. Find your computer's local IP address:
   ```bash
   # Linux/Mac
   ifconfig
   # Windows
   ipconfig
   ```
2. Use: `http://YOUR_LOCAL_IP:3000/api`
3. Ensure phone and computer are on the same network
4. Ensure backend server allows connections from your network

### For Production
- Use your production API URL
- Ensure HTTPS is enabled
- Implement proper SSL certificate handling

---

## 📞 Support

For issues or questions:
1. Check the backend API documentation
2. Review API endpoints in `backend/server.js`
3. Test API endpoints using Postman or similar tools
4. Check Android Studio logs for detailed error messages

---

## ✅ Next Steps

1. **Start with Setup**: Create the Android project and add dependencies
2. **Implement Authentication**: Get login working first
3. **Build Core Features**: Start with admin dashboard
4. **Test Thoroughly**: Test each feature before moving to the next
5. **Iterate and Improve**: Refine UI/UX based on feedback

---

**Good luck with your Android app development! 🚀**

