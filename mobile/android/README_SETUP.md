# Android Project Setup Instructions

## 🚀 Quick Start

This folder contains a pre-configured Android Studio project structure for the Student Card Management app.

## 📋 Prerequisites

1. **Android Studio** (Hedgehog or later recommended)
2. **JDK 17** or later
3. **Android SDK** (API 24 minimum, API 34 target)

## 🔧 Setup Steps

### 1. Open Project in Android Studio

1. Launch **Android Studio**
2. Click **File → Open**
3. Navigate to this folder (`mobile/android`)
4. Select the folder and click **OK**
5. Android Studio will detect the project and sync Gradle files

### 2. Wait for Gradle Sync

- Android Studio will automatically download Gradle wrapper
- It will sync all dependencies
- This may take a few minutes on first open
- Make sure you have an active internet connection

### 3. Install Missing SDK Components (if needed)

If prompted, install:
- Android SDK Platform 34
- Android SDK Build-Tools
- Android Emulator (if you plan to test on emulator)

### 4. Configure Project Settings

1. Go to **File → Project Structure**
2. Verify:
   - **SDK Location**: Points to your Android SDK
   - **JDK Location**: Points to JDK 17 or later
   - **Gradle Version**: 8.2
   - **Android Gradle Plugin**: 8.2.0

### 5. Build the Project

1. Click **Build → Make Project** (or press `Ctrl+F9` / `Cmd+F9`)
2. Wait for the build to complete
3. Fix any errors if they appear

### 6. Run the App

1. Create an Android Virtual Device (AVD) if needed:
   - **Tools → Device Manager → Create Device**
   - Select a device (e.g., Pixel 5)
   - Select a system image (API 34 recommended)
   - Click **Finish**
2. Click **Run → Run 'app'** (or press `Shift+F10` / `Ctrl+R`)

## 📁 Project Structure

```
app/
├── src/
│   ├── main/
│   │   ├── java/com/studentcard/app/
│   │   │   └── MainActivity.kt
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   ├── values/
│   │   │   └── xml/
│   │   └── AndroidManifest.xml
│   └── test/
└── build.gradle.kts
```

## 🔗 Next Steps

1. **Review the Development Guide**: Read `ANDROID_APP_DEVELOPMENT_GUIDE.md` for detailed implementation instructions
2. **Set up API Connection**: Update the base URL in `RetrofitClient.kt` (to be created)
3. **Implement Features**: Start with authentication, then move to other features
4. **Test on Device**: Test on a physical device or emulator

## 🐛 Troubleshooting

### Gradle Sync Failed

**Solution:**
1. Check internet connection
2. Go to **File → Invalidate Caches → Invalidate and Restart**
3. Try **File → Sync Project with Gradle Files**

### Build Errors

**Solution:**
1. Clean project: **Build → Clean Project**
2. Rebuild: **Build → Rebuild Project**
3. Check SDK versions in `build.gradle.kts`

### SDK Not Found

**Solution:**
1. Go to **File → Project Structure → SDK Location**
2. Set correct Android SDK path
3. Install required SDK components via **Tools → SDK Manager**

### Kotlin Version Mismatch

**Solution:**
1. Update Kotlin version in `build.gradle.kts` if needed
2. Sync project again

## 📚 Resources

- **Development Guide**: See `ANDROID_APP_DEVELOPMENT_GUIDE.md` in the parent directory
- **Android Documentation**: https://developer.android.com
- **Kotlin Documentation**: https://kotlinlang.org/docs/home.html

## ✅ Checklist

- [ ] Android Studio installed
- [ ] Project opened successfully
- [ ] Gradle sync completed
- [ ] Build successful
- [ ] App runs on emulator/device
- [ ] Ready to start development

---

**Ready to code!** Follow the `ANDROID_APP_DEVELOPMENT_GUIDE.md` for implementation details. 🚀

