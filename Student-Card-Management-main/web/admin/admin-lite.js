// Admin utilities and page initializers (dashboard, students, parents, staff)
// Uses shared api-client.js: studentsAPI, parentsAPI, staffAPI, authAPI

// ---------- shared helpers ----------
function backToHome() {
  window.location.href = '/public/landingpage.html';
}

function logout() {
  if (window.authAPI && typeof window.authAPI.logout === 'function') {
    return window.authAPI.logout();
  }
  localStorage.removeItem('sv_auth_token');
  localStorage.removeItem('sv_user_data');
  localStorage.removeItem('sv_admin_token');
  localStorage.removeItem('sv_admin_email');
  window.location.href = '/public/landingpage.html';
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
    const [students, parents, staff] = await Promise.all([
      studentsAPI.getAll().catch(() => []),
      parentsAPI.getAll().catch(() => []),
      staffAPI.getAll().catch(() => []),
    ]);
    const pendingStaff = staff.filter((s) => (s.status || '').toLowerCase() !== 'approved' && !s.approved).length;
    setText('#countStudents', students.length);
    setText('#countParents', parents.length);
    setText('#countStaff', staff.length);
    setText('#countPending', pendingStaff);
    renderRecent(students, parents, staff);
  } catch (err) {
    console.error('loadCounts error', err);
  }
}

function renderRecent(students = [], parents = [], staff = []) {
  const list = document.querySelector('#recentList');
  if (!list) return;
  const items = [];
  if (students[0]) items.push(`New student: ${students[0].name || students[0].adm}`);
  if (parents[0]) items.push(`New parent: ${parents[0].name || parents[0].email}`);
  if (staff[0]) items.push(`New staff: ${staff[0].name || staff[0].staff_no}`);
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
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100" fill="none"><rect width="80" height="100" rx="10" fill="%23e5e7eb"/><circle cx="40" cy="32" r="14" fill="%23cbd5e1"/><path d="M20 86c0-12 9.5-22 20-22s20 10 20 22" fill="%23cbd5e1"/></svg>';

function filterStudents(term) {
  const q = term.trim().toLowerCase();
  if (!q) return studentsCache;
  return studentsCache.filter((s) =>
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
      (s) => `<tr>
        <td><img src="${s.localPhoto || STUDENT_PHOTO_PLACEHOLDER}" style="width:50px; height:65px; border-radius:4px; object-fit:cover; background:#f3f4f6;"></td>
        <td>${s.adm || ''}</td>
        <td>${s.name || ''}</td>
        <td>${s.upi || s.nemis || s.nemis_number || ''}</td>
        <td>${s.house || ''}</td>
        <td>${s.class || ''}</td>
        <td>${s.stream || ''}</td>
        <td>${s.kcpe || s.kcpe_marks || s.kcpe_score || ''}</td>
        <td>${s.contacts || s.contact || s.parent_phone || ''}</td>
        <td>${s.gender || ''}</td>
        <td>${s.parent_name || s.parent_email || ''}</td>
        <td>${s.fee_balance ?? ''}</td>
        <td>
          <button class="btn-small" data-edit-student="${s.id ?? s.adm}">Edit</button>
          <button class="btn-small" data-delete-student="${s.id ?? s.adm}">Delete</button>
        </td>
      </tr>`
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
  }

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
        const staffId = s.id || s._id || s.staff_no;
        const isApproved = (s.status || '').toLowerCase() === 'approved' || s.approved === true;
        const statusLabel = isApproved ? 'Approved' : 'Pending';
        return `<tr>
        <td>${s.name || ''}</td>
        <td>${s.staff_no || ''}</td>
        <td>${s.email || ''}</td>
        <td>${s.phone || ''}</td>
        <td>${s.department || ''}</td>
        <td>${statusLabel}</td>
        <td>
          ${isApproved
            ? '<span class="status-chip approved">Approved</span>'
            : `<button class="btn-small" data-approve-staff="${staffId}">Approve</button>`
          }
          <button class="btn-small" data-edit-staff="${staffId}">Edit</button>
          <button class="btn-small" data-delete-staff="${staffId}">Delete</button>
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
    await staffAPI.update(id, { status: 'approved', approved: true });
    staffCache = await staffAPI.getAll();
    renderStaffTable();
    await loadCounts();
  } catch (err) {
    alert('Approve failed: ' + err.message);
  }
}

function wireStaffEvents() {
  const addBtn = document.querySelector('#addStaffBtn');
  if (addBtn) addBtn.onclick = () => openStaffModal(null);
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
        const staff = staffCache.find((s) => `${s.id}` === edit.dataset.editStaff || `${s._id}` === edit.dataset.editStaff);
        openStaffModal(staff || null);
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
  wireStaffEvents();
});

// ---------- charts for dashboard ----------
async function loadCharts() {
  const ctxClass = document.getElementById('chartStudentsClass');
  const ctxFee = document.getElementById('chartFeeStatus');
  const ctxStaff = document.getElementById('chartStaffStatus');
  if (!ctxClass || !ctxFee || !ctxStaff || typeof Chart === 'undefined') return;

  try {
    const [students, staff] = await Promise.all([
      studentsAPI.getAll().catch(() => []),
      staffAPI.getAll().catch(() => []),
    ]);

    // Students by class
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

    // Fee status
    const paid = students.filter((s) => !s.fee_balance || parseFloat(s.fee_balance) === 0).length;
    const pending = students.length - paid;
    new Chart(ctxFee, {
      type: 'doughnut',
      data: { labels: ['Paid', 'Pending'], datasets: [{ data: [paid, pending], backgroundColor: ['#22c55e', '#f59e0b'] }] },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });

    // Staff status
    const approved = staff.filter((s) => (s.status || '').toLowerCase() === 'approved').length;
    const awaiting = staff.length - approved;
    new Chart(ctxStaff, {
      type: 'doughnut',
      data: { labels: ['Approved', 'Pending'], datasets: [{ data: [approved, awaiting], backgroundColor: ['#2563eb', '#f97316'] }] },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });

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
async function deleteAllStudents() {
  if (!confirm('Delete ALL students? This cannot be undone.')) return;
  try {
    const [allStudents, allParents] = await Promise.all([
      studentsAPI.getAll(),
      parentsAPI.getAll().catch(() => []),
    ]);
    let processed = 0;
    const total = allStudents.length + allParents.length || 1;
    setProgressStatus('delete', 5, 'Deleting records…');
    for (const s of allStudents) {
      try {
        await studentsAPI.delete(s.id ?? s.adm);
      } catch (err) {
        console.error('Delete failed for', s.id || s.adm, err);
      }
      processed++;
      setProgressStatus('delete', Math.min(90, Math.round((processed / total) * 90)), 'Deleting students…');
    }
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
    alert('All students (and related parents) deleted.');
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
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.name || ''}</td>
          <td>${s.staff_no || ''}</td>
          <td>${s.email || ''}</td>
          <td>${s.department || ''}</td>
          <td>${s.approved ? 'Approved' : 'Pending'}</td>
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

