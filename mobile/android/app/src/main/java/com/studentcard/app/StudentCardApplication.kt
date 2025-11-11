package com.studentcard.app

import android.app.Application
import com.studentcard.app.data.local.preferences.AuthPreferences

class StudentCardApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        AuthPreferences.init(this)
    }
}

