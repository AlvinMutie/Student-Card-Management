/* app-api.js — API-based admin frontend logic
   - Uses backend API instead of LocalStorage
   - All data fetched from and saved to backend
*/

(function(){
  // Ensure API client is loaded
  if (typeof studentsAPI === 'undefined' || typeof parentsAPI === 'undefined' || typeof staffAPI === 'undefined') {
    console.error('API client not loaded. Make sure shared/api-client.js is included before app-api.js');
    return;
  }

  /* ------------------ Helper Functions ------------------ */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatCurrency(amount) {
    if (amount === undefined || amount === null) return 'KSh 0';
    return 'KSh ' + Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getPaymentStatus(feeBalance) {
    if (feeBalance === 0 || feeBalance === null) return { text: 'Paid', class: 'status-paid' };
    if (feeBalance > 0) return { text: 'Pending', class: 'status-pending' };
    return { text: 'Overdue', class: 'status-overdue' };
  }

  /* ------------------ Auth helpers ------------------ */
  window.ensureAuthRedirect = function(){
    try {
      const adminToken = localStorage.getItem('sv_admin_token');
      const authToken = localStorage.getItem('sv_auth_token');
      if(!adminToken && !authToken){
        location.href = '../public/index.html';
      }
    } catch(e) {
      console.error('Error checking authentication:', e);
      location.href = '../public/index.html';
    }
  };

  window.doLogout = function(){
    try {
      localStorage.removeItem('sv_admin_token');
      localStorage.removeItem('sv_auth_token');
      localStorage.removeItem('sv_admin_email');
      localStorage.removeItem('sv_user_data');
      location.href = '../public/index.html';
    } catch(e) {
      console.error('Error during logout:', e);
      alert('Error during logout. Please clear your browser cache.');
    }
  };

  /* ------------------ Page: Dashboard ------------------ */
  window.initDashboard = async function(){
    try {
      // Fetch counts from API
      const [students, parents, staff] = await Promise.all([
        studentsAPI.getAll().catch(() => []),
        parentsAPI.getAll().catch(() => []),
        staffAPI.getAll().catch(() => [])
      ]);

      const studentsCount = students.length || 0;
      const parentsCount = parents.length || 0;
      const staffCount = staff.length || 0;
      const pendingApprovals = staff.filter(s => !s.approved).length || 0;

      const elParents = document.getElementById('statParents');
      if(elParents) elParents.textContent = parentsCount;
      
      const elStaff = document.getElementById('statStaff');
      if(elStaff) elStaff.textContent = staffCount;
      
      const elStudents = document.getElementById('statStudents');
      if(elStudents) elStudents.textContent = studentsCount;
      
      const elPending = document.getElementById('statPending');
      if(elPending) elPending.textContent = pendingApprovals;

      const recentList = document.getElementById('recentList');
      if(recentList){
        recentList.innerHTML = '';
        const recent = [
          `Total ${studentsCount} students enrolled`,
          `${parentsCount} parent accounts active`,
          `${staffCount} staff members registered`
        ];
        recent.slice(-8).reverse().forEach(r => {
          const li = document.createElement('li');
          li.textContent = r;
          recentList.appendChild(li);
        });
      }

      const adminInfo = document.getElementById('adminInfo');
      if(adminInfo) {
        try {
          adminInfo.textContent = `Signed in as ${localStorage.getItem('sv_admin_email') || 'admin'}`;
        } catch(e) {
          adminInfo.textContent = 'Signed in as admin';
        }
      }
    } catch(e) {
      console.error('Error initializing dashboard:', e);
    }
  };

  /* ------------------ Page: Students ------------------ */
  window.initStudentsPage = async function(){
    try {
      const searchInput = document.getElementById('studentSearchInput');
      const addBtn = document.getElementById('addStudentBtn');
      const refreshBtn = document.getElementById('refreshBtn');
      const tbody = document.querySelector('#studentsTable tbody');
      
      if(!tbody) {
        console.error('Students table body not found');
        return;
      }

      let allStudents = [];

      async function loadStudents() {
        try {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">Loading students...</td></tr>';
          allStudents = await studentsAPI.getAll();
          render(searchInput ? searchInput.value.trim() : '');
        } catch(error) {
          console.error('Error loading students:', error);
          tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:red;">Error loading students: ${error.message}</td></tr>`;
        }
      }

      function render(searchQuery = ''){
        tbody.innerHTML = '';
        
        const filtered = allStudents.filter(s => {
          if(!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (s.name||'').toLowerCase().includes(q) ||
                 (s.adm||'').toLowerCase().includes(q) ||
                 (s.class||'').toLowerCase().includes(q) ||
                 (s.parent_name||'').toLowerCase().includes(q);
        });

        if(filtered.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">No students found</td></tr>';
          return;
        }

        filtered.forEach(s => {
          const tr = document.createElement('tr');
          const paymentStatus = getPaymentStatus(s.fee_balance);
          const photoUrl = s.photo_url || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTEyLDEyQTUuNSw1LjUgMCwwLDAgMTcuNSw2LjVBNS41LDUuNSAwLDAsMCAxMiwxQTUuNSw1LjUgMCwwLDAgNi41LDYuNUE1LjUsNS41IDAsMCwwIDEyLDEyTTEyLDE0QzcuNTgsMTQgNCwxNS43OSA0LDE4VjIwSDIwVjE4QzIwLDE1Ljc5IDE2LjQyLDE0IDEyLDE0WiIvPjwvc3ZnPg==';
          
          tr.innerHTML = `
            <td>
              <img src="${escapeHtml(photoUrl)}" alt="Student" class="student-photo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTEyLDEyQTUuNSw1LjUgMCwwLDAgMTcuNSw2LjVBNS41LDUuNSAwLDAsMCAxMiwxQTUuNSw1LjUgMCwwLDAgNi41LDYuNUE1LjUsNS41IDAsMCwwIDEyLDEyTTEyLDE0QzcuNTgsMTQgNCwxNS43OSA0LDE4VjIwSDIwVjE4QzIwLDE1Ljc5IDE2LjQyLDE0IDEyLDE0WiIvPjwvc3ZnPg=='">
            </td>
            <td>${escapeHtml(s.adm || '—')}</td>
            <td>
              <div class="student-name-cell">
                <img src="${escapeHtml(photoUrl)}" alt="Student" class="student-photo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTEyLDEyQTUuNSw1LjUgMCwwLDAgMTcuNSw2LjVBNS41LDUuNSAwLDAsMCAxMiwxQTUuNSw1LjUgMCwwLDAgNi41LDYuNUE1LjUsNS41IDAsMCwwIDEyLDEyTTEyLDE0QzcuNTgsMTQgNCwxNS43OSA0LDE4VjIwSDIwVjE4QzIwLDE1Ljc5IDE2LjQyLDE0IDEyLDE0WiIvPjwvc3ZnPg=='">
                ${escapeHtml(s.name || '—')}
              </div>
            </td>
            <td>${escapeHtml(s.class || '—')}</td>
            <td>
              <div class="guardian-tags">
                <span class="guardian-tag">${escapeHtml(s.parent_name || '—')}</span>
              </div>
            </td>
            <td class="fee-balance">${formatCurrency(s.fee_balance)}</td>
            <td><span class="payment-status ${paymentStatus.class}">${paymentStatus.text}</span></td>
            <td>
              <div class="action-buttons-cell">
                <button class="action-btn upload-btn" data-student-id="${s.id}" title="Add/Change Photo">
                  <svg class="action-icon" viewBox="0 0 24 24">
                    <path d="M4,5H17V12H19V5C19,3.89 18.1,3 17,3H4C2.9,3 2,3.9 2,5V19C2,20.1 2.9,21 4,21H12V19H4V5M14,18V20H22V18H14Z" />
                  </svg>
                </button>
                <button class="action-btn qr-btn" data-student-id="${s.id}" title="QR Code" onclick="window.location.href='qr-generator.html?student=${s.id}'">
                  <svg class="action-icon" viewBox="0 0 24 24">
                    <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H11V13H9V11M15,11H17V13H19V11H21V13H19V15H21V19H19V21H17V19H13V21H11V17H15V15H17V13H15V11M19,19V15H17V19H19M15,3H21V9H15V3M17,5V7H19V5H17M3,3H9V9H3V3M5,5V7H7V5H5M3,15H9V21H3V15M5,17V19H7V17H5Z" />
                  </svg>
                </button>
                <button class="action-btn edit-btn" data-student-id="${s.id}" title="Edit">
                  <svg class="action-icon" viewBox="0 0 24 24">
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                  </svg>
                </button>
                <button class="action-btn delete-btn" data-student-id="${s.id}" title="Delete">
                  <svg class="action-icon" viewBox="0 0 24 24">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                </button>
              </div>
            </td>
          `;
          tbody.appendChild(tr);
        });

        // Add event listeners
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', async function() {
            const studentId = this.getAttribute('data-student-id');
            const student = allStudents.find(s => s.id == studentId);
            if(!confirm(`Delete student ${student ? student.name : studentId}?`)) return;
            
            try {
              await studentsAPI.delete(studentId);
              await loadStudents();
              if(typeof initDashboard === 'function') initDashboard();
            } catch(error) {
              alert('Error deleting student: ' + error.message);
            }
          });
        });

        tbody.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const studentId = this.getAttribute('data-student-id');
            alert('Edit functionality coming soon. Student ID: ' + studentId);
          });
        });
      }

      // Wire up events
      if(refreshBtn) refreshBtn.addEventListener('click', loadStudents);
      if(searchInput) searchInput.addEventListener('input', () => render(searchInput.value.trim()));
      if(addBtn) {
        addBtn.addEventListener('click', function() {
          alert('Add student functionality coming soon. Please use the backend API directly for now.');
        });
      }

      // Initial load
      await loadStudents();
    } catch(e) {
      console.error('Error initializing students page:', e);
      alert('Error loading students page. Please refresh.');
    }
  };

  /* ------------------ Page: Parents ------------------ */
  window.initParentsPage = async function(){
    try {
      const searchInput = document.getElementById('parentSearchInput');
      const addBtn = document.getElementById('addParentBtn');
      const refreshBtn = document.getElementById('refreshBtn');
      const tbody = document.querySelector('#parentsTable tbody');
      
      if(!tbody) {
        console.error('Parents table body not found');
        return;
      }

      let allParents = [];
      let allStudents = [];

      async function loadData() {
        try {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">Loading parents...</td></tr>';
          [allParents, allStudents] = await Promise.all([
            parentsAPI.getAll(),
            studentsAPI.getAll()
          ]);
          render(searchInput ? searchInput.value.trim() : '');
        } catch(error) {
          console.error('Error loading parents:', error);
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:red;">Error loading parents: ${error.message}</td></tr>`;
        }
      }

      function render(searchQuery = ''){
        tbody.innerHTML = '';
        
        const filtered = allParents.filter(p => {
          if(!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (p.name||'').toLowerCase().includes(q) ||
                 (p.email||'').toLowerCase().includes(q) ||
                 (p.phone||'').toLowerCase().includes(q);
        });

        if(filtered.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">No parents found</td></tr>';
          return;
        }

        filtered.forEach(p => {
          const linkedStudents = allStudents.filter(s => s.parent_id === p.id).map(s => s.name);
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${escapeHtml(p.id || '—')}</td>
            <td>${escapeHtml(p.name || '—')}</td>
            <td>${escapeHtml(p.email || '—')}</td>
            <td>${escapeHtml(p.phone || '—')}</td>
            <td>—</td>
            <td>${escapeHtml(linkedStudents.join(', ') || '—')}</td>
            <td>
              <button class="btn ghost btn-edit" data-id="${p.id}">Edit</button>
              <button class="btn ghost btn-del" data-id="${p.id}">Delete</button>
            </td>
          `;
          tbody.appendChild(tr);
        });

        // Add event listeners
        tbody.querySelectorAll('.btn-del').forEach(btn => {
          btn.addEventListener('click', async function() {
            const parentId = this.getAttribute('data-id');
            const parent = allParents.find(p => p.id == parentId);
            const linkedStudents = allStudents.filter(s => s.parent_id == parentId);
            
            if(linkedStudents.length > 0) {
              if(!confirm(`This parent is linked to ${linkedStudents.length} student(s). Deleting will remove the link. Continue?`)) return;
            }
            
            if(!confirm(`Delete parent ${parent ? parent.name : parentId}?`)) return;
            
            try {
              await parentsAPI.delete(parentId);
              await loadData();
              if(typeof initDashboard === 'function') initDashboard();
            } catch(error) {
              alert('Error deleting parent: ' + error.message);
            }
          });
        });

        tbody.querySelectorAll('.btn-edit').forEach(btn => {
          btn.addEventListener('click', function() {
            const parentId = this.getAttribute('data-id');
            alert('Edit functionality coming soon. Parent ID: ' + parentId);
          });
        });
      }

      // Wire up events
      if(refreshBtn) refreshBtn.addEventListener('click', loadData);
      if(searchInput) searchInput.addEventListener('input', () => render(searchInput.value.trim()));
      if(addBtn) {
        addBtn.addEventListener('click', function() {
          alert('Add parent functionality coming soon. Please use the backend API directly for now.');
        });
      }

      // Initial load
      await loadData();
    } catch(e) {
      console.error('Error initializing parents page:', e);
      alert('Error loading parents page. Please refresh.');
    }
  };

  /* ------------------ Page: Staff ------------------ */
  window.initStaffPage = async function(){
    try {
      const searchInput = document.getElementById('staffSearchInput');
      const addBtn = document.getElementById('addStaffBtn');
      const refreshBtn = document.getElementById('refreshBtn');
      const tbody = document.querySelector('#staffTable tbody');
      
      if(!tbody) {
        console.error('Staff table body not found');
        return;
      }

      let allStaff = [];
      let allStudents = [];

      async function loadData() {
        try {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">Loading staff...</td></tr>';
          [allStaff, allStudents] = await Promise.all([
            staffAPI.getAll(),
            studentsAPI.getAll()
          ]);
          render(searchInput ? searchInput.value.trim() : '');
        } catch(error) {
          console.error('Error loading staff:', error);
          tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:red;">Error loading staff: ${error.message}</td></tr>`;
        }
      }

      function render(searchQuery = ''){
        tbody.innerHTML = '';
        
        const filtered = allStaff.filter(s => {
          if(!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (s.name||'').toLowerCase().includes(q) ||
                 (s.staff_no||'').toLowerCase().includes(q);
        });

        if(filtered.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">No staff found</td></tr>';
          return;
        }

        filtered.forEach(s => {
          // Note: Students don't have classTeacherId in current schema, so we can't link them yet
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${escapeHtml(s.id || '—')}</td>
            <td>${escapeHtml(s.name || '—')}</td>
            <td>${escapeHtml(s.staff_no || '—')}</td>
            <td>—</td>
            <td>${escapeHtml(s.department || '—')}</td>
            <td>${s.approved ? 'Approved' : '<strong class="muted">Pending</strong>'}</td>
            <td>—</td>
            <td>
              <button class="btn ghost btn-edit" data-id="${s.id}">Edit</button>
              ${s.approved ? `<button class="btn ghost btn-revoke" data-id="${s.id}">Revoke</button>` : `<button class="btn btn-approve" data-id="${s.id}">Approve</button>`}
              <button class="btn ghost btn-del" data-id="${s.id}">Delete</button>
            </td>
          `;
          tbody.appendChild(tr);
        });

        // Add event listeners
        tbody.querySelectorAll('.btn-del').forEach(btn => {
          btn.addEventListener('click', async function() {
            const staffId = this.getAttribute('data-id');
            const staff = allStaff.find(s => s.id == staffId);
            if(!confirm(`Delete staff ${staff ? staff.name : staffId}?`)) return;
            
            try {
              await staffAPI.delete(staffId);
              await loadData();
              if(typeof initDashboard === 'function') initDashboard();
            } catch(error) {
              alert('Error deleting staff: ' + error.message);
            }
          });
        });

        tbody.querySelectorAll('.btn-edit').forEach(btn => {
          btn.addEventListener('click', function() {
            const staffId = this.getAttribute('data-id');
            alert('Edit functionality coming soon. Staff ID: ' + staffId);
          });
        });

        tbody.querySelectorAll('.btn-approve, .btn-revoke').forEach(btn => {
          btn.addEventListener('click', async function() {
            const staffId = this.getAttribute('data-id');
            const staff = allStaff.find(s => s.id == staffId);
            const newApprovedStatus = !staff.approved;
            
            try {
              await staffAPI.update(staffId, { approved: newApprovedStatus });
              await loadData();
              if(typeof initDashboard === 'function') initDashboard();
            } catch(error) {
              alert('Error updating staff: ' + error.message);
            }
          });
        });
      }

      // Wire up events
      if(refreshBtn) refreshBtn.addEventListener('click', loadData);
      if(searchInput) searchInput.addEventListener('input', () => render(searchInput.value.trim()));
      if(addBtn) {
        addBtn.addEventListener('click', function() {
          alert('Add staff functionality coming soon. Please use the backend API directly for now.');
        });
      }

      // Initial load
      await loadData();
    } catch(e) {
      console.error('Error initializing staff page:', e);
      alert('Error loading staff page. Please refresh.');
    }
  };

})();

