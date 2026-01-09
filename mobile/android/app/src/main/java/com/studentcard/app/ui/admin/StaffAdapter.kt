package com.studentcard.app.ui.admin

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.studentcard.app.R
import com.studentcard.app.data.models.Staff

class StaffAdapter(
    private val onItemClick: (Staff) -> Unit,
    private val onItemDelete: (Staff) -> Unit,
    private val onItemEdit: (Staff) -> Unit
) : ListAdapter<Staff, StaffAdapter.StaffViewHolder>(StaffDiffCallback()) {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StaffViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_staff, parent, false)
        return StaffViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: StaffViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
    
    inner class StaffViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val nameText: TextView = itemView.findViewById(R.id.nameText)
        private val emailText: TextView = itemView.findViewById(R.id.emailText)
        private val roleText: TextView = itemView.findViewById(R.id.roleText)
        
        fun bind(staff: Staff) {
            nameText.text = staff.name
            emailText.text = staff.email
            roleText.text = "Role: ${staff.role ?: "N/A"}"
            
            itemView.setOnClickListener {
                onItemClick(staff)
            }
        }
    }
    
    class StaffDiffCallback : DiffUtil.ItemCallback<Staff>() {
        override fun areItemsTheSame(oldItem: Staff, newItem: Staff): Boolean {
            return oldItem.id == newItem.id
        }
        
        override fun areContentsTheSame(oldItem: Staff, newItem: Staff): Boolean {
            return oldItem == newItem
        }
    }
}

