package com.studentcard.app.ui.admin

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.studentcard.app.data.api.RetrofitClient
import com.studentcard.app.data.local.preferences.AuthPreferences
import com.studentcard.app.data.models.Student
import com.studentcard.app.data.models.Staff
import com.studentcard.app.data.repository.StudentRepository
import com.studentcard.app.data.repository.StaffRepository
import com.studentcard.app.databinding.ActivityAdminDashboardBinding
import com.studentcard.app.ui.admin.AdminViewModelFactory
import com.studentcard.app.ui.auth.LoginActivity
import com.studentcard.app.ui.qr.QRScannerActivity

class AdminDashboardActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAdminDashboardBinding
    private lateinit var viewModel: AdminViewModel
    private lateinit var studentAdapter: StudentAdapter
    private lateinit var staffAdapter: StaffAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Check authentication
        if (!AuthPreferences.isLoggedIn() || !AuthPreferences.isAdmin()) {
            navigateToLogin()
            return
        }
        
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Admin Dashboard"
        
        // Initialize ViewModel
        val studentRepository = StudentRepository(RetrofitClient.apiService)
        val staffRepository = StaffRepository(RetrofitClient.apiService)
        val factory = AdminViewModelFactory(studentRepository, staffRepository)
        viewModel = ViewModelProvider(this, factory)[AdminViewModel::class.java]
        
        setupRecyclerViews()
        setupObservers()
        setupViews()
        
        // Load data
        viewModel.loadStudents()
        viewModel.loadStaff()
    }
    
    private fun setupRecyclerViews() {
        // Students RecyclerView
        studentAdapter = StudentAdapter(
            onItemClick = { student -> showStudentDetails(student) },
            onItemDelete = { student -> deleteStudent(student) },
            onItemEdit = { student -> editStudent(student) }
        )
        binding.studentsRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.studentsRecyclerView.adapter = studentAdapter
        
        // Staff RecyclerView
        staffAdapter = StaffAdapter(
            onItemClick = { staff -> showStaffDetails(staff) },
            onItemDelete = { staff -> deleteStaff(staff) },
            onItemEdit = { staff -> editStaff(staff) }
        )
        binding.staffRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.staffRecyclerView.adapter = staffAdapter
    }
    
    private fun setupObservers() {
        viewModel.students.observe(this) { students ->
            studentAdapter.submitList(students)
        }
        
        viewModel.staff.observe(this) { staff ->
            staffAdapter.submitList(staff)
        }
        
        viewModel.studentError.observe(this) { error ->
            error?.let {
                Toast.makeText(this, it, Toast.LENGTH_SHORT).show()
            }
        }
        
        viewModel.staffError.observe(this) { error ->
            error?.let {
                Toast.makeText(this, it, Toast.LENGTH_SHORT).show()
            }
        }
        
        viewModel.isLoadingStudents.observe(this) { isLoading ->
            binding.studentsProgressBar.visibility = if (isLoading) android.view.View.VISIBLE else android.view.View.GONE
        }
        
        viewModel.isLoadingStaff.observe(this) { isLoading ->
            binding.staffProgressBar.visibility = if (isLoading) android.view.View.VISIBLE else android.view.View.GONE
        }
    }
    
    private fun setupViews() {
        binding.welcomeText.text = "Welcome, ${AuthPreferences.getUserName() ?: AuthPreferences.getUserEmail()}"
        
        binding.addStudentButton.setOnClickListener {
            showAddStudentDialog()
        }
        
        binding.addStaffButton.setOnClickListener {
            showAddStaffDialog()
        }
        
        binding.scanQRButton.setOnClickListener {
            val intent = Intent(this, QRScannerActivity::class.java)
            startActivity(intent)
        }
    }
    
    private fun showStudentDetails(student: Student) {
        val message = "Name: ${student.name}\n" +
                "Student ID: ${student.studentId}\n" +
                "Email: ${student.email ?: "N/A"}\n" +
                "Phone: ${student.phone ?: "N/A"}\n" +
                "Grade: ${student.grade ?: "N/A"}"
        
        AlertDialog.Builder(this)
            .setTitle("Student Details")
            .setMessage(message)
            .setPositiveButton("OK", null)
            .show()
    }
    
    private fun showStaffDetails(staff: Staff) {
        val message = "Name: ${staff.name}\n" +
                "Email: ${staff.email}\n" +
                "Phone: ${staff.phone ?: "N/A"}\n" +
                "Role: ${staff.role ?: "N/A"}"
        
        AlertDialog.Builder(this)
            .setTitle("Staff Details")
            .setMessage(message)
            .setPositiveButton("OK", null)
            .show()
    }
    
    private fun deleteStudent(student: Student) {
        AlertDialog.Builder(this)
            .setTitle("Delete Student")
            .setMessage("Are you sure you want to delete ${student.name}?")
            .setPositiveButton("Delete") { _, _ ->
                viewModel.deleteStudent(student.id)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun deleteStaff(staff: Staff) {
        AlertDialog.Builder(this)
            .setTitle("Delete Staff")
            .setMessage("Are you sure you want to delete ${staff.name}?")
            .setPositiveButton("Delete") { _, _ ->
                viewModel.deleteStaff(staff.id)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun editStudent(student: Student) {
        // TODO: Implement edit student dialog
        Toast.makeText(this, "Edit student functionality coming soon", Toast.LENGTH_SHORT).show()
    }
    
    private fun editStaff(staff: Staff) {
        // TODO: Implement edit staff dialog
        Toast.makeText(this, "Edit staff functionality coming soon", Toast.LENGTH_SHORT).show()
    }
    
    private fun showAddStudentDialog() {
        // TODO: Implement add student dialog
        Toast.makeText(this, "Add student functionality coming soon", Toast.LENGTH_SHORT).show()
    }
    
    private fun showAddStaffDialog() {
        // TODO: Implement add staff dialog
        Toast.makeText(this, "Add staff functionality coming soon", Toast.LENGTH_SHORT).show()
    }
    
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(com.studentcard.app.R.menu.menu_main, menu)
        return true
    }
    
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            com.studentcard.app.R.id.action_logout -> {
                logout()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    private fun logout() {
        AuthPreferences.clearAuth()
        navigateToLogin()
    }
    
    private fun navigateToLogin() {
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}

