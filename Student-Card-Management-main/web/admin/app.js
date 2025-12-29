/* app.js — Shared admin frontend logic (v2)
   - LocalStorage-backed data model with cross-links
   - injectLayout wraps <main class="main-content"> with sidebar
   - Page initializers: initDashboard, initParentsPage, initStaffPage, initStudentsPage, initSettingsPage
*/
(function () {
  const KEY = 'sv_data_v2';

  /* ------------------ Data helpers ------------------ */
  function readData() {
    try {
      const data = localStorage.getItem(KEY);
      if (!data) return {};
      return JSON.parse(data);
    }
    catch (e) {
      console.error('Error reading data:', e);
      return {};
    }
  }
  function saveData(d) {
    try {
      localStorage.setItem(KEY, JSON.stringify(d || {}));
    } catch (e) {
      console.error('Error saving data:', e);
      alert('Error saving data. Please check your browser storage settings.');
    }
  }

  // Safe seed if missing (optional — keep simple demo data)
  function seedIfEmpty() {
    const existing = readData();
    if (existing && (existing.parents || existing.staff || existing.students)) return;
    const initial = {
      parents: [
        { id: 'p1', name: 'Grace Ndungu', email: 'grace@example.com', countryCode: '+254', phone: '712345678', relationship: 'Mother', address: 'Nairobi' },
        { id: 'p2', name: 'John Mwangi', email: 'john@example.com', countryCode: '+254', phone: '722123456', relationship: 'Father', address: 'Kisumu' }
      ],
      staff: [
        { id: 't1', name: 'Alice W', staffNo: 'T-901', role: 'Math Teacher', department: 'Mathematics', approved: true },
        { id: 't2', name: 'Robert K', staffNo: 'T-902', role: 'Science Teacher', department: 'Sciences', approved: false }
      ],
      students: [
        {
          adm: 'S001', name: 'David Kimani', cls: '4B',
          // links use IDs
          guardianId: 'p1', guardianPhoneDisplay: '+254 712345678', relationship: 'Mother',
          schoolName: 'Green Valley Academy', academicYearFrom: '2025-01-01', academicYearTo: '2025-12-31', currentTerm: 'Term 2',
          yearOfCompletion: '2028', currentGrade: 'Grade 4', classTeacherId: 't1',
          feeBalance: 3500, lastPaymentDate: '2025-10-10', paymentStatus: 'Pending',
          qr: 'S001'
        },
        {
          adm: 'S002', name: 'Rachel Auma', cls: '6A',
          guardianId: 'p2', guardianPhoneDisplay: '+254 722123456', relationship: 'Father',
          schoolName: 'Green Valley Academy', academicYearFrom: '2025-01-01', academicYearTo: '2025-12-31', currentTerm: 'Term 2',
          yearOfCompletion: '2027', currentGrade: 'Grade 6', classTeacherId: 't1',
          feeBalance: 0, lastPaymentDate: '2025-09-10', paymentStatus: 'Cleared',
          qr: 'S002'
        }
      ],
      recent: ['System seeded with demo data']
    };
    saveData(initial);
  }

  /* ------------------ Auth helpers ------------------ */
  window.ensureAuthRedirect = function () {
    try {
      // Check for either admin token or auth token (for compatibility)
      const adminToken = localStorage.getItem('sv_admin_token');
      const authToken = localStorage.getItem('sv_auth_token');
      if (!adminToken && !authToken) {
        location.href = '/index.html';
      }
    } catch (e) {
      console.error('Error checking authentication:', e);
      location.href = '/index.html';
    }
  };
  window.doLogout = function () {
    try {
      localStorage.removeItem('sv_admin_token');
      localStorage.removeItem('sv_auth_token');
      localStorage.removeItem('sv_admin_email');
      localStorage.removeItem('sv_user_data');
      location.href = '/index.html';
    } catch (e) {
      console.error('Error during logout:', e);
      alert('Error during logout. Please clear your browser cache.');
    }
  };

  /* ------------------ Layout injection ------------------ */
  window.injectLayout = function (activePage) {
    const root = document.getElementById('layoutRoot');
    if (!root) return;
    // Find page main content element
    const main = document.querySelector('.main-content');
    if (!main) return console.warn('injectLayout: .main-content not found');

    // Build layout wrapper
    const layout = document.createElement('div');
    layout.className = 'layout';
    const email = localStorage.getItem('sv_admin_email') || 'admin';

    layout.innerHTML = `
      <aside class="sidebar">
        <div>
          <div class="side-brand">
            <div class="logo">SV</div>
            <div style="margin-left:10px">
              <strong>Student Viewer</strong>
              <div class="small muted">Admin</div>
            </div>
          </div>
          <nav class="nav" style="margin-top:16px">
            <a href="admindashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a>
            <a href="parents.html" class="${activePage === 'parents' ? 'active' : ''}">Parents</a>
            <a href="staff.html" class="${activePage === 'staff' ? 'active' : ''}">Staff</a>
            <a href="students.html" class="${activePage === 'students' ? 'active' : ''}">Students</a>
            <a href="adminsettings.html" class="${activePage === 'settings' ? 'active' : ''}">Settings</a>
          </nav>
        </div>
        <div>
          <div class="muted small" style="margin-bottom:8px">Signed in as <br><strong>${escapeHtml(email)}</strong></div>
          <div class="logout" id="logoutBtn">🔒 Logout</div>
        </div>
      </aside>
    `;

    // Replace or append root with layout and move main into layout
    root.replaceWith(layout);
    layout.appendChild(main);

    // Logout handler
    const lb = document.getElementById('logoutBtn');
    if (lb) lb.addEventListener('click', () => { if (confirm('Logout?')) doLogout(); });
  };

  /* ------------------ Utility helpers ------------------ */
  function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function downloadCSV(arr, keys, filename) {
    const lines = [keys.join(',')];
    arr.forEach(o => lines.push(keys.map(k => JSON.stringify(o[k] ?? '')).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  /* ------------------ Phone country codes ------------------ */
  const COUNTRY_CODES = [
    { code: '+254', label: 'Kenya' }, { code: '+255', label: 'Tanzania' }, { code: '+256', label: 'Uganda' },
    { code: '+257', label: 'Burundi' }, { code: '+250', label: 'Rwanda' }, { code: '+211', label: 'South Sudan' },
    { code: '+44', label: 'United Kingdom' }, { code: '+1', label: 'United States' }, { code: '+91', label: 'India' }
  ];

  // helper to create phone inputs HTML (returns {container, getter})
  function createPhoneInputs(initial) {
    // initial: {countryCode: '+254', phone:'712345678'}
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '8px';
    container.style.alignItems = 'center';

    const select = document.createElement('select');
    select.style.padding = '8px';
    select.style.borderRadius = '6px';
    COUNTRY_CODES.forEach(cc => {
      const opt = document.createElement('option'); opt.value = cc.code; opt.textContent = `${cc.code} ${cc.label}`;
      select.appendChild(opt);
    });
    if (initial && initial.countryCode) select.value = initial.countryCode;

    const phoneInput = document.createElement('input');
    phoneInput.type = 'tel';
    phoneInput.placeholder = '712345678';
    phoneInput.style.padding = '8px';
    phoneInput.style.borderRadius = '6px';
    phoneInput.style.flex = '1';
    phoneInput.value = initial && initial.phone ? initial.phone : '';

    container.appendChild(select);
    container.appendChild(phoneInput);

    function getter() {
      return { countryCode: select.value, phone: phoneInput.value.trim(), display: (select.value + (phoneInput.value.trim() ? ' ' + phoneInput.value.trim() : '')) };
    }
    return { container, getter };
  }

  /* ------------------ Cross-link helpers ------------------ */
  function parentNameById(id) {
    const d = readData(); const p = (d.parents || []).find(x => x.id === id); return p ? p.name : '';
  }
  function staffNameById(id) {
    const d = readData(); const s = (d.staff || []).find(x => x.id === id); return s ? s.name : '';
  }
  function studentsLinkedToParent(parentId) {
    const d = readData(); return (d.students || []).filter(s => s.guardianId === parentId).map(s => s.adm);
  }
  function studentsLinkedToStaff(staffId) {
    const d = readData(); return (d.students || []).filter(s => s.classTeacherId === staffId).map(s => s.adm);
  }

  /* ------------------ Page: Dashboard ------------------ */
  window.initDashboard = function () {
    try {
      seedIfEmpty();
      const d = readData();
      const parentsCount = (d.parents || []).length;
      const staffCount = (d.staff || []).length;
      const studentsCount = (d.students || []).length;
      const pendingApprovals = (d.staff || []).filter(s => !s.approved).length;

      const elParents = document.getElementById('statParents'); if (elParents) elParents.textContent = parentsCount;
      const elStaff = document.getElementById('statStaff'); if (elStaff) elStaff.textContent = staffCount;
      const elStudents = document.getElementById('statStudents'); if (elStudents) elStudents.textContent = studentsCount;
      const elPending = document.getElementById('statPending'); if (elPending) elPending.textContent = pendingApprovals;

      const recentList = document.getElementById('recentList');
      if (recentList) {
        recentList.innerHTML = '';
        (d.recent || []).slice(-8).reverse().forEach(r => {
          const li = document.createElement('li'); li.textContent = r; recentList.appendChild(li);
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

  /* ------------------ Page: Parents ------------------ */
  window.initParentsPage = function () {
    try {
      seedIfEmpty();
      const searchInput = document.getElementById('parentSearchInput');
      const addBtn = document.getElementById('addParentBtn');
      const exportBtn = document.getElementById('exportParentsBtn');
      const tbody = document.querySelector('#parentsTable tbody');

      if (!addBtn || !exportBtn || !tbody) {
        console.error('Required elements not found for parents page');
        return;
      }

      function render(q = '') {
        const d = readData();
        tbody.innerHTML = '';
        (d.parents || []).filter(p => {
          if (!q) return true;
          const s = q.toLowerCase();
          return (p.name || '').toLowerCase().includes(s) || (p.email || '').toLowerCase().includes(s) || (p.phone || '').toLowerCase().includes(s);
        }).forEach(p => {
          const linked = studentsLinkedToParent(p.id).join(', ');
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${escapeHtml(p.id)}</td>
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.email || '')}</td>
          <td>${escapeHtml((p.countryCode || '') + ' ' + (p.phone || ''))}</td>
          <td>${escapeHtml(p.relationship || '')}</td>
          <td>${escapeHtml(linked || '—')}</td>
          <td>
            <button class="btn ghost btn-edit" data-id="${p.id}">Edit</button>
            <button class="btn ghost btn-del" data-id="${p.id}">Delete</button>
          </td>`;
          tbody.appendChild(tr);
        });

        // handlers
        tbody.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', () => editParent(b.dataset.id)));
        tbody.querySelectorAll('.btn-del').forEach(b => b.addEventListener('click', () => {
          const id = b.dataset.id;
          const linked = studentsLinkedToParent(id);
          if (linked.length) {
            if (!confirm(`This parent is linked to students (${linked.join(', ')}). Deleting will remove the link. Continue?`)) return;
          }
          const data = readData(); data.parents = (data.parents || []).filter(x => x.id !== id); data.recent = (data.recent || []).concat([`Parent ${id} deleted`]); saveData(data);
          render(searchInput.value.trim()); initDashboard();
        }));
      }

      function addParent() {
        showModal('Add Parent', `
        <div style="display:flex;flex-direction:column;gap:8px">
          <input id="m_name" placeholder="Full name">
          <input id="m_email" placeholder="Email">
          <div id="m_phone_container"></div>
          <input id="m_relationship" placeholder="Relationship (e.g. Mother)">
          <input id="m_address" placeholder="Address (optional)">
          <div style="text-align:right"><button id="m_cancel" class="btn ghost">Cancel</button> <button id="m_save" class="btn">Save</button></div>
        </div>
      `);
        const container = document.getElementById('m_phone_container');
        const phoneWidget = createPhoneInputs({});
        container.appendChild(phoneWidget.container);

        document.getElementById('m_cancel').onclick = closeModal;
        document.getElementById('m_save').onclick = () => {
          try {
            const name = document.getElementById('m_name').value.trim();
            const email = document.getElementById('m_email').value.trim();
            const { countryCode, phone, display } = phoneWidget.getter();
            const relationship = document.getElementById('m_relationship').value.trim();
            const address = document.getElementById('m_address').value.trim();
            if (!name) {
              alert('Name is required');
              return;
            }
            // Basic email validation
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              alert('Please enter a valid email address');
              return;
            }
            // Basic phone validation
            if (phone && !/^\d+$/.test(phone)) {
              alert('Please enter a valid phone number (numbers only)');
              return;
            }
            const data = readData();
            data.parents = data.parents || [];
            const newParent = { id: 'p' + Date.now(), name, email, countryCode, phone, phoneDisplay: display, relationship, address };
            data.parents.push(newParent);
            data.recent = (data.recent || []).concat([`Parent ${name} added`]);
            saveData(data);
            closeModal();
            render();
            initDashboard();
          } catch (e) {
            console.error('Error adding parent:', e);
            alert('Error adding parent. Please try again.');
          }
        };
      }

      function editParent(id) {
        const data = readData();
        const p = (data.parents || []).find(x => x.id === id);
        if (!p) return alert('Parent not found');
        showModal('Edit Parent', `
        <div style="display:flex;flex-direction:column;gap:8px">
          <input id="m_name" value="${escapeHtml(p.name)}" placeholder="Full name">
          <input id="m_email" value="${escapeHtml(p.email || '')}" placeholder="Email">
          <div id="m_phone_container"></div>
          <input id="m_relationship" value="${escapeHtml(p.relationship || '')}" placeholder="Relationship">
          <input id="m_address" value="${escapeHtml(p.address || '')}" placeholder="Address (optional)">
          <div style="text-align:right"><button id="m_cancel" class="btn ghost">Cancel</button> <button id="m_save" class="btn">Save</button></div>
        </div>
      `);
        const container = document.getElementById('m_phone_container');
        const phoneWidget = createPhoneInputs({ countryCode: p.countryCode || '+254', phone: p.phone || '' });
        container.appendChild(phoneWidget.container);

        document.getElementById('m_cancel').onclick = closeModal;
        document.getElementById('m_save').onclick = () => {
          try {
            const name = document.getElementById('m_name').value.trim();
            if (!name) {
              alert('Name is required');
              return;
            }
            const email = document.getElementById('m_email').value.trim();
            // Basic email validation
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              alert('Please enter a valid email address');
              return;
            }
            const { countryCode, phone, display } = phoneWidget.getter();
            // Basic phone validation
            if (phone && !/^\d+$/.test(phone)) {
              alert('Please enter a valid phone number (numbers only)');
              return;
            }
            p.name = name;
            p.email = email;
            p.countryCode = countryCode;
            p.phone = phone;
            p.phoneDisplay = display;
            p.relationship = document.getElementById('m_relationship').value.trim();
            p.address = document.getElementById('m_address').value.trim();
            data.recent = (data.recent || []).concat([`Parent ${p.name} updated`]);
            saveData(data);
            closeModal();
            render(searchInput.value.trim());
            initDashboard();
          } catch (e) {
            console.error('Error updating parent:', e);
            alert('Error updating parent. Please try again.');
          }
        };
      }

      // wire events
      addBtn.onclick = addParent;
      exportBtn.onclick = () => {
        try {
          const d = readData();
          downloadCSV(d.parents || [], ['id', 'name', 'email', 'countryCode', 'phone', 'relationship', 'address'], 'parents.csv');
        } catch (e) {
          console.error('Error exporting parents:', e);
          alert('Error exporting data. Please try again.');
        }
      };
      if (searchInput) searchInput.oninput = () => render(searchInput.value.trim());
      render();
    } catch (e) {
      console.error('Error initializing parents page:', e);
      alert('Error loading parents page. Please refresh.');
    }
  };

  /* ------------------ Page: Staff ------------------ */
  window.initStaffPage = function () {
    try {
      seedIfEmpty();
      const searchInput = document.getElementById('staffSearchInput');
      const addBtn = document.getElementById('addStaffBtn');
      const exportBtn = document.getElementById('exportStaffBtn');
      const tbody = document.querySelector('#staffTable tbody');

      if (!addBtn || !exportBtn || !tbody) {
        console.error('Required elements not found for staff page');
        return;
      }

      function render(q = '') {
        const d = readData();
        tbody.innerHTML = '';
        (d.staff || []).filter(s => {
          if (!q) return true;
          const s2 = q.toLowerCase(); return (s.name || '').toLowerCase().includes(s2) || (s.staffNo || '').toLowerCase().includes(s2);
        }).forEach(s => {
          const linked = studentsLinkedToStaff(s.id).join(', ');
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${escapeHtml(s.id)}</td>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.staffNo || '')}</td>
          <td>${escapeHtml(s.role || '')}</td>
          <td>${escapeHtml(s.department || '')}</td>
          <td>${s.approved ? 'Approved' : '<strong class="muted">Pending</strong>'}</td>
          <td>${escapeHtml(linked || '—')}</td>
          <td>
            <button class="btn ghost btn-edit" data-id="${s.id}">Edit</button>
            ${s.approved ? `<button class="btn ghost btn-revoke" data-id="${s.id}">Revoke</button>` : `<button class="btn btn-approve" data-id="${s.id}">Approve</button>`}
            <button class="btn ghost btn-del" data-id="${s.id}">Delete</button>
          </td>`;
          tbody.appendChild(tr);
        });

        // handlers
        tbody.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', () => editStaff(b.dataset.id)));
        tbody.querySelectorAll('.btn-approve').forEach(b => b.addEventListener('click', () => {
          const d = readData(); const s = d.staff.find(x => x.id === b.dataset.id); if (s) { s.approved = true; d.recent = (d.recent || []).concat([`Staff ${s.name} approved`]); saveData(d); render(searchInput.value.trim()); initDashboard(); }
        }));
        tbody.querySelectorAll('.btn-revoke').forEach(b => b.addEventListener('click', () => {
          const d = readData(); const s = d.staff.find(x => x.id === b.dataset.id); if (s) { s.approved = false; d.recent = (d.recent || []).concat([`Staff ${s.name} revoked`]); saveData(d); render(searchInput.value.trim()); initDashboard(); }
        }));
        tbody.querySelectorAll('.btn-del').forEach(b => b.addEventListener('click', () => {
          const id = b.dataset.id;
          const linked = studentsLinkedToStaff(id);
          if (linked.length) {
            if (!confirm(`This staff is class teacher for students (${linked.join(', ')}). Deleting will remove those links. Continue?`)) return;
          }
          const d = readData(); d.staff = (d.staff || []).filter(x => x.id !== id); d.recent = (d.recent || []).concat([`Staff ${id} deleted`]); saveData(d);
          render(searchInput.value.trim()); initDashboard();
        }));
      }

      function addStaff() {
        showModal('Add Staff', `
        <div style="display:flex;flex-direction:column;gap:8px">
          <input id="m_name" placeholder="Full name">
          <input id="m_staffNo" placeholder="Staff Number">
          <input id="m_role" placeholder="Role (e.g. Teacher)">
          <input id="m_department" placeholder="Department (optional)">
          <div style="text-align:right"><button id="m_cancel" class="btn ghost">Cancel</button> <button id="m_save" class="btn">Save</button></div>
        </div>
      `);
        document.getElementById('m_cancel').onclick = closeModal;
        document.getElementById('m_save').onclick = () => {
          try {
            const name = document.getElementById('m_name').value.trim();
            const staffNo = document.getElementById('m_staffNo').value.trim();
            const role = document.getElementById('m_role').value.trim();
            const department = document.getElementById('m_department').value.trim();
            if (!name || !staffNo) {
              alert('Name and staff number are required');
              return;
            }
            const d = readData();
            d.staff = d.staff || [];
            const newStaff = { id: 't' + Date.now(), name, staffNo, role, department, approved: false };
            d.staff.push(newStaff);
            d.recent = (d.recent || []).concat([`Staff ${name} added`]);
            saveData(d);
            closeModal();
            render();
            initDashboard();
          } catch (e) {
            console.error('Error adding staff:', e);
            alert('Error adding staff. Please try again.');
          }
        };
      }

      function editStaff(id) {
        const d = readData(); const s = (d.staff || []).find(x => x.id === id); if (!s) return alert('Not found');
        showModal('Edit Staff', `
        <div style="display:flex;flex-direction:column;gap:8px">
          <input id="m_name" value="${escapeHtml(s.name)}" placeholder="Full name">
          <input id="m_staffNo" value="${escapeHtml(s.staffNo || '')}" placeholder="Staff Number">
          <input id="m_role" value="${escapeHtml(s.role || '')}" placeholder="Role">
          <input id="m_department" value="${escapeHtml(s.department || '')}" placeholder="Department">
          <label><input id="m_approved" type="checkbox" ${s.approved ? 'checked' : ''}> Approved</label>
          <div style="text-align:right"><button id="m_cancel" class="btn ghost">Cancel</button> <button id="m_save" class="btn">Save</button></div>
        </div>
      `);
        document.getElementById('m_cancel').onclick = closeModal;
        document.getElementById('m_save').onclick = () => {
          try {
            const name = document.getElementById('m_name').value.trim();
            const staffNo = document.getElementById('m_staffNo').value.trim();
            if (!name || !staffNo) {
              alert('Name and staff number are required');
              return;
            }
            s.name = name;
            s.staffNo = staffNo;
            s.role = document.getElementById('m_role').value.trim();
            s.department = document.getElementById('m_department').value.trim();
            s.approved = !!document.getElementById('m_approved').checked;
            d.recent = (d.recent || []).concat([`Staff ${s.name} updated`]);
            saveData(d);
            closeModal();
            render(searchInput.value.trim());
            initDashboard();
          } catch (e) {
            console.error('Error updating staff:', e);
            alert('Error updating staff. Please try again.');
          }
        };
      }

      // wire events
      addBtn.onclick = addStaff;
      exportBtn.onclick = () => {
        try {
          const d = readData();
          downloadCSV(d.staff || [], ['id', 'name', 'staffNo', 'role', 'department', 'approved'], 'staff.csv');
        } catch (e) {
          console.error('Error exporting staff:', e);
          alert('Error exporting data. Please try again.');
        }
      };
      if (searchInput) searchInput.oninput = () => render(searchInput.value.trim());
      render();
    } catch (e) {
      console.error('Error initializing staff page:', e);
      alert('Error loading staff page. Please refresh.');
    }
  };

  /* ------------------ Page: Students ------------------ */
  window.initStudentsPage = function () {
    try {
      seedIfEmpty();
      const searchInput = document.getElementById('studentSearchInput');
      const addBtn = document.getElementById('addStudentBtn');
      const dataInput = document.getElementById('studentDataInput');
      const filesList = document.getElementById('dataFilesList');
      const tbody = document.querySelector('#studentsTable tbody');

      if (!addBtn || !tbody) {
        console.error('Required elements not found for students page');
        return;
      }

      function importStudentRows(rows, sourceLabel) {
        if (!Array.isArray(rows)) return;
        let added = 0;
        const data = readData();
        data.students = data.students || [];
        rows.forEach((cols, index) => {
          const arr = Array.isArray(cols) ? cols : String(cols || '').split(',');
          const admRaw = String(arr[0] ?? '').trim();
          if (!admRaw) return;
          if (index === 0 && admRaw.toLowerCase().includes('adm')) return;
          const name = String(arr[1] ?? '').trim();
          const cls = String(arr[2] ?? '').trim();
          const adm = admRaw.toUpperCase();
          if (adm && name && !data.students.find(s => s.adm === adm)) {
            data.students.push({ adm, name, cls, qr: adm });
            added++;
          }
        });
        data.recent = (data.recent || []).concat([`Imported ${added} students via ${sourceLabel}`]);
        saveData(data);
        render(searchInput ? searchInput.value.trim() : '');
        initDashboard();
        alert(`Imported ${added} students from ${sourceLabel}.`);
      }

      function renderFilesList() {
        if (!filesList) return;
        const data = readData();
        const files = data.uploadedFiles || [];
        if (!files.length) {
          filesList.innerHTML = '<p class=\"muted\">No supporting files uploaded yet.</p>';
          return;
        }
        filesList.innerHTML = files.map(file => `
          <div class=\"uploaded-file\" data-id=\"${escapeHtml(file.id)}\">
            <div>
              <strong>${escapeHtml(file.name)}</strong>
              <span class=\"muted\">${escapeHtml(file.type || 'Attachment')} • ${(file.size ? (file.size / 1024).toFixed(1) : '0')} KB</span>
            </div>
            <div class=\"uploaded-file-buttons\">
              <button class=\"btn ghost\" data-download=\"${escapeHtml(file.id)}\">Download</button>
              <button class=\"btn ghost\" data-remove=\"${escapeHtml(file.id)}\">Remove</button>
            </div>
          </div>
        `).join('');

        filesList.querySelectorAll('button[data-download]').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.download;
            const current = (readData().uploadedFiles || []).find(f => f.id === id);
            if (!current) return alert('File not found.');
            const a = document.createElement('a');
            a.href = current.dataUrl;
            a.download = current.name || 'attachment';
            document.body.appendChild(a);
            a.click();
            a.remove();
          });
        });

        filesList.querySelectorAll('button[data-remove]').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.remove;
            const data = readData();
            data.uploadedFiles = (data.uploadedFiles || []).filter(f => f.id !== id);
            data.recent = (data.recent || []).concat([`Removed attachment ${id}`]);
            saveData(data);
            renderFilesList();
          });
        });
      }

      function storeUploadedFile(file, dataUrl) {
        const data = readData();
        data.uploadedFiles = data.uploadedFiles || [];
        data.uploadedFiles.push({
          id: 'file_' + Date.now(),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          uploadedAt: new Date().toISOString()
        });
        data.recent = (data.recent || []).concat([`Attached ${file.name}`]);
        saveData(data);
        renderFilesList();
        alert(`${file.name} stored locally for your demo.`);
      }

      renderFilesList();

      function render(q = '') {
        const d = readData();
        tbody.innerHTML = '';
        (d.students || []).filter(s => {
          if (!q) return true;
          const s2 = q.toLowerCase(); return (s.name || '').toLowerCase().includes(s2) || (s.adm || '').toLowerCase().includes(s2) || (s.cls || '').toLowerCase().includes(s2);
        }).forEach(s => {
          const guardian = parentNameById(s.guardianId) || s.guardianName || (s.guardianPhoneDisplay || '—');
          const teacher = staffNameById(s.classTeacherId) || '—';
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${escapeHtml(s.adm)}</td>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.cls || '')}</td>
          <td>${escapeHtml(guardian)}</td>
          <td>${escapeHtml(formatCurrency(s.feeBalance || 0))}</td>
          <td>${escapeHtml(s.paymentStatus || '—')}</td>
          <td>
            <button class="btn ghost btn-edit" data-id="${s.adm}">Edit</button>
            <button class="btn ghost btn-del" data-id="${s.adm}">Delete</button>
            <button class="btn ghost btn-qr" data-id="${s.adm}">QR</button>
          </td>`;
          tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', () => editStudent(b.dataset.id)));
        tbody.querySelectorAll('.btn-del').forEach(b => b.addEventListener('click', () => {
          if (!confirm('Delete student?')) return;
          const adm = b.dataset.id; const d = readData(); d.students = (d.students || []).filter(x => x.adm !== adm); d.recent = (d.recent || []).concat([`Student ${adm} deleted`]); saveData(d);
          render(searchInput.value.trim()); initDashboard();
        }));
        tbody.querySelectorAll('.btn-qr').forEach(b => b.addEventListener('click', () => showQr(b.dataset.id)));
      }

      function formatCurrency(n) {
        if (n === undefined || n === null) return 'KSh 0';
        return 'KSh ' + Number(n).toLocaleString();
      }

      function addStudent() {
        // Build form with grouped sections
        const data = readData();
        const parentOptions = (data.parents || []).map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
        const teacherOptions = (data.staff || []).filter(s => s.approved).map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');

        showModal('Add Student', `
        <div style="display:flex;flex-direction:column;gap:8px;max-width:700px">
          <h4>School Information</h4>
          <input id="m_schoolName" placeholder="School Name" value="Green Valley Academy">
          <div style="display:flex;gap:8px">
            <input id="m_acadFrom" type="date" style="flex:1">
            <input id="m_acadTo" type="date" style="flex:1">
            <input id="m_currentTerm" placeholder="Current Term" style="flex:1">
          </div>

          <h4>Guardian Information</h4>
          <select id="m_guardianId"><option value="">-- Select guardian --</option>${parentOptions}</select>
          <div id="m_guardian_phone"></div>
          <input id="m_guardian_relationship" placeholder="Relationship (e.g. Mother)">

          <h4>Academic Information</h4>
          <div style="display:flex;gap:8px">
            <input id="m_adm" placeholder="Admission No" style="flex:1">
            <input id="m_name" placeholder="Full name" style="flex:2">
          </div>
          <div style="display:flex;gap:8px">
            <input id="m_currentGrade" placeholder="Current Grade" style="flex:1">
            <input id="m_cls" placeholder="Class (e.g. 4B)" style="flex:1">
            <select id="m_classTeacherId" style="flex:1"><option value="">-- Class teacher --</option>${teacherOptions}</select>
          </div>
          <input id="m_yearOfCompletion" placeholder="Year of Completion">

          <h4>Fee Information</h4>
          <div style="display:flex;gap:8px">
            <input id="m_feeBalance" placeholder="Fee balance (numbers only)" style="flex:1">
            <input id="m_lastPaymentDate" type="date" style="flex:1">
            <select id="m_paymentStatus" style="flex:1"><option>Cleared</option><option>Pending</option><option>Overdue</option></select>
          </div>

          <div style="text-align:right;margin-top:8px"><button id="m_cancel" class="btn ghost">Cancel</button> <button id="m_save" class="btn">Save</button></div>
        </div>
      `);

        // phone widget
        const phoneWidget = createPhoneInputs({});
        document.getElementById('m_guardian_phone').appendChild(phoneWidget.container);

        document.getElementById('m_cancel').onclick = closeModal;
        document.getElementById('m_save').onclick = () => {
          try {
            const adm = document.getElementById('m_adm').value.trim();
            const name = document.getElementById('m_name').value.trim();
            if (!adm || !name) {
              alert('Admission number and name are required');
              return;
            }
            const d = readData();
            if ((d.students || []).find(s => s.adm === adm)) {
              alert('Admission number already exists');
              return;
            }

            const guardianId = document.getElementById('m_guardianId').value || null;
            const { countryCode, phone, display } = phoneWidget.getter();
            const guardianRelationship = document.getElementById('m_guardian_relationship').value.trim();
            const schoolName = document.getElementById('m_schoolName').value.trim();
            const acadFrom = document.getElementById('m_acadFrom').value;
            const acadTo = document.getElementById('m_acadTo').value;
            const currentTerm = document.getElementById('m_currentTerm').value;
            const yearOfCompletion = document.getElementById('m_yearOfCompletion').value.trim();
            const currentGrade = document.getElementById('m_currentGrade').value.trim();
            const cls = document.getElementById('m_cls').value.trim();
            const classTeacherId = document.getElementById('m_classTeacherId').value || null;
            const feeBalance = Number(document.getElementById('m_feeBalance').value || 0);
            const lastPaymentDate = document.getElementById('m_lastPaymentDate').value || '';
            const paymentStatus = document.getElementById('m_paymentStatus').value || 'Pending';

            const student = {
              adm, name, cls,
              guardianId, guardianPhoneDisplay: display, relationship: guardianRelationship,
              schoolName, academicYearFrom: acadFrom, academicYearTo: acadTo, currentTerm,
              yearOfCompletion, currentGrade, classTeacherId,
              feeBalance, lastPaymentDate, paymentStatus,
              qr: adm
            };
            d.students = d.students || [];
            d.students.push(student);
            d.recent = (d.recent || []).concat([`Student ${name} (${adm}) added`]);
            saveData(d);
            closeModal();
            render();
            initDashboard();
          } catch (e) {
            console.error('Error adding student:', e);
            alert('Error adding student. Please try again.');
          }
        };
      }

      function editStudent(adm) {
        const d = readData(); const s = (d.students || []).find(x => x.adm === adm); if (!s) return alert('Student not found');
        const parentOptions = (d.parents || []).map(p => `<option value="${p.id}" ${p.id === s.guardianId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('');
        const teacherOptions = (d.staff || []).filter(st => st.approved).map(t => `<option value="${t.id}" ${t.id === s.classTeacherId ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('');

        showModal(`Edit Student — ${escapeHtml(s.name)}`, `
        <div style="display:flex;flex-direction:column;gap:8px;max-width:700px">
          <h4>School Information</h4>
          <input id="m_schoolName" placeholder="School Name" value="${escapeHtml(s.schoolName || '')}">
          <div style="display:flex;gap:8px">
            <input id="m_acadFrom" type="date" style="flex:1" value="${escapeHtml(s.academicYearFrom || '')}">
            <input id="m_acadTo" type="date" style="flex:1" value="${escapeHtml(s.academicYearTo || '')}">
            <input id="m_currentTerm" placeholder="Current Term" style="flex:1" value="${escapeHtml(s.currentTerm || '')}">
          </div>

          <h4>Guardian Information</h4>
          <select id="m_guardianId"><option value="">-- Select guardian --</option>${parentOptions}</select>
          <div id="m_guardian_phone"></div>
          <input id="m_guardian_relationship" placeholder="Relationship" value="${escapeHtml(s.relationship || '')}">

          <h4>Academic Information</h4>
          <div style="display:flex;gap:8px">
            <input id="m_adm" value="${escapeHtml(s.adm)}" disabled style="flex:1">
            <input id="m_name" value="${escapeHtml(s.name)}" style="flex:2">
          </div>
          <div style="display:flex;gap:8px">
            <input id="m_currentGrade" value="${escapeHtml(s.currentGrade || '')}" style="flex:1">
            <input id="m_cls" value="${escapeHtml(s.cls || '')}" style="flex:1">
            <select id="m_classTeacherId" style="flex:1"><option value="">-- Class teacher --</option>${teacherOptions}</select>
          </div>
          <input id="m_yearOfCompletion" placeholder="Year of Completion" value="${escapeHtml(s.yearOfCompletion || '')}">

          <h4>Fee Information</h4>
          <div style="display:flex;gap:8px">
            <input id="m_feeBalance" placeholder="Fee balance (numbers only)" style="flex:1" value="${escapeHtml(s.feeBalance || 0)}">
            <input id="m_lastPaymentDate" type="date" style="flex:1" value="${escapeHtml(s.lastPaymentDate || '')}">
            <select id="m_paymentStatus" style="flex:1">
              <option ${s.paymentStatus === 'Cleared' ? 'selected' : ''}>Cleared</option>
              <option ${s.paymentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
              <option ${s.paymentStatus === 'Overdue' ? 'selected' : ''}>Overdue</option>
            </select>
          </div>

          <div style="text-align:right;margin-top:8px"><button id="m_cancel" class="btn ghost">Cancel</button> <button id="m_save" class="btn">Save</button></div>
        </div>
      `);

        // phone widget (attempt to parse existing display)
        const existingPhone = parsePhoneDisplay(s.guardianPhoneDisplay || '');
        const phoneWidget = createPhoneInputs(existingPhone);
        document.getElementById('m_guardian_phone').appendChild(phoneWidget.container);
        if (s.guardianId) document.getElementById('m_guardianId').value = s.guardianId;

        document.getElementById('m_cancel').onclick = closeModal;
        document.getElementById('m_save').onclick = () => {
          try {
            const name = document.getElementById('m_name').value.trim();
            if (!name) {
              alert('Name is required');
              return;
            }
            s.name = name;
            s.guardianId = document.getElementById('m_guardianId').value || null;
            const { countryCode, phone, display } = phoneWidget.getter();
            s.guardianPhoneDisplay = display;
            s.relationship = document.getElementById('m_guardian_relationship').value.trim();
            s.schoolName = document.getElementById('m_schoolName').value.trim();
            s.academicYearFrom = document.getElementById('m_acadFrom').value;
            s.academicYearTo = document.getElementById('m_acadTo').value;
            s.currentTerm = document.getElementById('m_currentTerm').value.trim();
            s.yearOfCompletion = document.getElementById('m_yearOfCompletion').value.trim();
            s.currentGrade = document.getElementById('m_currentGrade').value.trim();
            s.cls = document.getElementById('m_cls').value.trim();
            s.classTeacherId = document.getElementById('m_classTeacherId').value || null;
            const feeBalanceInput = document.getElementById('m_feeBalance').value;
            s.feeBalance = isNaN(Number(feeBalanceInput)) ? 0 : Number(feeBalanceInput);
            s.lastPaymentDate = document.getElementById('m_lastPaymentDate').value || '';
            s.paymentStatus = document.getElementById('m_paymentStatus').value || 'Pending';
            const d = readData();
            d.recent = (d.recent || []).concat([`Student ${s.name} (${s.adm}) updated`]);
            saveData(d);
            closeModal();
            render(searchInput.value.trim());
            initDashboard();
          } catch (e) {
            console.error('Error updating student:', e);
            alert('Error updating student. Please try again.');
          }
        };
      }

      function showQr(adm) {
        const d = readData(); const s = (d.students || []).find(x => x.adm === adm); if (!s) return;
        const qrSrc = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(s.qr || s.adm)}&choe=UTF-8`;
        showModal(`QR — ${escapeHtml(s.name)}`, `<div style="display:flex;gap:12px;align-items:center"><img src="${qrSrc}" alt="qr"><div><p class="muted">Payload:</p><code>${escapeHtml(s.qr || s.adm)}</code><div style="margin-top:8px"><a class="btn" href="${qrSrc}" download="${s.adm}-qr.png">Download</a><button id="m_close" class="btn ghost" style="margin-left:8px">Close</button></div></div></div>`);
        document.getElementById('m_close').onclick = closeModal;
      }

      if (dataInput) {
        dataInput.addEventListener('change', (evt) => {
          const file = evt.target.files[0];
          if (!file) return;
          const name = file.name.toLowerCase();
          const resetInput = () => { dataInput.value = ''; };

          try {
            if (name.endsWith('.csv')) {
              const reader = new FileReader();
              reader.onload = (e) => {
                try {
                  const lines = e.target.result.split(/\\r?\\n/).map(line => line.trim()).filter(Boolean);
                  const rows = lines.map(line => line.split(','));
                  importStudentRows(rows, 'CSV');
                  const encoded = btoa(unescape(encodeURIComponent(e.target.result)));
                  storeUploadedFile(file, `data:text/csv;base64,${encoded}`);
                } catch (error) {
                  alert('Error processing CSV file. Please confirm the format.');
                }
              };
              reader.readAsText(file);
            } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
              if (typeof XLSX === 'undefined') {
                alert('Excel import requires an internet connection to load the XLSX library.');
              } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                    importStudentRows(rows, 'Excel');
                    const binary = Array.from(new Uint8Array(e.target.result)).map(b => String.fromCharCode(b)).join('');
                    const base64 = btoa(binary);
                    storeUploadedFile(file, `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`);
                  } catch (error) {
                    console.error('Excel import error:', error);
                    alert('Unable to process that Excel file.');
                  }
                };
                reader.readAsArrayBuffer(file);
              }
            } else if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (e) => storeUploadedFile(file, e.target.result);
              reader.readAsDataURL(file);
            } else {
              alert('Unsupported file type. Please upload CSV, Excel, or image files.');
            }
          } catch (error) {
            console.error('Import error:', error);
            alert('Failed to process the selected file.');
          } finally {
            resetInput();
          }
        });
      }

      addBtn.onclick = addStudent;
      if (searchInput) searchInput.oninput = () => render(searchInput.value.trim());
      render();
    } catch (e) {
      console.error('Error initializing students page:', e);
      alert('Error loading students page. Please refresh.');
    }
  };

  function parsePhoneDisplay(display) {
    // input like "+254 712345678" or "+254712345678" -> return {countryCode, phone}
    if (!display) return { countryCode: '+254', phone: '' };
    const m = display.trim().match(/^(\+\d{1,4})\s*(\d+)$/);
    if (m) return { countryCode: m[1], phone: m[2] };
    // fallback
    return { countryCode: '+254', phone: display.replace(/[^0-9]/g, '') };
  }

  /* ------------------ Page: Settings ------------------ */
  window.initSettingsPage = function () {
    try {
      seedIfEmpty();
      const profileName = document.getElementById('profileName');
      const profileEmail = document.getElementById('profileEmail');
      const saveBtn = document.getElementById('saveProfileBtn');
      const oldPw = document.getElementById('oldPw');
      const newPw = document.getElementById('newPw');
      const changePwBtn = document.getElementById('changePwBtn');

      if (profileName) {
        try {
          profileName.value = localStorage.getItem('sv_admin_name') || 'Admin';
        } catch (e) {
          profileName.value = 'Admin';
        }
      }
      if (profileEmail) {
        try {
          profileEmail.value = localStorage.getItem('sv_admin_email') || '';
        } catch (e) {
          profileEmail.value = '';
        }
      }

      if (saveBtn && profileName && profileEmail) {
        saveBtn.onclick = () => {
          try {
            localStorage.setItem('sv_admin_name', profileName.value.trim());
            localStorage.setItem('sv_admin_email', profileEmail.value.trim());
            alert('Profile saved (client-side).');
          } catch (e) {
            console.error('Error saving profile:', e);
            alert('Error saving profile. Please check your browser storage settings.');
          }
        };
      }
      if (changePwBtn && oldPw && newPw) {
        changePwBtn.onclick = () => {
          if (!oldPw.value || !newPw.value) {
            alert('Please fill both password fields');
            return;
          }
          alert('Password changed (mock). Replace with backend call.');
          oldPw.value = '';
          newPw.value = '';
        };
      }
    } catch (e) {
      console.error('Error initializing settings page:', e);
    }
  };

  /* ------------------ Modal helpers ------------------ */
  window.showModal = function (title, htmlContent) {
    try {
      closeModal(); // ensure single
      const modalRoot = document.createElement('div');
      modalRoot.className = 'modal-backdrop';
      modalRoot.innerHTML = `<div class="modal"><h3>${escapeHtml(title)}</h3><div>${htmlContent}</div></div>`;
      document.body.appendChild(modalRoot);
      // Close modal on backdrop click
      modalRoot.addEventListener('click', function (e) {
        if (e.target === modalRoot) closeModal();
      });
    } catch (e) {
      console.error('Error showing modal:', e);
      alert('Error displaying dialog. Please refresh the page.');
    }
  };
  window.closeModal = function () {
    try {
      const m = document.querySelector('.modal-backdrop');
      if (m) m.remove();
    } catch (e) {
      console.error('Error closing modal:', e);
    }
  };

  // expose debug helpers
  window.__sv_admin = { readData, saveData, seedIfEmpty };

  // seed immediately if needed
  seedIfEmpty();

})(); 
