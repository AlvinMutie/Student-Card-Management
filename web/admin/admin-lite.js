// Minimal admin dashboard scripts wired to live API data.
// Uses the shared api-client.js globals: studentsAPI, parentsAPI, staffAPI, authAPI.

function backToHome() {
  window.location.href = '/public/landingpage.html';
}

function logout() {
  if (window.authAPI && typeof window.authAPI.logout === 'function') {
    return window.authAPI.logout();
  }
  localStorage.removeItem('sv_auth_token');
  localStorage.removeItem('sv_user_data');
  window.location.href = '/public/landingpage.html';
}

function setAdminWelcome() {
  const adminEmail = localStorage.getItem('sv_admin_email') || 'admin';
  const el = document.querySelector('[data-admin-name]');
  if (el) el.textContent = adminEmail.split('@')[0];
}

async function loadCounts() {
  try {
    const [students, parents, staff] = await Promise.all([
      studentsAPI.getAll().catch(() => []),
      parentsAPI.getAll().catch(() => []),
      staffAPI.getAll().catch(() => []),
    ]);
    const pending = staff.filter((s) => (s.status || '').toLowerCase() !== 'approved').length;
    setText('#countStudents', students.length);
    setText('#countParents', parents.length);
    setText('#countStaff', staff.length);
    setText('#countPending', pending);
    renderRecent(students, parents, staff);
  } catch (err) {
    console.error('loadCounts error', err);
  }
}

function setText(sel, value) {
  const el = document.querySelector(sel);
  if (el) el.textContent = value ?? '0';
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

async function renderTable({ selector, rows }) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;
  tbody.innerHTML = rows.length
    ? rows
        .map(
          (r) => `<tr>${r.map((cell) => `<td>${cell ?? ''}</td>`).join('')}</tr>`
        )
        .join('')
    : '<tr><td colspan="8">No data yet.</td></tr>';
}

async function initDashboardPage() {
  await loadCounts();
}

async function initStudentsPage() {
  try {
    const students = await studentsAPI.getAll();
    const rows = students.map((s) => [
      s.adm || '',
      s.name || '',
      s.class || '',
      s.stream || '',
      s.parent_name || s.parent_email || '—',
      s.fee_balance != null ? s.fee_balance : '0',
    ]);
    await renderTable({ selector: '#studentsBody', rows });
  } catch (err) {
    console.error('students load failed', err);
  }
}

async function initParentsPage() {
  try {
    const parents = await parentsAPI.getAll();
    const rows = parents.map((p) => [
      p.id || '',
      p.name || '',
      p.email || '',
      p.phone || '',
      p.relationship || '—',
    ]);
    await renderTable({ selector: '#parentsBody', rows });
  } catch (err) {
    console.error('parents load failed', err);
  }
}

async function initStaffPage() {
  try {
    const staff = await staffAPI.getAll();
    const rows = staff.map((s) => [
      s.name || '',
      s.staff_no || '',
      s.email || '',
      s.phone || '',
      s.department || '',
      s.status || 'pending',
    ]);
    await renderTable({ selector: '#staffBody', rows });
  } catch (err) {
    console.error('staff load failed', err);
  }
}

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
});
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

