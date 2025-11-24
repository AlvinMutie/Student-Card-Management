/* app-api.js — API-based admin frontend logic
   - Uses backend API instead of LocalStorage
   - All data fetched from and saved to backend
*/

(function () {
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
  window.ensureAuthRedirect = function () {
    try {
      const adminToken = localStorage.getItem('sv_admin_token');
      const authToken = localStorage.getItem('sv_auth_token');
      if (!adminToken && !authToken) {
        location.href = '../public/landingpage.html';
      }
    } catch (e) {
      console.error('Error checking authentication:', e);
      location.href = '../public/landingpage.html';
    }
  };

  window.doLogout = function () {
    try {
      localStorage.removeItem('sv_admin_token');
      localStorage.removeItem('sv_auth_token');
      localStorage.removeItem('sv_admin_email');
      localStorage.removeItem('sv_user_data');
      // Redirect to the new admin login page
      location.href = '../public/landingpage.html';
    } catch (e) {
      console.error('Error during logout:', e);
      alert('Error during logout. Please clear your browser cache.');
    }
  };

  /* ------------------ Page: Dashboard ------------------ */
  window.initDashboard = async function () {
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
      if (elParents) elParents.textContent = parentsCount;

      const elStaff = document.getElementById('statStaff');
      if (elStaff) elStaff.textContent = staffCount;

      const elStudents = document.getElementById('statStudents');
      if (elStudents) elStudents.textContent = studentsCount;

      const elPending = document.getElementById('statPending');
      if (elPending) elPending.textContent = pendingApprovals;

      const recentList = document.getElementById('recentList');
      if (recentList) {
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
      if (adminInfo) {
        try {
          adminInfo.textContent = `Signed in as ${localStorage.getItem('sv_admin_email') || 'admin'}`;
        } catch (e) {
          adminInfo.textContent = 'Signed in as admin';
        }
      }
    } catch (e) {
      console.error('Error initializing dashboard:', e);
    }
  };

  /* ------------------ Page: Students ------------------ */
  window.initStudentsPage = async function () {
    try {
      const searchInput = document.getElementById('studentSearchInput');
      const addBtn = document.getElementById('addStudentBtn');
      const refreshBtn = document.getElementById('refreshBtn');
      const tbody = document.querySelector('#studentsTable tbody');

      // Modal elements
      const studentModal = document.getElementById('studentModal');
      const studentForm = document.getElementById('studentForm');
      const closeStudentModalBtn = document.getElementById('closeStudentModal');
      const cancelStudentModalBtn = document.getElementById('cancelStudentModal');
      const studentModalTitle = document.getElementById('studentModalTitle');

      if (!tbody) {
        console.error('Students table body not found');
        return;
      }

      let allStudents = [];

      async function loadStudents() {
        try {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;">Loading students...</td></tr>';
          allStudents = await studentsAPI.getAll();
          render(searchInput ? searchInput.value.trim() : '');
        } catch (error) {
          console.error('Error loading students:', error);
          tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:red;">Error loading students: ${error.message}</td></tr>`;
        }
      }

      function render(searchQuery = '') {
        tbody.innerHTML = '';

        const filtered = allStudents.filter(s => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (s.name || '').toLowerCase().includes(q) ||
            (s.adm || '').toLowerCase().includes(q) ||
            (s.class || '').toLowerCase().includes(q) ||
            (s.parent_name || '').toLowerCase().includes(q);
        });

        if (filtered.length === 0) {
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
                <button class="action-btn view-btn" data-student-id="${s.id}" title="View Complete Data">
                  <svg class="action-icon" viewBox="0 0 24 24">
                    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
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
          btn.addEventListener('click', async function () {
            const studentId = this.getAttribute('data-student-id');
            const student = allStudents.find(s => s.id == studentId);
            if (!confirm(`Delete student ${student ? student.name : studentId}?`)) return;

            try {
              await studentsAPI.delete(studentId);
              await loadStudents();
              if (typeof initDashboard === 'function') initDashboard();
            } catch (error) {
              alert('Error deleting student: ' + error.message);
            }
          });
        });

        tbody.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', function () {
            const studentId = this.getAttribute('data-student-id');
            const student = allStudents.find(s => s.id == studentId);
            if (student) {
              openStudentModal(student);
            }
          });
        });

        tbody.querySelectorAll('.view-btn').forEach(btn => {
          btn.addEventListener('click', async function () {
            const studentId = this.getAttribute('data-student-id');
            const student = allStudents.find(s => s.id == studentId);
            if (student) {
              await showStudentCompleteData(student);
            }
          });
        });
      }

      // Modal Functions
      function openStudentModal(student = null) {
        if (student) {
          studentModalTitle.textContent = 'Edit Student';
          document.getElementById('studentId').value = student.id;
          document.getElementById('studentName').value = student.name || '';
          document.getElementById('studentAdm').value = student.adm || '';
          document.getElementById('studentNemis').value = student.nemis || '';
          document.getElementById('studentClass').value = student.class || '';
          document.getElementById('studentStream').value = student.stream || '';
          document.getElementById('studentHouse').value = student.house || '';
          document.getElementById('studentFee').value = student.fee_balance || 0;
          document.getElementById('studentParent').value = student.parent_id || '';

          // Format dates for input type="date"
          if (student.date_of_admission) {
            document.getElementById('admissionDate').value = new Date(student.date_of_admission).toISOString().split('T')[0];
          } else {
            document.getElementById('admissionDate').value = '';
          }

          if (student.date_of_completion) {
            document.getElementById('completionDate').value = new Date(student.date_of_completion).toISOString().split('T')[0];
          } else {
            document.getElementById('completionDate').value = '';
          }
        } else {
          studentModalTitle.textContent = 'Add New Student';
          studentForm.reset();
          document.getElementById('studentId').value = '';
        }
        studentModal.style.display = 'flex';
      }

      function closeStudentModal() {
        studentModal.style.display = 'none';
      }

      // Wire up events
      if (refreshBtn) refreshBtn.addEventListener('click', loadStudents);
      if (searchInput) searchInput.addEventListener('input', () => render(searchInput.value.trim()));

      if (addBtn) {
        addBtn.addEventListener('click', function () {
          openStudentModal();
        });
      }

      if (closeStudentModalBtn) closeStudentModalBtn.addEventListener('click', closeStudentModal);
      if (cancelStudentModalBtn) cancelStudentModalBtn.addEventListener('click', closeStudentModal);

      if (studentForm) {
        studentForm.addEventListener('submit', async function (e) {
          e.preventDefault();

          const studentId = document.getElementById('studentId').value;
          const studentData = {
            name: document.getElementById('studentName').value,
            adm: document.getElementById('studentAdm').value,
            nemis: document.getElementById('studentNemis').value,
            class: document.getElementById('studentClass').value,
            stream: document.getElementById('studentStream').value,
            house: document.getElementById('studentHouse').value,
            fee_balance: document.getElementById('studentFee').value,
            parent_id: document.getElementById('studentParent').value || null,
            date_of_admission: document.getElementById('admissionDate').value || null,
            date_of_completion: document.getElementById('completionDate').value || null
          };

          try {
            if (studentId) {
              await studentsAPI.update(studentId, studentData);
            } else {
              await studentsAPI.create(studentData);
            }
            closeStudentModal();
            await loadStudents();
            if (typeof initDashboard === 'function') initDashboard();
          } catch (error) {
            alert('Error saving student: ' + error.message);
          }
        });
      }

      // Initial load
      await loadStudents();
    } catch (e) {
      console.error('Error initializing students page:', e);
      alert('Error loading students page. Please refresh.');
    }
  };

  /* ------------------ Page: Parents ------------------ */
  window.initParentsPage = async function () {
    try {
      const searchInput = document.getElementById('parentSearchInput');
      const addBtn = document.getElementById('addParentBtn');
      const refreshBtn = document.getElementById('refreshBtn');
      const tbody = document.querySelector('#parentsTable tbody');

      if (!tbody) {
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
        } catch (error) {
          console.error('Error loading parents:', error);
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:red;">Error loading parents: ${error.message}</td></tr>`;
        }
      }

      function render(searchQuery = '') {
        tbody.innerHTML = '';

        const filtered = allParents.filter(p => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (p.name || '').toLowerCase().includes(q) ||
            (p.email || '').toLowerCase().includes(q) ||
            (p.phone || '').toLowerCase().includes(q);
        });

        if (filtered.length === 0) {
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
          btn.addEventListener('click', async function () {
            const parentId = this.getAttribute('data-id');
            const parent = allParents.find(p => p.id == parentId);
            const linkedStudents = allStudents.filter(s => s.parent_id == parentId);

            if (linkedStudents.length > 0) {
              if (!confirm(`This parent is linked to ${linkedStudents.length} student(s). Deleting will remove the link. Continue?`)) return;
            }

            if (!confirm(`Delete parent ${parent ? parent.name : parentId}?`)) return;

            try {
              await parentsAPI.delete(parentId);
              await loadData();
              if (typeof initDashboard === 'function') initDashboard();
            } catch (error) {
              alert('Error deleting parent: ' + error.message);
            }
          });
        });

        tbody.querySelectorAll('.btn-edit').forEach(btn => {
          btn.addEventListener('click', function () {
            const parentId = this.getAttribute('data-id');
            alert('Edit functionality coming soon. Parent ID: ' + parentId);
          });
        });
      }

      // Wire up events
      if (refreshBtn) refreshBtn.addEventListener('click', loadData);
      if (searchInput) searchInput.addEventListener('input', () => render(searchInput.value.trim()));
      if (addBtn) {
        addBtn.addEventListener('click', function () {
          alert('Add parent functionality coming soon. Please use the backend API directly for now.');
        });
      }

      // Initial load
      await loadData();
    } catch (e) {
      console.error('Error initializing parents page:', e);
      alert('Error loading parents page. Please refresh.');
    }
  };

  /* ------------------ Page: Staff ------------------ */
  window.initStaffPage = async function () {
    try {
      const searchInput = document.getElementById('staffSearchInput');
      const addBtn = document.getElementById('addStaffBtn');
      const refreshBtn = document.getElementById('refreshBtn');
      const tbody = document.querySelector('#staffTable tbody');

      if (!tbody) {
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
        } catch (error) {
          console.error('Error loading staff:', error);
          tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:red;">Error loading staff: ${error.message}</td></tr>`;
        }
      }

      function render(searchQuery = '') {
        tbody.innerHTML = '';

        const filtered = allStaff.filter(s => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (s.name || '').toLowerCase().includes(q) ||
            (s.staff_no || '').toLowerCase().includes(q);
        });

        if (filtered.length === 0) {
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
          btn.addEventListener('click', async function () {
            const staffId = this.getAttribute('data-id');
            const staff = allStaff.find(s => s.id == staffId);
            if (!confirm(`Delete staff ${staff ? staff.name : staffId}?`)) return;

            try {
              await staffAPI.delete(staffId);
              await loadData();
              if (typeof initDashboard === 'function') initDashboard();
            } catch (error) {
              alert('Error deleting staff: ' + error.message);
            }
          });
        });

        tbody.querySelectorAll('.btn-edit').forEach(btn => {
          btn.addEventListener('click', function () {
            const staffId = this.getAttribute('data-id');
            alert('Edit functionality coming soon. Staff ID: ' + staffId);
          });
        });

        tbody.querySelectorAll('.btn-approve, .btn-revoke').forEach(btn => {
          btn.addEventListener('click', async function () {
            const staffId = this.getAttribute('data-id');
            const staff = allStaff.find(s => s.id == staffId);
            const newApprovedStatus = !staff.approved;

            try {
              await staffAPI.update(staffId, { approved: newApprovedStatus });
              await loadData();
              if (typeof initDashboard === 'function') initDashboard();
            } catch (error) {
              alert('Error updating staff: ' + error.message);
            }
          });
        });
      }

      // Wire up events
      if (refreshBtn) refreshBtn.addEventListener('click', loadData);
      if (searchInput) searchInput.addEventListener('input', () => render(searchInput.value.trim()));
      if (addBtn) {
        addBtn.addEventListener('click', function () {
          alert('Add staff functionality coming soon. Please use the backend API directly for now.');
        });
      }

      // Initial load
      await loadData();
    } catch (e) {
      console.error('Error initializing staff page:', e);
      alert('Error loading staff page. Please refresh.');
    }
  };

  /* ------------------ Student Complete Data View ------------------ */
  window.showStudentCompleteData = async function (student) {
    try {
      // Fetch complete student data from API
      let studentData;
      try {
        studentData = await studentsAPI.getById(student.id);
      } catch (error) {
        console.warn('Could not fetch detailed student data from API, using provided data:', error);
        studentData = student;
      }

      // Create modal HTML with complete student data
      const modalHTML = `
        <div style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
            <h2 style="color: var(--primary-green); font-size: 1.8rem; margin: 0;">Student Complete Data Report</h2>
            <button id="closeCompleteDataModal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999; padding: 0; width: 30px; height: 30px;">&times;</button>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div style="text-align: center;">
              <img src="${studentData.photo_url || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTEyLDEyQTUuNSw1LjUgMCwwLDAgMTcuNSw2LjVBNS41LDUuNSAwLDAsMCAxMiwxQTUuNSw1LjUgMCwwLDAgNi41LDYuNUE1LjUsNS41IDAsMCwwIDEyLDEyTTEyLDE0QzcuNTgsMTQgNCwxNS43OSA0LDE4VjIwSDIwVjE4QzIwLDE1Ljc5IDE2LjQyLDE0IDEyLDE0WiIvPjwvc3ZnPg=='}" 
                   alt="Student Photo" 
                   style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-green); margin-bottom: 10px;">
              <div style="font-weight: 700; font-size: 1.2rem; color: var(--primary-green); margin-top: 10px;">${escapeHtml(studentData.name || 'N/A')}</div>
              <div style="color: #666; margin-top: 5px;">${escapeHtml(studentData.adm || 'N/A')}</div>
            </div>
            
            <div style="background: var(--pale-green); padding: 20px; border-radius: 8px;">
              <h3 style="color: var(--primary-green); margin-bottom: 15px; font-size: 1.1rem;">Quick Summary</h3>
              <div style="display: grid; gap: 10px;">
                <div><strong>Class:</strong> ${escapeHtml(studentData.class || 'N/A')}</div>
                <div><strong>Stream:</strong> ${escapeHtml(studentData.stream || 'N/A')}</div>
                <div><strong>House:</strong> ${escapeHtml(studentData.house || 'N/A')}</div>
                <div><strong>Fee Balance:</strong> ${formatCurrency(studentData.fee_balance)}</div>
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div>
              <h3 style="color: var(--primary-green); margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid var(--primary-green);">Personal Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #666; width: 40%;">Name:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapeHtml(studentData.name || 'N/A')}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #666;">Admission No:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapeHtml(studentData.adm || 'N/A')}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #666;">NEMIS:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapeHtml(studentData.nemis || 'N/A')}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: 600; color: #666;">Date of Admission:</td><td style="padding: 8px 0;">${formatDate(studentData.date_of_admission || studentData.created_at)}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: 600; color: #666;">Date of Completion:</td><td style="padding: 8px 0;">${formatDate(studentData.date_of_completion)}</td></tr>
              </table>
            </div>
            
            <div>
              <h3 style="color: var(--primary-green); margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid var(--primary-green);">Academic Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #666; width: 40%;">Class:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapeHtml(studentData.class || 'N/A')}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #666;">Stream:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapeHtml(studentData.stream || 'N/A')}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #666;">House:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapeHtml(studentData.house || 'N/A')}</td></tr>
              </table>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div>
              <h3 style="color: var(--primary-green); margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid var(--primary-green);">Fee Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #666; width: 40%;">Fee Balance:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formatCurrency(studentData.fee_balance)}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: 600; color: #666;">Payment Status:</td><td style="padding: 8px 0;">${getPaymentStatus(studentData.fee_balance).text}</td></tr>
              </table>
            </div>
            
            <div>
              <h3 style="color: var(--primary-green); margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid var(--primary-green);">Additional Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #666; width: 40%;">Meal Card Validity:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formatDate(studentData.meal_card_validity)}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #666;">Parent/Guardian:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapeHtml(studentData.parent_name || 'N/A')}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: 600; color: #666;">Registered:</td><td style="padding: 8px 0;">${formatDate(studentData.created_at)}</td></tr>
              </table>
            </div>
          </div>
          
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <button id="downloadPDF" style="padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; background: #800020; color: white; transition: all 0.3s ease;">
              📄 Download PDF Report
            </button>
            <button id="downloadExcel" style="padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; background: #2d5016; color: white; transition: all 0.3s ease;">
              📊 Download Excel Report
            </button>
            <button id="closeModalBtn" style="padding: 12px 24px; border: 2px solid #2d5016; border-radius: 8px; cursor: pointer; font-weight: 500; background: white; color: #2d5016; transition: all 0.3s ease;">
              Close
            </button>
          </div>
        </div>
      `;

      // Show modal using existing modal system or create new one
      if (typeof showModal === 'function') {
        showModal('Student Complete Data', modalHTML);
      } else {
        // Create modal manually
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        modalBackdrop.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';
        modalBackdrop.innerHTML = `<div class="modal" style="background: white; padding: 30px; border-radius: 12px; max-width: 950px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">${modalHTML}</div>`;
        document.body.appendChild(modalBackdrop);

        // Close modal handlers
        const closeModal = () => {
          document.body.removeChild(modalBackdrop);
        };

        modalBackdrop.querySelector('#closeCompleteDataModal')?.addEventListener('click', closeModal);
        modalBackdrop.querySelector('#closeModalBtn')?.addEventListener('click', closeModal);
        modalBackdrop.addEventListener('click', (e) => {
          if (e.target === modalBackdrop) closeModal();
        });

        // Download PDF
        const pdfBtn = modalBackdrop.querySelector('#downloadPDF');
        if (pdfBtn) {
          pdfBtn.addEventListener('click', () => {
            downloadStudentReportPDF(studentData);
          });
          pdfBtn.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(128, 0, 32, 0.3)';
          });
          pdfBtn.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
          });
        }

        // Download Excel
        const excelBtn = modalBackdrop.querySelector('#downloadExcel');
        if (excelBtn) {
          excelBtn.addEventListener('click', () => {
            downloadStudentReportExcel(studentData);
          });
          excelBtn.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(45, 80, 22, 0.3)';
          });
          excelBtn.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
          });
        }
      }
    } catch (error) {
      console.error('Error showing student complete data:', error);
      alert('Error loading student data: ' + error.message);
    }
  };

  // Download Student Report as PDF
  function downloadStudentReportPDF(studentData) {
    try {
      // Create a printable HTML content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Student Report - ${studentData.name}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2d5016; padding-bottom: 15px; }
            .header h1 { color: #2d5016; margin: 0; }
            .header p { color: #666; margin: 5px 0; }
            .photo-section { text-align: center; margin: 20px 0; }
            .photo-section img { width: 120px; height: 120px; border-radius: 50%; border: 3px solid #2d5016; }
            .section { margin: 25px 0; }
            .section h3 { color: #2d5016; border-bottom: 2px solid #2d5016; padding-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            td:first-child { font-weight: 600; color: #666; width: 35%; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HECHLINK VENTURES SCHOOL</h1>
            <p>Student Complete Data Report</p>
            <p>Generated on: ${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div class="photo-section">
            <img src="${studentData.photo_url || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTEyLDEyQTUuNSw1LjUgMCwwLDAgMTcuNSw2LjVBNS41LDUuNSAwLDAsMCAxMiwxQTUuNSw1LjUgMCwwLDAgNi41LDYuNUE1LjUsNS41IDAsMCwwIDEyLDEyTTEyLDE0QzcuNTgsMTQgNCwxNS43OSA0LDE4VjIwSDIwVjE4QzIwLDE1Ljc5IDE2LjQyLDE0IDEyLDE0WiIvPjwvc3ZnPg=='}" alt="Student Photo">
            <h2>${escapeHtml(studentData.name || 'N/A')}</h2>
            <p>Admission Number: ${escapeHtml(studentData.adm || 'N/A')}</p>
          </div>
          
          <div class="section">
            <h3>Personal Information</h3>
            <table>
              <tr><td>Full Name</td><td>${escapeHtml(studentData.name || 'N/A')}</td></tr>
              <tr><td>Admission Number</td><td>${escapeHtml(studentData.adm || 'N/A')}</td></tr>
              <tr><td>NEMIS Number</td><td>${escapeHtml(studentData.nemis || 'N/A')}</td></tr>
              <tr><td>Date of Admission</td><td>${formatDate(studentData.date_of_admission || studentData.created_at)}</td></tr>
              <tr><td>Date of Completion</td><td>${formatDate(studentData.date_of_completion)}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h3>Academic Information</h3>
            <table>
              <tr><td>Class</td><td>${escapeHtml(studentData.class || 'N/A')}</td></tr>
              <tr><td>Stream</td><td>${escapeHtml(studentData.stream || 'N/A')}</td></tr>
              <tr><td>House</td><td>${escapeHtml(studentData.house || 'N/A')}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h3>Fee Information</h3>
            <table>
              <tr><td>Fee Balance</td><td>${formatCurrency(studentData.fee_balance)}</td></tr>
              <tr><td>Payment Status</td><td>${getPaymentStatus(studentData.fee_balance).text}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h3>Additional Information</h3>
            <table>
              <tr><td>Meal Card Validity</td><td>${formatDate(studentData.meal_card_validity)}</td></tr>
              <tr><td>Parent/Guardian</td><td>${escapeHtml(studentData.parent_name || 'N/A')}</td></tr>
              <tr><td>Registration Date</td><td>${formatDate(studentData.created_at)}</td></tr>
            </table>
          </div>
          
          <div class="footer">
            <p>This is a system-generated report from Hechlink Ventures School Student Management System</p>
          </div>
        </body>
        </html>
      `;

      // Open print window
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for images to load, then print
      printWindow.onload = function () {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  }

  // Download Student Report as Excel
  function downloadStudentReportExcel(studentData) {
    try {
      // Create CSV content (Excel can open CSV)
      const csvRows = [
        ['Student Complete Data Report'],
        ['Hechlink Ventures School'],
        ['Generated on: ' + new Date().toLocaleDateString('en-KE')],
        [],
        ['Field', 'Value'],
        ['Full Name', studentData.name || 'N/A'],
        ['Admission Number', studentData.adm || 'N/A'],
        ['NEMIS Number', studentData.nemis || 'N/A'],
        ['Class', studentData.class || 'N/A'],
        ['Stream', studentData.stream || 'N/A'],
        ['House', studentData.house || 'N/A'],
        ['Date of Admission', formatDate(studentData.date_of_admission || studentData.created_at)],
        ['Date of Completion', formatDate(studentData.date_of_completion)],
        ['Fee Balance', formatCurrency(studentData.fee_balance)],
        ['Payment Status', getPaymentStatus(studentData.fee_balance).text],
        ['Meal Card Validity', formatDate(studentData.meal_card_validity)],
        ['Parent/Guardian', studentData.parent_name || 'N/A'],
        ['Registration Date', formatDate(studentData.created_at)],
        ['Photo URL', studentData.photo_url || 'N/A']
      ];

      // Convert to CSV string
      const csvContent = csvRows.map(row => {
        return row.map(cell => {
          // Escape commas and quotes
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return '"' + cellStr.replace(/"/g, '""') + '"';
          }
          return cellStr;
        }).join(',');
      }).join('\n');

      // Add BOM for UTF-8 (Excel compatibility)
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${studentData.adm || 'student'}-complete-data-report.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error generating Excel report. Please try again.');
    }
  }

  function formatDate(dateString) {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  }

})();

