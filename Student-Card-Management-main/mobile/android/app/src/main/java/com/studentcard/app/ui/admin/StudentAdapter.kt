package com.studentcard.app.ui.admin

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.studentcard.app.R
import com.studentcard.app.data.models.Student

class StudentAdapter(
    private val onItemClick: (Student) -> Unit,
    private val onItemDelete: (Student) -> Unit,
    private val onItemEdit: (Student) -> Unit
) : ListAdapter<Student, StudentAdapter.StudentViewHolder>(StudentDiffCallback()) {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StudentViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_student, parent, false)
        return StudentViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: StudentViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
    
    inner class StudentViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val nameText: TextView = itemView.findViewById(R.id.nameText)
        private val studentIdText: TextView = itemView.findViewById(R.id.studentIdText)
        private val gradeText: TextView = itemView.findViewById(R.id.gradeText)
        private val emailText: TextView = itemView.findViewById(R.id.emailText)
        
        fun bind(student: Student) {
            nameText.text = student.name
            studentIdText.text = "ID: ${student.studentId}"
            gradeText.text = "Grade: ${student.grade ?: "N/A"}"
            emailText.text = student.email ?: "No email"
            
            itemView.setOnClickListener {
                onItemClick(student)
            }
        }
    }
    
    class StudentDiffCallback : DiffUtil.ItemCallback<Student>() {
        override fun areItemsTheSame(oldItem: Student, newItem: Student): Boolean {
            return oldItem.id == newItem.id
        }
        
        override fun areContentsTheSame(oldItem: Student, newItem: Student): Boolean {
            return oldItem == newItem
        }
    }
}

