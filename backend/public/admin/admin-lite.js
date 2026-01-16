// Admin utilities and page initializers (dashboard, students, parents, staff)
// Uses shared api-client.js: studentsAPI, parentsAPI, staffAPI, authAPI

(function () {
  const userData = JSON.parse(localStorage.getItem('sv_user_data') || '{}');
  const currentPage = window.location.pathname.split('/').pop();

  // If secretary is trying to access standard admin pages, redirect to professional secretary dashboard
  const secretaryAllowedPages = ['secretary_dashboard.html', 'secretary_visitors.html', 'secretary_settings.html', 'admin_login.html'];

  if (userData.role === 'secretary' && !secretaryAllowedPages.includes(currentPage) && currentPage !== '') {
    console.log('Redirecting secretary to professional dashboard...');
    window.location.href = '/admin/secretary_dashboard.html';
  }
})();

// ---------- shared helpers ----------
function backToHome() {
  window.location.href = '/';
}

function logout() {
  if (window.authAPI && typeof window.authAPI.logout === 'function') {
    return window.authAPI.logout();
  }
  localStorage.removeItem('sv_auth_token');
  localStorage.removeItem('sv_user_data');
  localStorage.removeItem('sv_admin_token');
  localStorage.removeItem('sv_admin_email');
  window.location.href = '/';
}

function setAdminWelcome() {
  const adminEmail = localStorage.getItem('sv_admin_email') || 'admin';
  const el = document.querySelector('[data-admin-name]');
  if (el) el.textContent = adminEmail.split('@')[0];
}

function setText(sel, value) {
  const el = document.querySelector(sel);
  if (el) el.textContent = value ?? '0';
}

// ---------- dashboard ----------
async function loadCounts() {
  try {
    const [students, parents, staff, visitors] = await Promise.all([
      studentsAPI.getAll().catch(() => []),
      parentsAPI.getAll().catch(() => []),
      staffAPI.getAll().catch(() => []),
      visitorsAPI.getAll().catch(() => []),
    ]);
    const pendingStaff = staff.filter((s) => (s.status || '').toLowerCase() !== 'approved' && !s.approved).length;
    setText('#countStudents', students.length);
    setText('#countParents', parents.length);
    setText('#countStaff', staff.length);
    setText('#countPending', pendingStaff);

    // Update visitor count if element exists
    const visitorCountEl = document.querySelector('#countVisitors');
    if (visitorCountEl) visitorCountEl.textContent = visitors.length;

    renderRecent(students, parents, staff, visitors);
  } catch (err) {
    console.error('loadCounts error', err);
  }
}

function renderRecent(students = [], parents = [], staff = [], visitors = []) {
  const list = document.querySelector('#recentList');
  if (!list) return;
  const items = [];
  if (students[0]) items.push(`New student: ${students[0].name || students[0].adm}`);
  if (parents[0]) items.push(`New parent: ${parents[0].name || parents[0].email}`);
  if (staff[0]) items.push(`New staff: ${staff[0].name || staff[0].staff_no}`);
  if (visitors[0]) items.push(`New visitor: ${visitors[0].name || visitors[0].id}`);
  list.innerHTML = items.length
    ? items.map((t) => `<li>${t}</li>`).join('')
    : '<li>No recent activity yet.</li>';
}

async function initDashboardPage() {
  await loadCounts();
  await loadCharts();
}

// ---------- students ----------
let studentsCache = [];
let parentsCache = [];
let staffCache = [];
const photoBlobMap = {};
const STUDENT_PHOTO_PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';

function filterStudents(term) {
  const q = term.trim().toLowerCase();
  const unpaidOnly = document.querySelector('#filterUnpaid')?.checked;

  let filtered = studentsCache;
  if (unpaidOnly) {
    filtered = filtered.filter(s => (parseFloat(s.fee_balance) || 0) > 0);
  }

  if (!q) return filtered;
  return filtered.filter((s) =>
    [s.name, s.adm, s.class, s.stream, s.parent_name, s.parent_email]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(q))
  );
}

function renderStudentsTable(list) {
  const tbody = document.querySelector('#studentsBody');
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="13">No students found.</td></tr>';
    return;
  }
  tbody.innerHTML = list
    .map(
      (s) => {
        // Meal Card Reality Check
        let mealStatus = '<span class="status-chip pending">No Data</span>';
        if (s.meal_card_validity) {
          const expiry = new Date(s.meal_card_validity);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          if (expiry >= now) {
            mealStatus = `<span class="status-chip approved">Valid (${s.meal_card_validity})</span>`;
          } else {
            mealStatus = `<span class="status-chip delete" style="background:#ef4444; color:white;">Expired (${s.meal_card_validity})</span>`;
          }
        }

        return `<tr>
        <td><input type="checkbox" style="width:16px; height:16px; cursor:pointer;"></td>
        <td>${s.adm || ''}</td>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${s.localPhoto || STUDENT_PHOTO_PLACEHOLDER}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:1px solid #cbd5e1;" alt="Img">
            <span style="font-weight:600; color:#334155;">${s.name || ''}</span>
          </div>
        </td>
        <td>${s.upi || s.nemis || s.nemis_number || ''}</td>
        <td>${s.house || ''}</td>
        <td>${s.class || ''}</td>
        <td>${s.stream || ''}</td>
        <td>${s.kcpe || s.kcpe_marks || s.kcpe_score || ''}</td>
        <td>${s.contacts || s.contact || s.parent_phone || ''}</td>
        <td>${s.gender || ''}</td>
        <td>${s.parent_name || s.parent_email || ''}</td>
        <td>${mealStatus}</td>
        <td>${s.fee_balance ?? '0.00'}</td>
        <td>
          <button class="btn-small" data-edit-student="${s.id ?? s.adm}">Edit</button>
          <button class="btn-small" data-delete-student="${s.id ?? s.adm}">Delete</button>
        </td>
      </tr>`;
      }
    )
    .join('');
}

function openStudentModal(student) {
  const modal = document.querySelector('#studentModal');
  if (!modal) return;
  modal.classList.add('show');
  modal.dataset.studentId = student?.id ?? student?.adm ?? '';
  modal.querySelector('#studentAdm').value = student?.adm || '';
  modal.querySelector('#studentName').value = student?.name || '';
  modal.querySelector('#studentUpi').value = student?.upi || '';
  modal.querySelector('#studentClass').value = student?.class || '';
  modal.querySelector('#studentStream').value = student?.stream || '';
  modal.querySelector('#studentHouse').value = student?.house || '';
  modal.querySelector('#studentKCPE').value = student?.kcpe || '';
  modal.querySelector('#studentContacts').value = student?.contacts || student?.parent_phone || '';
  modal.querySelector('#studentGender').value = student?.gender || '';
  modal.querySelector('#studentFee').value = student?.fee_balance ?? '';
  modal.querySelector('#studentMealValid').value = student?.meal_card_validity ? student.meal_card_validity.split('T')[0] : '';
  modal.querySelector('#studentParentName').value = student?.parent_name || '';
  modal.querySelector('#studentParentEmail').value = student?.parent_email || '';
}

function closeStudentModal() {
  const modal = document.querySelector('#studentModal');
  if (modal) modal.classList.remove('show');
}

async function saveStudent(event) {
  event.preventDefault();
  const modal = document.querySelector('#studentModal');
  const id = modal?.dataset.studentId;
  const payload = {
    adm: document.querySelector('#studentAdm').value.trim(),
    name: document.querySelector('#studentName').value.trim(),
    upi: document.querySelector('#studentUpi').value.trim() || null,
    class: document.querySelector('#studentClass').value.trim(),
    stream: document.querySelector('#studentStream').value.trim(),
    house: document.querySelector('#studentHouse').value.trim() || null,
    kcpe: document.querySelector('#studentKCPE').value.trim() || null,
    contacts: document.querySelector('#studentContacts').value.trim() || null,
    gender: document.querySelector('#studentGender').value.trim() || null,
    fee_balance: parseFloat(document.querySelector('#studentFee').value || 0) || 0,
    meal_card_validity: document.querySelector('#studentMealValid').value || null,
    parent_name: document.querySelector('#studentParentName').value.trim() || null,
    parent_email: document.querySelector('#studentParentEmail').value.trim() || null,
  };
  try {
    if (!payload.adm || !payload.name) throw new Error('Admission and Name are required');
    if (id) {
      await studentsAPI.update(id, payload);
    } else {
      await studentsAPI.create(payload);
    }
    await loadStudents();
    closeStudentModal();
  } catch (err) {
    alert(`Save failed: ${err.message}`);
  }
}

async function loadStudents() {
  try {
    studentsCache = await studentsAPI.getAll();
    renderStudentsTable(studentsCache);
  } catch (err) {
    console.error('students load failed', err);
    alert('Failed to load students.');
  }
}

async function importStudentsFromFile(file) {
  const isExcel = /\.xlsx?$/i.test(file.name);
  const isCsv = /\.csv$/i.test(file.name);
  if (!isExcel && !isCsv) throw new Error('Please select a CSV or Excel file');

  const parseRows = async () => {
    if (isCsv) {
      const text = await file.text();
      return text
        .split(/\r?\n/)
        .map((line) => line.split(',').map((c) => c.trim()))
        .filter((row) => row.some((c) => c.length));
    }
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(firstSheet, { header: 1, blankrows: false });
  };

  const normalize = (val) => (val ?? '').toString().trim();
  const rows = await parseRows();
  if (!rows.length) throw new Error('File is empty.');

  const header = rows[0].map((h) => normalize(h).toLowerCase());
  const idx = (name) => header.indexOf(name);
  const getRow = (row) => {
    const map = (name) => (idx(name) >= 0 ? normalize(row[idx(name)]) : '');
    const adm = map('admission number') || map('adm') || map('admission');
    const name = map('name');
    if (!adm || !name) return null;
    const upi = map('upi') || map('nemis') || map('upi number');
    const house = map('house');
    const kcpe = map('kcpe') || map('kcpe score');
    const contacts = map('contacts') || map('contact') || map('phone');
    const gender = map('gender') || map('sex');
    return {
      adm,
      name,
      class: map('class'),
      stream: map('stream'),
      fee_balance: parseFloat(map('fee balance')) || 0,
      parent_name: map('parent name') || map('guardian name') || null,
      parent_email: map('parent email') || map('guardian email') || null,
      parent_phone: map('parent phone') || map('guardian phone') || map('phone') || null,
      relationship: map('relationship') || map('guardian relationship') || null,
      address: map('address') || map('residence') || null,
      upi,
      house,
      kcpe,
      contacts,
      gender,
    };
  };

  const students = rows.slice(1).map(getRow).filter(Boolean);
  if (!students.length) throw new Error('No valid student rows found.');

  let ok = 0;
  let processed = 0;
  setProgressStatus('import', 5, 'Importing students…');
  for (const s of students) {
    try {
      await studentsAPI.create(s);
      ok += 1;
    } catch (e) {
      // try update if exists
      try {
        await studentsAPI.update(s.adm, s);
        ok += 1;
      } catch (err) {
        console.error(`Row failed (${s.adm}):`, err);
      }
    }
    processed += 1;
    const percent = Math.min(95, Math.round((processed / students.length) * 90));
    setProgressStatus('import', percent, `Processing ${processed}/${students.length}…`);
  }
  await loadStudents();
  setProgressStatus('import', 100, `Imported/updated ${ok} students.`, 'success');
  setTimeout(() => setProgressStatus('import', 0, ''), 1200);
  alert(`Imported/updated ${ok} students.`);
}

function initStudentsPage() {
  loadStudents();

  const search = document.querySelector('#studentSearch');
  if (search) {
    search.addEventListener('input', () => renderStudentsTable(filterStudents(search.value)));
  }

  const unpaidFilter = document.querySelector('#filterUnpaid');
  if (unpaidFilter) {
    unpaidFilter.addEventListener('change', () => {
      const term = search ? search.value : '';
      renderStudentsTable(filterStudents(term));
    });
  }

  const addBtn = document.querySelector('#addStudentBtn');
  if (addBtn) addBtn.onclick = () => openStudentModal(null);

  const modalForm = document.querySelector('#studentForm');
  if (modalForm) modalForm.addEventListener('submit', saveStudent);
  const modalClose = document.querySelector('#closeStudentModal');
  if (modalClose) modalClose.onclick = closeStudentModal;

  const tbody = document.querySelector('#studentsBody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-edit-student]');
      const delBtn = e.target.closest('[data-delete-student]');
      if (editBtn) {
        const id = editBtn.dataset.editStudent;
        const student = studentsCache.find((s) => `${s.id ?? s.adm}` === id);
        openStudentModal(student || null);
        return;
      }
      if (delBtn) {
        const id = delBtn.dataset.deleteStudent;
        deleteStudent(id);
      }
    });
  }

  const importInput = document.querySelector('#importStudentsInput');
  if (importInput) {
    importInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        await importStudentsFromFile(file);
      } catch (err) {
        alert(err.message);
      } finally {
        e.target.value = '';
      }
    });
  }

  // ensure batch photo upload wiring
  if (typeof initPhotoBatchUpload === 'function') initPhotoBatchUpload();
}

// ---------- parents ----------

function renderParentsTable(list) {
  const tbody = document.querySelector('#parentsBody');
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6">No parents found.</td></tr>';
    return;
  }
  tbody.innerHTML = list
    .map(
      (p) => `<tr>
        <td>${p.id ?? ''}</td>
        <td>${p.name ?? ''}</td>
        <td>${p.email ?? ''}</td>
        <td>${p.phone ?? ''}</td>
        <td>${p.relationship ?? ''}</td>
        <td>
          <button class="btn-small" data-edit-parent="${p.id ?? ''}">Edit</button>
          <button class="btn-small" data-delete-parent="${p.id ?? ''}">Delete</button>
        </td>
      </tr>`
    )
    .join('');
}

function openParentModal(parent) {
  const modal = document.querySelector('#parentModal');
  if (!modal) return;
  modal.classList.add('show');
  modal.dataset.parentId = parent?.id ?? '';
  modal.querySelector('#parentName').value = parent?.name || '';
  modal.querySelector('#parentEmail').value = parent?.email || '';
  modal.querySelector('#parentPhone').value = parent?.phone || '';
  modal.querySelector('#parentRelationship').value = parent?.relationship || '';
}

function closeParentModal() {
  const modal = document.querySelector('#parentModal');
  if (modal) modal.classList.remove('show');
}

async function saveParent(event) {
  event.preventDefault();
  const modal = document.querySelector('#parentModal');
  const id = modal?.dataset.parentId;
  const payload = {
    name: document.querySelector('#parentName').value.trim(),
    email: document.querySelector('#parentEmail').value.trim(),
    phone: document.querySelector('#parentPhone').value.trim(),
    relationship: document.querySelector('#parentRelationship').value.trim(),
  };
  try {
    if (!payload.name || !payload.email) throw new Error('Name and Email are required');
    if (id) {
      await parentsAPI.update(id, payload);
    } else {
      await parentsAPI.create(payload);
    }
    await loadParents();
    closeParentModal();
  } catch (err) {
    alert(`Save failed: ${err.message}`);
  }
}

async function loadParents() {
  try {
    parentsCache = await parentsAPI.getAll();
    renderParentsTable(parentsCache);
  } catch (err) {
    console.error('parents load failed', err);
    alert('Failed to load parents.');
  }
}

function initParentsPage() {
  loadParents();

  const addBtn = document.querySelector('#addParentBtn');
  if (addBtn) addBtn.onclick = () => openParentModal(null);

  const form = document.querySelector('#parentForm');
  if (form) form.addEventListener('submit', saveParent);

  const closeBtn = document.querySelector('#closeParentModal');
  if (closeBtn) closeBtn.onclick = closeParentModal;

  const tbody = document.querySelector('#parentsBody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-edit-parent]');
      const del = e.target.closest('[data-delete-parent]');
      if (del) {
        const id = del.dataset.deleteParent;
        deleteParent(id);
        return;
      }
      if (!btn) return;
      const id = btn.dataset.editParent;
      const parent = parentsCache.find((p) => `${p.id}` === id);
      openParentModal(parent || null);
    });
  }
}

// ---------- staff ----------
async function initStaffPage() {
  try {
    staffCache = await staffAPI.getAll();
    renderStaffTable();
  } catch (err) {
    console.error('staff load failed', err);
    const tbody = document.querySelector('#staffBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="color:red; padding:20px; text-align:center;">
        <strong>Error loading data</strong><br>
        ${err.message}<br>
        <button onclick="location.reload()" class="btn-small" style="margin-top:10px;">Retry</button>
    </td></tr>`;
  }

  const addBtn = document.querySelector('#addStaffBtn');
  if (addBtn) addBtn.onclick = () => openStaffModal(null);

  const importInput = document.querySelector('#importStaffInput');
  if (importInput) {
    importInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        await importStaffFromFile(file);
      } catch (err) {
        alert(err.message);
      } finally {
        e.target.value = '';
      }
    });
  }
}

async function importStaffFromFile(file) {
  const isExcel = /\.xlsx?$/i.test(file.name);
  const isCsv = /\.csv$/i.test(file.name);
  if (!isExcel && !isCsv) throw new Error('Please select a CSV or Excel file');

  const parseRows = async () => {
    if (isCsv) {
      const text = await file.text();
      return text
        .split(/\r?\n/)
        .map((line) => line.split(',').map((c) => c.trim()))
        .filter((row) => row.some((c) => c.length));
    }
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(firstSheet, { header: 1, blankrows: false });
  };

  const normalize = (val) => (val ?? '').toString().trim();
  const rows = await parseRows();
  if (!rows.length) throw new Error('File is empty.');

  const header = rows[0].map((h) => normalize(h).toLowerCase());
  const idx = (name) => header.indexOf(name);

  const getRow = (row) => {
    const map = (name) => (idx(name) >= 0 ? normalize(row[idx(name)]) : '');
    const name = map('name') || map('full name');
    const staffNo = map('staff no') || map('staff number') || map('tsc no') || map('id');

    if (!name || !staffNo) return null;

    return {
      name,
      staff_no: staffNo,
      email: map('email'),
      phone: map('phone') || map('mobile'),
      department: map('department'),
      status: 'pending'
    };
  };

  const staffList = rows.slice(1).map(getRow).filter(Boolean);
  if (!staffList.length) throw new Error('No valid staff rows found (requires Name and Staff No cols).');

  let ok = 0;
  let processed = 0;
  // reuse setProgressStatus if available or just alert at end
  // simplified for staff:

  for (const s of staffList) {
    try {
      await staffAPI.create(s);
      ok += 1;
    } catch (e) {
      try {
        // Optionally update if exists, but staff API update needs ID, we only have staff_no here.
        // We'd need to find ID by staff_no from cache first. 
        const existing = staffCache.find(ex => ex.staff_no === s.staff_no);
        if (existing) {
          await staffAPI.update(existing.id, s);
          ok += 1;
        }
      } catch (err) {
        console.error(`Row failed (${s.staff_no}):`, err);
      }
    }
    processed++;
  }

  staffCache = await staffAPI.getAll();
  renderStaffTable();
  alert(`Imported/updated ${ok} staff members.`);
}

function renderStaffTable() {
  const tbody = document.querySelector('#staffBody');
  if (!tbody) return;
  if (!staffCache.length) {
    tbody.innerHTML = '<tr><td colspan="7">No staff found.</td></tr>';
    return;
  }
  tbody.innerHTML = staffCache
    .map(
      (s) => {
        const userId = s.id;
        // Staff is approved if either status='approved' or approved flag is true
        const isApproved = (s.status || '').toLowerCase() === 'approved' || s.approved === true || s.approved === 'true';
        const statusLabel = isApproved ? 'Approved' : (s.status === 'disabled' ? 'Disabled' : 'Pending');
        const statusClass = isApproved ? 'approved' : (s.status === 'disabled' ? 'delete' : 'pending');

        return `<tr>
        <td>${s.name || ''}</td>
        <td>${s.staff_no || '<span style="color:#94a3b8; font-style:italic;">Not Assigned</span>'}</td>
        <td>${s.email || ''}</td>
        <td>${s.phone || ''}</td>
        <td>${s.department || ''}</td>
        <td><span class="status-chip ${statusClass}">${statusLabel}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            ${!isApproved
            ? `<button class="btn-small" style="background:#10b981;" data-approve-staff="${userId}">Approve</button>`
            : ''
          }
            <button class="btn-small" data-edit-staff="${userId}">Edit</button>
            <button class="btn-small" style="background:#ef4444;" data-delete-staff="${userId}">Delete</button>
          </div>
        </td>
      </tr>`;
      }
    )
    .join('');
}

function openStaffModal(staff) {
  const modal = document.querySelector('#staffModal');
  if (!modal) return;
  modal.classList.add('show');
  modal.dataset.staffId = staff?.id || staff?._id || '';
  modal.querySelector('#staffName').value = staff?.name || '';
  modal.querySelector('#staffNo').value = staff?.staff_no || '';
  modal.querySelector('#staffEmail').value = staff?.email || '';
  modal.querySelector('#staffPhone').value = staff?.phone || '';
  modal.querySelector('#staffDept').value = staff?.department || '';
  modal.querySelector('#staffStatus').value = staff?.status || 'pending';
}

function closeStaffModal() {
  const modal = document.querySelector('#staffModal');
  if (modal) modal.classList.remove('show');
}

async function saveStaff(event) {
  event.preventDefault();
  const modal = document.querySelector('#staffModal');
  const id = modal?.dataset.staffId;
  const payload = {
    name: document.querySelector('#staffName').value.trim(),
    staff_no: document.querySelector('#staffNo').value.trim(),
    email: document.querySelector('#staffEmail').value.trim(),
    phone: document.querySelector('#staffPhone').value.trim(),
    department: document.querySelector('#staffDept').value.trim(),
    status: document.querySelector('#staffStatus').value.trim() || 'pending',
    approved: document.querySelector('#staffStatus').value === 'approved'
  };
  try {
    if (!payload.name || !payload.staff_no) throw new Error('Name and Staff No are required');
    if (id) {
      await staffAPI.update(id, payload);
    } else {
      await staffAPI.create(payload);
    }
    staffCache = await staffAPI.getAll();
    renderStaffTable();
    closeStaffModal();
  } catch (err) {
    alert(`Save failed: ${err.message}`);
  }
}

// Helper for soft-delete backup
function addToDeletedStorage(studentArray) {
  try {
    const raw = localStorage.getItem('sv_deleted_students');
    const data = raw ? JSON.parse(raw) : { students: [] };
    // Add new ones, avoiding duplicates by adm
    for (const s of studentArray) {
      if (!data.students.some(ds => ds.adm === s.adm)) {
        data.students.push(s);
      }
    }
    localStorage.setItem('sv_deleted_students', JSON.stringify(data));
  } catch (e) {
    console.error('Backup failed', e);
  }
}

async function deleteStudent(id) {
  if (!id) return;
  if (!confirm('Delete this student?')) return;
  const student = studentsCache.find(s => (s.id == id || s.adm == id));
  if (student) addToDeletedStorage([student]); // Backup first

  try {
    await studentsAPI.delete(id);
    await loadStudents();
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

async function deleteStaff(id) {
  if (!id) return;
  if (!confirm('Delete this staff member?')) return;
  try {
    await staffAPI.delete(id);
    staffCache = staffCache.filter((s) => `${s.id}` !== `${id}` && `${s._id}` !== `${id}`);
    renderStaffTable();
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

async function approveStaff(id) {
  try {
    await adminAPI.approveStaff(id);
    staffCache = await staffAPI.getAll();
    renderStaffTable();
    await loadCounts();
  } catch (err) {
    alert('Approve failed: ' + err.message);
  }
}

function wireStaffEvents() {
  const addBtn = document.querySelector('#addStaffBtn');
  if (addBtn) addBtn.onclick = () => {
    const modal = document.querySelector('#staffModal');
    if (modal) modal.dataset.staffId = '';
    openStaffModal(null);
  };

  const form = document.querySelector('#staffForm');
  if (form) form.addEventListener('submit', saveStaff);
  const closeBtn = document.querySelector('#closeStaffModal');
  if (closeBtn) closeBtn.onclick = closeStaffModal;
  const tbody = document.querySelector('#staffBody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const approve = e.target.closest('[data-approve-staff]');
      const edit = e.target.closest('[data-edit-staff]');
      const del = e.target.closest('[data-delete-staff]');
      if (approve) {
        approveStaff(approve.dataset.approveStaff);
        return;
      }
      if (del) {
        deleteStaff(del.dataset.deleteStaff);
        return;
      }
      if (edit) {
        const id = edit.dataset.editStaff;
        const staff = staffCache.find((s) => `${s.id}` === id || `${s._id}` === id || `${s.staff_no}` === id);
        openStaffModal(staff || null);
      }
    });
  }
}

// ---------- visitors ----------
let visitorsCache = [];
let visitorsPollInterval = null;

function renderVisitorsTable(list) {
  const tbody = document.querySelector('#visitorsBody');
  if (!tbody) return;
  if (!list || !list.length) {
    tbody.innerHTML = '<tr><td colspan="10">No visitor records found.</td></tr>';
    return;
  }
  tbody.innerHTML = list
    .map(
      (v) => {
        const checkIn = v.check_in_time ? new Date(v.check_in_time).toLocaleString() : '—';
        const checkOut = v.check_out_time ? new Date(v.check_out_time).toLocaleString() : '—';

        let statusLabel = 'Unknown';
        let statusClass = 'status-checked-out'; // default gray
        const s = (v.status || '').toLowerCase();

        if (s === 'checked_in' || s === 'approved') {
          statusLabel = 'Checked In';
          statusClass = 'status-checked-in'; // green
        } else if (s === 'pending') {
          statusLabel = 'Pending';
          statusClass = 'status-pending'; // we will style this yellow
        } else if (s === 'checked_out') {
          statusLabel = 'Checked Out';
          statusClass = 'status-checked-out'; // gray
        } else if (s === 'rejected' || s === 'blacklisted') {
          statusLabel = 'Rejected';
          statusClass = 'status-checked-out'; // gray/red
        }

        const canCheckOut = ['checked_in', 'approved', 'pending'].includes(s);

        return `<tr>
        <td><span style="font-weight:600; color:#334155;">${v.name || ''}</span></td>
        <td>${v.id_number || '—'}</td>
        <td>${v.phone || '—'}</td>
        <td>${v.plate_number || '—'}</td>
        <td>${v.purpose || '—'}</td>
        <td>${v.host_name || '—'}</td>
        <td>${checkIn}</td>
        <td>${checkOut}</td>
        <td><span class="status-badge ${statusClass}" style="${s === 'pending' ? 'background:#fef3c7; color:#b45309;' : ''}">${statusLabel}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            ${canCheckOut
            ? `<button class="btn-small" style="background:#ef4444;" data-delete-visitor="${v.id}">Delete</button>
               <button class="btn-small" style="background:#10b981;" data-checkout-visitor="${v.id}">Check Out</button>`
            : `<button class="btn-small" style="background:#ef4444;" data-delete-visitor="${v.id}">Delete</button>`
          }
          </div>
        </td>
      </tr>`;
      }
    )
    .join('');
}

async function loadVisitors() {
  try {
    visitorsCache = await visitorsAPI.getAll();
    renderVisitorsTable(visitorsCache);
  } catch (err) {
    console.error('visitors load failed', err);
    const tbody = document.querySelector('#visitorsBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="10" style="color:red; padding:20px; text-align:center;">Error loading visitors: ${err.message}</td></tr>`;
  }
}

async function checkOutVisitor(id) {
  if (!confirm('Check out this visitor?')) return;
  try {
    await visitorsAPI.checkOut(id);
    await loadVisitors();
  } catch (err) {
    alert('Check out failed: ' + err.message);
  }
}

async function deleteVisitor(id) {
  if (!confirm('Delete this visitor record?')) return;
  try {
    await visitorsAPI.delete(id);
    await loadVisitors();
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

function initVisitorsPage() {
  loadVisitors();

  // Auto-refresh every 10 seconds
  if (visitorsPollInterval) clearInterval(visitorsPollInterval);
  visitorsPollInterval = setInterval(loadVisitors, 10000);

  const search = document.querySelector('#visitorSearch');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      const filtered = visitorsCache.filter(v =>
        [v.name, v.id_number, v.phone, v.plate_number, v.purpose, v.host_name]
          .filter(Boolean)
          .some(val => val.toLowerCase().includes(q))
      );
      renderVisitorsTable(filtered);
    });
  }

  const refreshBtn = document.querySelector('#refreshVisitorsBtn');
  if (refreshBtn) refreshBtn.onclick = loadVisitors;

  const tbody = document.querySelector('#visitorsBody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const checkout = e.target.closest('[data-checkout-visitor]');
      const del = e.target.closest('[data-delete-visitor]');

      if (checkout) {
        checkOutVisitor(checkout.dataset.checkoutVisitor);
      }
      if (del) {
        deleteVisitor(del.dataset.deleteVisitor);
      }
    });
  }
}

// ---------- bootstrap ----------
document.addEventListener('DOMContentLoaded', () => {
  setAdminWelcome();

  document.querySelectorAll('[data-back-home]').forEach((btn) =>
    btn.addEventListener('click', backToHome)
  );
  document.querySelectorAll('[data-logout]').forEach((btn) =>
    btn.addEventListener('click', logout)
  );

  const page = document.body.getAttribute('data-page');
  if (page === 'dashboard') initDashboardPage();
  if (page === 'students') initStudentsPage();
  if (page === 'parents') initParentsPage();
  if (page === 'staff') initStaffPage();
  if (page === 'visitors') initVisitorsPage();
  wireStaffEvents();
});

// ---------- charts for dashboard ----------
async function loadCharts() {
  const ctxClass = document.getElementById('chartStudentsClass');
  const ctxFee = document.getElementById('chartFeeStatus');
  const ctxStaff = document.getElementById('chartStaffStatus');
  if (typeof Chart === 'undefined') return;

  try {
    const [students, staff] = await Promise.all([
      studentsAPI.getAll().catch(() => []),
      staffAPI.getAll().catch(() => []),
    ]);

    // Student Chart (if exists)
    if (ctxClass) {
      const classCounts = {};
      students.forEach((s) => {
        const c = s.class || 'Unassigned';
        classCounts[c] = (classCounts[c] || 0) + 1;
      });
      const labelsClass = Object.keys(classCounts);
      const dataClass = Object.values(classCounts);
      new Chart(ctxClass, {
        type: 'bar',
        data: { labels: labelsClass, datasets: [{ label: 'Students', data: dataClass, backgroundColor: '#14532d' }] },
        options: { responsive: true, plugins: { legend: { display: false } } },
      });
    }

    // Fee status
    if (ctxFee) {
      const paid = students.filter((s) => !s.fee_balance || parseFloat(s.fee_balance) === 0).length;
      const pending = students.length - paid;
      new Chart(ctxFee, {
        type: 'doughnut',
        data: { labels: ['Paid', 'Pending'], datasets: [{ data: [paid, pending], backgroundColor: ['#22c55e', '#f59e0b'] }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
      });
    }

    // Staff status
    if (ctxStaff) {
      const approved = staff.filter((s) => (s.status || '').toLowerCase() === 'approved' || s.approved === true || s.approved === 'true').length;
      const awaiting = staff.length - approved;
      new Chart(ctxStaff, {
        type: 'doughnut',
        data: { labels: ['Approved', 'Pending'], datasets: [{ data: [approved, awaiting], backgroundColor: ['#2563eb', '#f97316'] }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
      });
    }

    // Visitor status
    const ctxVisitor = document.getElementById('chartVisitorStatus');
    if (ctxVisitor) {
      const visitors = await window.visitorsAPI.getAll().catch(() => []);
      const checkedIn = visitors.filter(v => (v.status || '').toLowerCase() === 'checked_in' || (v.status || '').toLowerCase() === 'approved').length;
      const checkedOut = visitors.filter(v => (v.status || '').toLowerCase() === 'checked_out').length;
      const pending = visitors.length - checkedIn - checkedOut;

      new Chart(ctxVisitor, {
        type: 'doughnut',
        data: {
          labels: ['In', 'Out', 'Pending'],
          datasets: [{
            data: [checkedIn, checkedOut, pending],
            backgroundColor: ['#22c55e', '#64748b', '#f59e0b']
          }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
      });
    }

  } catch (err) {
    console.error('charts load failed', err);
  }
}

// ---------- restore deleted (local) ----------
async function restoreDeletedStudents() {
  const raw = localStorage.getItem('sv_deleted_students');
  if (!raw) {
    alert('No deleted students stored locally to restore.');
    return;
  }
  try {
    const data = JSON.parse(raw);
    const students = data.students || [];
    let ok = 0;
    for (const s of students) {
      try {
        const payload = {
          adm: s.adm || s.id,
          name: s.name || '',
          class: s.class || '',
          stream: s.stream || '',
          fee_balance: s.fee_balance || 0,
          parent_id: s.parent_id || null,
          parent_name: s.parent_name || null,
          parent_email: s.parent_email || null,
        };
        if (!payload.adm || !payload.name) continue;
        try {
          await studentsAPI.create(payload);
        } catch (_) {
          await studentsAPI.update(payload.adm, payload);
        }
        ok += 1;
      } catch (e) {
        console.error('restore failed for', s.adm, e);
      }
    }
    await loadStudents();
    alert(`Restored ${ok} students.`);
  } catch (err) {
    alert('Restore failed: ' + err.message);
  }
}

// ---------- delete all students ----------
// ---------- delete all students ----------
async function deleteAllStudents() {
  if (!confirm('Delete ALL students? This cannot be undone.')) return;
  try {
    const [allStudents, allParents] = await Promise.all([
      studentsAPI.getAll(),
      parentsAPI.getAll().catch(() => []),
    ]);

    // Backup all students before delete
    addToDeletedStorage(allStudents);

    let processed = 0;
    const total = allStudents.length + allParents.length || 1;

    // Animate and delete students
    for (const s of allStudents) {
      try {
        // Visual animation
        const id = s.id ?? s.adm;
        const btn = document.querySelector(`button[data-delete-student="${id}"]`);
        if (btn) {
          const row = btn.closest('tr');
          if (row) {
            row.classList.add('delete-animation');
            // Small visual delay for the "wave" effect
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        await studentsAPI.delete(id);
      } catch (err) {
        console.error('Delete failed for', s.id || s.adm, err);
      }
      processed++;
      setProgressStatus('delete', Math.min(90, Math.round((processed / total) * 90)), 'Deleting students…');
    }

    // Delete parents
    for (const p of allParents) {
      try {
        await parentsAPI.delete(p.id ?? p._id);
      } catch (err) {
        console.error('Delete parent failed for', p.id || p._id, err);
      }
      processed++;
      setProgressStatus('delete', Math.min(95, Math.round((processed / total) * 95)), 'Deleting parents…');
    }

    await loadStudents();
    setProgressStatus('delete', 100, 'All students and parents deleted.', 'success');
    setTimeout(() => setProgressStatus('delete', 0, ''), 1200);
    alert('All students (and related parents) deleted. (Backup saved to Restore bin)');
  } catch (err) {
    alert('Delete all failed: ' + err.message);
  }
}

// ---------- simple progress UI ----------
function setProgressStatus(kind, percent, text, variant = 'info') {
  const bar = document.querySelector(`#${kind}ProgressBar`);
  const label = document.querySelector(`#${kind}ProgressText`);
  const wrap = document.querySelector(`#${kind}ProgressWrap`);
  if (!bar || !label || !wrap) return;
  if (!percent) {
    wrap.style.display = 'none';
    return;
  }
  wrap.style.display = 'flex';
  bar.style.width = `${percent}%`;
  bar.setAttribute('aria-valuenow', percent);
  bar.className = `progress-bar ${variant}`;
  label.textContent = text || '';
}

// ---------- batch photo upload (match by admission number in filename) ----------
function initPhotoBatchUpload() {
  const input = document.querySelector('#photoBatchInput');
  if (!input) return;
  input.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    let matched = 0;
    for (const file of files) {
      const name = file.name.toLowerCase();
      const admMatch = studentsCache.find((s) => name.includes((s.adm || '').toLowerCase()));
      if (admMatch) {
        const url = URL.createObjectURL(file);
        photoBlobMap[admMatch.adm] = url;
        admMatch.localPhoto = url;
        matched++;
      }
    }
    renderStudentsTable(studentsCache);
    alert(`Matched ${matched} photos by admission number.`);
    e.target.value = '';
  });
}

// ---------- delete parent ----------
async function deleteParent(id) {
  if (!id) return;
  if (!confirm('Delete this parent?')) return;
  try {
    await parentsAPI.delete(id);
    parentsCache = parentsCache.filter((p) => `${p.id}` !== `${id}`);
    renderParentsTable(parentsCache);
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}
// Minimal admin utilities for live data rendering
(function () {
  if (typeof window === 'undefined') return;

  const qs = (sel) => document.querySelector(sel);

  async function fetchAll() {
    const [students, parents, staff] = await Promise.all([
      window.studentsAPI?.getAll?.().catch(() => []),
      window.parentsAPI?.getAll?.().catch(() => []),
      window.staffAPI?.getAll?.().catch(() => []),
    ]);
    return { students, parents, staff };
  }

  function setText(id, value) {
    const el = qs(id);
    if (el) el.textContent = value;
  }

  function formatCurrency(val) {
    const num = Number(val) || 0;
    return `KSh ${num.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  }

  // DASHBOARD
  async function renderDashboard() {
    const status = qs('#dashboardStatus');
    try {
      status && (status.textContent = 'Loading data...');
      const { students, parents, staff } = await fetchAll();
      setText('#statStudents', students.length);
      setText('#statParents', parents.length);
      setText('#statStaff', staff.length);
      const pending = staff.filter((s) => !s.approved).length;
      setText('#statPending', pending);

      // Fee summary
      const totalBalance = students.reduce((sum, s) => sum + (parseFloat(s.fee_balance) || 0), 0);
      const fullyPaid = students.filter((s) => !s.fee_balance || parseFloat(s.fee_balance) === 0).length;
      setText('#totalFeeBalance', formatCurrency(totalBalance));
      setText('#fullyPaidCount', fullyPaid);
      setText('#withBalanceCount', students.length - fullyPaid);
      setText('#averageBalance', formatCurrency(students.length ? totalBalance / students.length : 0));

      // Recent list (just show top 5 students by created_at)
      const recent = [...students]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5)
        .map((s) => `${s.name || s.adm || 'Student'} — ${s.class || 'Class ?'}`);
      const list = qs('#recentList');
      if (list) {
        list.innerHTML = '';
        if (!recent.length) {
          list.innerHTML = '<li>No recent activity</li>';
        } else {
          recent.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item;
            list.appendChild(li);
          });
        }
      }
      status && (status.textContent = '');
    } catch (err) {
      console.error('Dashboard load error', err);
      status && (status.textContent = 'Failed to load dashboard data.');
    }
  }

  // STUDENTS
  async function renderStudents() {
    const status = qs('#studentsStatus');
    const tbody = qs('#studentsTableBody');
    if (!tbody) return;
    try {
      status && (status.textContent = 'Loading students...');
      tbody.innerHTML = '';
      const students = await window.studentsAPI.getAll();
      if (!students.length) {
        tbody.innerHTML = '<tr><td colspan="6">No students found.</td></tr>';
        status && (status.textContent = '');
        return;
      }
      students.forEach((s) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.adm || ''}</td>
          <td>${s.name || ''}</td>
          <td>${s.class || ''}</td>
          <td>${s.parent_name || '—'}</td>
          <td>${formatCurrency(s.fee_balance)}</td>
          <td>${s.gender || ''}</td>
        `;
        tbody.appendChild(tr);
      });
      status && (status.textContent = '');
    } catch (err) {
      console.error('Students load error', err);
      status && (status.textContent = 'Failed to load students.');
    }
  }

  // PARENTS
  async function renderParents() {
    const status = qs('#parentsStatus');
    const tbody = qs('#parentsTableBody');
    if (!tbody) return;
    try {
      status && (status.textContent = 'Loading parents...');
      tbody.innerHTML = '';
      const [parents, students] = await Promise.all([
        window.parentsAPI.getAll(),
        window.studentsAPI.getAll(),
      ]);
      if (!parents.length) {
        tbody.innerHTML = '<tr><td colspan="5">No parents found.</td></tr>';
        status && (status.textContent = '');
        return;
      }
      parents.forEach((p) => {
        const linked = students.filter((s) => s.parent_id === p.id).length;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${p.name || ''}</td>
          <td>${p.email || ''}</td>
          <td>${p.phone || ''}</td>
          <td>${linked}</td>
          <td>${p.id}</td>
        `;
        tbody.appendChild(tr);
      });
      status && (status.textContent = '');
    } catch (err) {
      console.error('Parents load error', err);
      status && (status.textContent = 'Failed to load parents.');
    }
  }

  // STAFF
  async function renderStaff() {
    const status = qs('#staffStatus');
    const tbody = qs('#staffTableBody');
    if (!tbody) return;
    try {
      status && (status.textContent = 'Loading staff...');
      tbody.innerHTML = '';
      const staff = await window.staffAPI.getAll();
      if (!staff.length) {
        tbody.innerHTML = '<tr><td colspan="6">No staff found.</td></tr>';
        status && (status.textContent = '');
        return;
      }
      staff.forEach((s) => {
        const isApproved = (s.status || '').toLowerCase() === 'approved' || s.approved === true || s.approved === 'true';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.name || ''}</td>
          <td>${s.staff_no || ''}</td>
          <td>${s.email || ''}</td>
          <td>${s.department || ''}</td>
          <td>${isApproved ? 'Approved' : 'Pending'}</td>
          <td>${s.id}</td>
        `;
        tbody.appendChild(tr);
      });
      status && (status.textContent = '');
    } catch (err) {
      console.error('Staff load error', err);
      status && (status.textContent = 'Failed to load staff.');
    }
  }

  // Expose
  window.adminLite = {
    renderDashboard,
    renderStudents,
    renderParents,
    renderStaff,
  };
})();

