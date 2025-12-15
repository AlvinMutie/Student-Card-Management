package com.studentcard.app.ui.qr

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import com.studentcard.app.ui.qr.QRScannerViewModelFactory
import com.google.zxing.ResultPoint
import com.journeyapps.barcodescanner.BarcodeCallback
import com.journeyapps.barcodescanner.BarcodeResult
import com.journeyapps.barcodescanner.DecoratedBarcodeView
import com.studentcard.app.data.api.RetrofitClient
import com.studentcard.app.data.local.preferences.AuthPreferences
import com.studentcard.app.data.repository.QRRepository
import com.studentcard.app.databinding.ActivityQrScannerBinding
import com.studentcard.app.utils.Constants

class QRScannerActivity : AppCompatActivity() {
    private lateinit var binding: ActivityQrScannerBinding
    private lateinit var viewModel: QRScannerViewModel
    private var isScanning = false
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityQrScannerBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Check authentication
        if (!AuthPreferences.isLoggedIn()) {
            finish()
            return
        }
        
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Scan QR Code"
        
        // Initialize ViewModel
        val qrRepository = QRRepository(RetrofitClient.apiService)
        val factory = QRScannerViewModelFactory(qrRepository)
        viewModel = ViewModelProvider(this, factory)[QRScannerViewModel::class.java]
        
        // Initialize barcode scanner
        binding.barcodeScanner.barcodeView.decoderFactory = com.journeyapps.barcodescanner.DefaultDecoderFactory(listOf(com.google.zxing.BarcodeFormat.QR_CODE))
        binding.barcodeScanner.initializeFromIntent(intent)
        
        setupObservers()
        requestCameraPermission()
    }
    
    private fun setupObservers() {
        viewModel.qrScanResult.observe(this) { result ->
            result.onSuccess { response ->
                if (response.success && response.student != null) {
                    val student = response.student
                    val message = "Student: ${student.name}\nID: ${student.studentId}\nGrade: ${student.grade ?: "N/A"}"
                    Toast.makeText(this, message, Toast.LENGTH_LONG).show()
                    
                    // Show student info dialog or navigate to details
                    showStudentInfo(student.name, student.studentId, student.grade)
                } else {
                    Toast.makeText(this, response.message, Toast.LENGTH_SHORT).show()
                }
                // Resume scanning after showing result
                resumeScanning()
            }.onFailure { error ->
                Toast.makeText(this, "Error: ${error.message}", Toast.LENGTH_SHORT).show()
                resumeScanning()
            }
        }
        
        viewModel.isLoading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading == true) android.view.View.VISIBLE else android.view.View.GONE
        }
    }
    
    private fun requestCameraPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.CAMERA),
                Constants.REQUEST_CAMERA_PERMISSION
            )
        } else {
            startScanning()
        }
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == Constants.REQUEST_CAMERA_PERMISSION) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startScanning()
            } else {
                Toast.makeText(this, "Camera permission is required to scan QR codes", Toast.LENGTH_LONG).show()
                finish()
            }
        }
    }
    
    private fun startScanning() {
        if (!isScanning) {
            binding.barcodeScanner.resume()
            isScanning = true
            
            binding.barcodeScanner.decodeContinuous(object : BarcodeCallback {
                override fun barcodeResult(result: BarcodeResult?) {
                    if (result != null && viewModel.isLoading.value != true) {
                        pauseScanning()
                        val qrData = result.text
                        val scannedBy = AuthPreferences.getUserId()
                        
                        if (scannedBy != -1) {
                            viewModel.scanQRCode(qrData, scannedBy)
                        } else {
                            Toast.makeText(this@QRScannerActivity, "User not authenticated", Toast.LENGTH_SHORT).show()
                            resumeScanning()
                        }
                    }
                }
                
                override fun possibleResultPoints(resultPoints: MutableList<ResultPoint>?) {
                    // Optional: Handle possible result points
                }
            })
        }
    }
    
    private fun pauseScanning() {
        if (isScanning) {
            binding.barcodeScanner.pause()
            isScanning = false
        }
    }
    
    private fun resumeScanning() {
        if (!isScanning) {
            binding.barcodeScanner.resume()
            isScanning = true
        }
    }
    
    private fun showStudentInfo(name: String, studentId: String, grade: String?) {
        val info = "Name: $name\nStudent ID: $studentId\nGrade: ${grade ?: "N/A"}"
        android.app.AlertDialog.Builder(this)
            .setTitle("Student Information")
            .setMessage(info)
            .setPositiveButton("OK") { _, _ -> }
            .show()
    }
    
    override fun onResume() {
        super.onResume()
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            == PackageManager.PERMISSION_GRANTED
        ) {
            startScanning()
        }
    }
    
    override fun onPause() {
        super.onPause()
        pauseScanning()
    }
    
    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}

