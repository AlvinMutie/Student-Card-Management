/* app.js — Shared admin frontend logic (v2)
   - LocalStorage-backed data model with cross-links
   - injectLayout wraps <main class="main-content"> with sidebar
   - Page initializers: initDashboard, initParentsPage, initStaffPage, initStudentsPage, initSettingsPage
*/
(function(){
  const KEY = 'sv_data_v2';

  /* ------------------ Data helpers ------------------ */
  function readData(){
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch(e){ return {}; }
  }
  function saveData(d){
    localStorage.setItem(KEY, JSON.stringify(d || {}));
  }

  // Safe seed if missing (optional — keep simple demo data)
  function seedIfEmpty(){
    const existing = readData();
    if(existing && (existing.parents || existing.staff || existing.students)) return;
    const initial = {
      parents: [
        { id:'p1', name:'Grace Ndungu', email:'grace@example.com', countryCode:'+254', phone:'712345678', relationship: 'Mother', address:'Nairobi' },
        { id:'p2', name:'John Mwangi', email:'john@example.com', countryCode:'+254', phone:'722123456', relationship: 'Father', address:'Kisumu' }
      ],
      staff: [
        { id:'t1', name:'Alice W', staffNo:'T-901', role:'Math Teacher', department:'Mathematics', approved:true },
        { id:'t2', name:'Robert K', staffNo:'T-902', role:'Science Teacher', department:'Sciences', approved:false }
      ],
      students: [
        {
          adm:'S001', name:'David Kimani', cls:'4B',
          // links use IDs
          guardianId:'p1', guardianPhoneDisplay:'+254 712345678', relationship:'Mother',
          schoolName:'Green Valley Academy', academicYearFrom:'2025-01-01', academicYearTo:'2025-12-31', currentTerm:'Term 2',
          yearOfCompletion:'2028', currentGrade:'Grade 4', classTeacherId:'t1',
          feeBalance:3500, lastPaymentDate:'2025-10-10', paymentStatus:'Pending',
          qr:'S001'
        },
        {
          adm:'S002', name:'Rachel Auma', cls:'6A',
          guardianId:'p2', guardianPhoneDisplay:'+254 722123456', relationship:'Father',
          schoolName:'Green Valley Academy', academicYearFrom:'2025-01-01', academicYearTo:'2025-12-31', currentTerm:'Term 2',
          yearOfCompletion:'2027', currentGrade:'Grade 6', classTeacherId:'t1',
          feeBalance:0, lastPaymentDate:'2025-09-10', paymentStatus:'Cleared',
          qr:'S002'
        }
      ],
      recent: ['System seeded with demo data']
    };
    saveData(initial);
  }

  /* ------------------ Auth helpers ------------------ */
  window.ensureAuthRedirect = function(){
    const token = localStorage.getItem('sv_admin_token');
    if(!token){
      location.href = 'index.html';
    }
  };
  window.doLogout = function(){
    localStorage.removeItem('sv_admin_token');
    localStorage.removeItem('sv_admin_email');
    location.href = 'index.html';
  };

  /* ------------------ Layout injection ------------------ */
  window.injectLayout = function(activePage){
    const root = document.getElementById('layoutRoot');
    if(!root) return;
    // Find page main content element
    const main = document.querySelector('.main-content');
    if(!main) return console.warn('injectLayout: .main-content not found');

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
            <a href="admindashboard.html" class="${activePage==='dashboard'?'active':''}">Dashboard</a>
            <a href="parents.html" class="${activePage==='parents'?'active':''}">Parents</a>
            <a href="staff.html" class="${activePage==='staff'?'active':''}">Staff</a>
            <a href="students.html" class="${activePage==='students'?'active':''}">Students</a>
            <a href="adminsettings.html" class="${activePage==='settings'?'active':''}">Settings</a>
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
    if(lb) lb.addEventListener('click', () => { if(confirm('Logout?')) doLogout(); });
  };

  /* ------------------ Utility helpers ------------------ */
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function downloadCSV(arr, keys, filename){
    const lines = [keys.join(',')];
    arr.forEach(o => lines.push(keys.map(k => JSON.stringify(o[k] ?? '')).join(',')));
    const blob = new Blob([lines.join('\n')], {type:'text/csv'}); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  /* ------------------ Phone country codes ------------------ */
  const COUNTRY_CODES = [
    {code:'+254', label:'Kenya'}, {code:'+255', label:'Tanzania'}, {code:'+256', label:'Uganda'},
    {code:'+257', label:'Burundi'}, {code:'+250', label:'Rwanda'}, {code:'+211', label:'South Sudan'},
    {code:'+44', label:'United Kingdom'}, {code:'+1', label:'United States'}, {code:'+91', label:'India'}
  ];

  // helper to create phone inputs HTML (returns {container, getter})
  function createPhoneInputs(initial){
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
    if(initial && initial.countryCode) select.value = initial.countryCode;

    const phoneInput = document.createElement('input');
    phoneInput.type = 'tel';
    phoneInput.placeholder = '712345678';
    phoneInput.style.padding = '8px';
    phoneInput.style.borderRadius = '6px';
    phoneInput.style.flex = '1';
    phoneInput.value = initial && initial.phone ? initial.phone : '';

    container.appendChild(select);
    container.appendChild(phoneInput);

    function getter(){
      return { countryCode: select.value, phone: phoneInput.value.trim(), display: (select.value + (phoneInput.value.trim() ? ' ' + phoneInput.value.trim() : '')) };
    }
    return { container, getter };
  }

  /* ------------------ Cross-link helpers ------------------ */
  function parentNameById(id){
    const d = readData(); const p = (d.parents||[]).find(x=>x.id===id); return p ? p.name : '';
  }
  function staffNameById(id){
    const d = readData(); const s = (d.staff||[]).find(x=>x.id===id); return s ? s.name : '';
  }
  function studentsLinkedToParent(parentId){
    const d = readData(); return (d.students||[]).filter(s => s.guardianId === parentId).map(s => s.adm);
  }
  function studentsLinkedToStaff(staffId){
    const d = readData(); return (d.students||[]).filter(s => s.classTeacherId === staffId).map(s => s.adm);
  }

  /* ------------------ Page: Dashboard ------------------ */
  window.initDashboard = function(){
    seedIfEmpty();
    const d = readData();
    const parentsCount = (d.parents||[]).length;
    const staffCount = (d.staff||[]).length;
    const studentsCount = (d.students||[]).length;
    const pendingApprovals = (d.staff||[]).filter(s=>!s.approved).length;

    const elParents = document.getElementById('statParents'); if(elParents) elParents.textContent = parentsCount;
    const elStaff = document.getElementById('statStaff'); if(elStaff) elStaff.textContent = staffCount;
    const elStudents = document.getElementById('statStudents'); if(elStudents) elStudents.textContent = studentsCount;
    const elPending = document.getElementById('statPending'); if(elPending) elPending.textContent = pendingApprovals;

    const recentList = document.getElementById('recentList');
    if(recentList){
      recentList.innerHTML = '';
      (d.recent || []).slice(-8).reverse().forEach(r => {
        const li = document.createElement('li'); li.textContent = r; recentList.appendChild(li);
      });
    }

    const adminInfo = document.getElementById('adminInfo');
    if(adminInfo) adminInfo.textContent = `Signed in as ${localStorage.getItem('sv_admin_email') || 'admin'}`;
  };

  /* ------------------ Page: Parents ------------------ */
  window.initParentsPage = function(){
    seedIfEmpty();
    const searchInput = document.getElementById('parentSearchInput');
    const addBtn = document.getElementById('addParentBtn');
    const exportBtn = document.getElementById('exportParentsBtn');
    const tbody = document.querySelector('#parentsTable tbody');

    function render(q=''){
      const d = readData();
      tbody.innerHTML = '';
      (d.parents || []).filter(p => {
        if(!q) return true;
        const s = q.toLowerCase();
        return (p.name||'').toLowerCase().includes(s) || (p.email||'').toLowerCase().includes(s) || (p.phone||'').toLowerCase().includes(s);
      }).forEach(p => {
        const linked = studentsLinkedToParent(p.id).join(', ');
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(p.id)}</td>
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.email||'')}</td>
          <td>${escapeHtml((p.countryCode||'') + ' ' + (p.phone||''))}</td>
          <td>${escapeHtml(p.relationship||'')}</td>
          <td>${escapeHtml(linked||'—')}</td>
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
        if(linked.length){
          if(!confirm(`This parent is linked to students (${linked.join(', ')}). Deleting will remove the link. Continue?`)) return;
        }
        const data = readData(); data.parents = (data.parents||[]).filter(x => x.id !== id); data.recent = (data.recent||[]).concat([`Parent ${id} deleted`]); saveData(data);
        render(searchInput.value.trim()); initDashboard();
      }));
    }

    function addParent(){
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
        const name = document.getElementById('m_name').value.trim();
        const email = document.getElementById('m_email').value.trim();
        const {countryCode, phone, display} = phoneWidget.getter();
        const relationship = document.getElementById('m_relationship').value.trim();
        const address = document.getElementById('m_address').value.trim();
        if(!name) return alert('Name required');
        const data = readData(); data.parents = data.parents || [];
        const newParent = { id:'p'+Date.now(), name, email, countryCode, phone, phoneDisplay: display, relationship, address };
        data.parents.push(newParent); data.recent = (data.recent||[]).concat([`Parent ${name} added`]); saveData(data);
        closeModal(); render(); initDashboard();
      };
    }

    function editParent(id){
      const data = readData();
      const p = (data.parents||[]).find(x=>x.id===id);
      if(!p) return alert('Parent not found');
      showModal('Edit Parent', `
        <div style="display:flex;flex-direction:column;gap:8px">
          <input id="m_name" value="${escapeHtml(p.name)}" placeholder="Full name">
          <input id="m_email" value="${escapeHtml(p.email||'')}" placeholder="Email">
          <div id="m_phone_container"></div>
          <input id="m_relationship" value="${escapeHtml(p.relationship||'')}" placeholder="Relationship">
          <input id="m_address" value="${escapeHtml(p.address||'')}" placeholder="Address (optional)">
          <div style="text-align:right"><button id="m_cancel" class="btn ghost">Cancel</button> <button id="m_save" class="btn">Save</button></div>
        </div>
      `);
      const container = document.getElementById('m_phone_container');
      const phoneWidget = createPhoneInputs({countryCode: p.countryCode || '+254', phone: p.phone || ''});
      container.appendChild(phoneWidget.container);

      document.getElementById('m_cancel').onclick = closeModal;
      document.getElementById('m_save').onclick = () => {
        p.name = document.getElementById('m_name').value.trim();
        p.email = document.getElementById('m_email').value.trim();
        const {countryCode, phone, display} = phoneWidget.getter();
        p.countryCode = countryCode; p.phone = phone; p.phoneDisplay = display;
        p.relationship = document.getElementById('m_relationship').value.trim();
        p.address = document.getElementById('m_address').value.trim();
        data.recent = (data.recent||[]).concat([`Parent ${p.name} updated`]); saveData(data);
        closeModal(); render(searchInput.value.trim()); initDashboard();
      };
    }

    // wire events
    addBtn.onclick = addParent;
    exportBtn.onclick = () => { const d = readData(); downloadCSV(d.parents || [], ['id','name','email','countryCode','phone','relationship','address'], 'parents.csv'); };
    if(searchInput) searchInput.oninput = () => render(searchInput.value.trim());
    render();
  };

  /* ------------------ Page: Staff ------------------ */
  window.initStaffPage = function(){
    seedIfEmpty();
    const searchInput = document.getElementById('staffSearchInput');
    const addBtn = document.getElementById('addStaffBtn');
    const exportBtn = document.getElementById('exportStaffBtn');
    const tbody = document.querySelector('#staffTable tbody');

    function render(q=''){
      const d = readData();
      tbody.innerHTML = '';
      (d.staff||[]).filter(s => {
        if(!q) return true;
        const s2 = q.toLowerCase(); return (s.name||'').toLowerCase().includes(s2) || (s.staffNo||'').toLowerCase().includes(s2);
      }).forEach(s => {
        const linked = studentsLinkedToStaff(s.id).join(', ');
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(s.id)}</td>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.staffNo||'')}</td>
          <td>${escapeHtml(s.role||'')}</td>
          <td>${escapeHtml(s.department||'')}</td>
          <td>${s.approved ? 'Approved' : '<strong class="muted">Pending</strong>'}</td>
          <td>${escapeHtml(linked||'—')}</td>
          <td>
            <button class="btn ghost btn-edit" data-id="${s.id}">Edit</button>
            ${s.approved ? `<button class="btn ghost btn-revoke" data-id="${s.id}">Revoke</button>` : `<button class="btn btn-approve" data-id="${s.id}">Approve</button>`}
            <button class="btn ghost btn-del" data-id="${s.id}">Delete</button>
          </td>`;
        tbody.appendChild(tr);
      });

      // handlers
      tbody.querySelectorAll('.btn-edit').forEach(b=>b.addEventListener('click', ()=> editStaff(b.dataset.id)));
      tbody.querySelectorAll('.btn-approve').forEach(b=>b.addEventListener('click', ()=> {
        const d = readData(); const s = d.staff.find(x=>x.id===b.dataset.id); if(s){ s.approved=true; d.recent=(d.recent||[]).concat([`Staff ${s.name} approved`]); saveData(d); render(searchInput.value.trim()); initDashboard(); }
      }));
      tbody.querySelectorAll('.btn-revoke').forEach(b=>b.addEventListener('click', ()=> {
        const d = readData(); const s = d.staff.find(x=>x.id===b.dataset.id); if(s){ s.approved=false; d.recent=(d.recent||[]).concat([`Staff ${s.name} revoked`]); saveData(d); render(searchInput.value.trim()); initDashboard(); }
      }));
      tbody.querySelectorAll('.btn-del').forEach(b=>b.addEventListener('click', ()=> {
        const id = b.dataset.id;
        const linked = studentsLinkedToStaff(id);
        if(linked.length){
          if(!confirm(`This staff is class teacher for students (${linked.join(', ')}). Deleting will remove those links. Continue?`)) return;
        }
        const d = readData(); d.staff = (d.staff||[]).filter(x=>x.id!==id); d.recent = (d.recent||[]).concat([`Staff ${id} deleted`]); saveData(d);
        render(searchInput.value.trim()); initDashboard();
      }));
    }

    function addStaff(){
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
        const name = document.getElementById('m_name').value.trim();
        const staffNo = document.getElementById('m_staffNo').value.trim();
        const role = document.getElementById('m_role').value.trim();
        const department = document.getElementById('m_department').value.trim();
        if(!name || !staffNo) return alert('Name and staff number required');
        const d = readData(); d.staff = d.staff || []; const newStaff = { id:'t'+Date.now(), name, staffNo, role, department, approved:false };
        d.staff.push(newStaff); d.recent = (d.recent||[]).concat([`Staff ${name} added`]); saveData(d);
        closeModal(); render(); initDashboard();
      };
    }

    function editStaff(id){
      const d = readData(); const s = (d.staff||[]).find(x=>x.id===id); if(!s) return alert('Not found');
      showModal('Edit Staff', `
        <div style="display:flex;flex-direction:column;gap:8px">
          <input id="m_name" value="${escapeHtml(s.name)}" placeholder="Full name">
          <input id="m_staffNo" value="${escapeHtml(s.staffNo||'')}" placeholder="Staff Number">
          <input id="m_role" value="${escapeHtml(s.role||'')}" placeholder="Role">
          <input id="m_department" value="${escapeHtml(s.department||'')}" placeholder="Department">
          <label><input id="m_approved" type="checkbox" ${s.approved?'checked':''}> Approved</label>
          <div style="text-align:right"><button id="m_cancel" class="btn ghost">Cancel</button> <button id="m_save" class="btn">Save</button></div>
        </div>
      `);
      document.getElementById('m_cancel').onclick = closeModal;
      document.getElementById('m_save').onclick = () => {
        s.name = document.getElementById('m_name').value.trim();
        s.staffNo = document.getElementById('m_staffNo').value.trim();
        s.role = document.getElementById('m_role').value.trim();
        s.department = document.getElementById('m_department').value.trim();
        s.approved = !!document.getElementById('m_approved').checked;
        d.recent = (d.recent||[]).concat([`Staff ${s.name} updated`]); saveData(d);
        closeModal(); render(searchInput.value.trim()); initDashboard();
      };
    }

    // wire events
    addBtn.onclick = addStaff;
    exportBtn.onclick = () => { const d = readData(); downloadCSV(d.staff || [], ['id','name','staffNo','role','department','approved'], 'staff.csv'); };
    if(searchInput) searchInput.oninput = () => render(searchInput.value.trim());
    render();
  };

  /* ------------------ Page: Students ------------------ */
  window.initStudentsPage = function(){
    seedIfEmpty();
    const searchInput = document.getElementById('studentSearchInput');
    const addBtn = document.getElementById('addStudentBtn');
    const csvInput = document.getElementById('studentCsvInput');
    const tbody = document.querySelector('#studentsTable tbody');

    function render(q=''){
      const d = readData();
      tbody.innerHTML = '';
      (d.students || []).filter(s => {
        if(!q) return true;
        const s2 = q.toLowerCase(); return (s.name||'').toLowerCase().includes(s2) || (s.adm||'').toLowerCase().includes(s2) || (s.cls||'').toLowerCase().includes(s2);
      }).forEach(s => {
        const guardian = parentNameById(s.guardianId) || s.guardianName || (s.guardianPhoneDisplay || '—');
        const teacher = staffNameById(s.classTeacherId) || '—';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(s.adm)}</td>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.cls||'')}</td>
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

      tbody.querySelectorAll('.btn-edit').forEach(b=>b.addEventListener('click', ()=> editStudent(b.dataset.id)));
      tbody.querySelectorAll('.btn-del').forEach(b=>b.addEventListener('click', ()=> {
        if(!confirm('Delete student?')) return;
        const adm = b.dataset.id; const d = readData(); d.students = (d.students||[]).filter(x=>x.adm!==adm); d.recent = (d.recent||[]).concat([`Student ${adm} deleted`]); saveData(d);
        render(searchInput.value.trim()); initDashboard();
      }));
      tbody.querySelectorAll('.btn-qr').forEach(b=>b.addEventListener('click', ()=> showQr(b.dataset.id)));
    }

    function formatCurrency(n){
      if(n === undefined || n === null) return 'KSh 0';
      return 'KSh ' + Number(n).toLocaleString();
    }

    function addStudent(){
      // Build form with grouped sections
      const data = readData();
      const parentOptions = (data.parents||[]).map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
      const teacherOptions = (data.staff||[]).filter(s=>s.approved).map(t=>`<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');

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
        const adm = document.getElementById('m_adm').value.trim();
        const name = document.getElementById('m_name').value.trim();
        if(!adm || !name) return alert('Admission number and name required');
        const d = readData();
        if((d.students||[]).find(s=>s.adm===adm)) return alert('Admission number already exists');

        const guardianId = document.getElementById('m_guardianId').value || null;
        const {countryCode, phone, display} = phoneWidget.getter();
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
        d.students = d.students || []; d.students.push(student);
        d.recent = (d.recent||[]).concat([`Student ${name} (${adm}) added`]); saveData(d);
        closeModal(); render(); initDashboard();
      };
    }

    function editStudent(adm){
      const d = readData(); const s = (d.students||[]).find(x=>x.adm===adm); if(!s) return alert('Student not found');
      const parentOptions = (d.parents||[]).map(p=>`<option value="${p.id}" ${p.id===s.guardianId?'selected':''}>${escapeHtml(p.name)}</option>`).join('');
      const teacherOptions = (d.staff||[]).filter(st=>st.approved).map(t=>`<option value="${t.id}" ${t.id===s.classTeacherId?'selected':''}>${escapeHtml(t.name)}</option>`).join('');

      showModal(`Edit Student — ${escapeHtml(s.name)}`, `
        <div style="display:flex;flex-direction:column;gap:8px;max-width:700px">
          <h4>School Information</h4>
          <input id="m_schoolName" placeholder="School Name" value="${escapeHtml(s.schoolName||'')}">
          <div style="display:flex;gap:8px">
            <input id="m_acadFrom" type="date" style="flex:1" value="${escapeHtml(s.academicYearFrom||'')}">
            <input id="m_acadTo" type="date" style="flex:1" value="${escapeHtml(s.academicYearTo||'')}">
            <input id="m_currentTerm" placeholder="Current Term" style="flex:1" value="${escapeHtml(s.currentTerm||'')}">
          </div>

          <h4>Guardian Information</h4>
          <select id="m_guardianId"><option value="">-- Select guardian --</option>${parentOptions}</select>
          <div id="m_guardian_phone"></div>
          <input id="m_guardian_relationship" placeholder="Relationship" value="${escapeHtml(s.relationship||'')}">

          <h4>Academic Information</h4>
          <div style="display:flex;gap:8px">
            <input id="m_adm" value="${escapeHtml(s.adm)}" disabled style="flex:1">
            <input id="m_name" value="${escapeHtml(s.name)}" style="flex:2">
          </div>
          <div style="display:flex;gap:8px">
            <input id="m_currentGrade" value="${escapeHtml(s.currentGrade||'')}" style="flex:1">
            <input id="m_cls" value="${escapeHtml(s.cls||'')}" style="flex:1">
            <select id="m_classTeacherId" style="flex:1"><option value="">-- Class teacher --</option>${teacherOptions}</select>
          </div>
          <input id="m_yearOfCompletion" placeholder="Year of Completion" value="${escapeHtml(s.yearOfCompletion||'')}">

          <h4>Fee Information</h4>
          <div style="display:flex;gap:8px">
            <input id="m_feeBalance" placeholder="Fee balance (numbers only)" style="flex:1" value="${escapeHtml(s.feeBalance||0)}">
            <input id="m_lastPaymentDate" type="date" style="flex:1" value="${escapeHtml(s.lastPaymentDate||'')}">
            <select id="m_paymentStatus" style="flex:1">
              <option ${s.paymentStatus==='Cleared'?'selected':''}>Cleared</option>
              <option ${s.paymentStatus==='Pending'?'selected':''}>Pending</option>
              <option ${s.paymentStatus==='Overdue'?'selected':''}>Overdue</option>
            </select>
          </div>

          <div style="text-align:right;margin-top:8px"><button id="m_cancel" class="btn ghost">Cancel</button> <button id="m_save" class="btn">Save</button></div>
        </div>
      `);

      // phone widget (attempt to parse existing display)
      const existingPhone = parsePhoneDisplay(s.guardianPhoneDisplay || '');
      const phoneWidget = createPhoneInputs(existingPhone);
      document.getElementById('m_guardian_phone').appendChild(phoneWidget.container);
      if(s.guardianId) document.getElementById('m_guardianId').value = s.guardianId;

      document.getElementById('m_cancel').onclick = closeModal;
      document.getElementById('m_save').onclick = () => {
        s.name = document.getElementById('m_name').value.trim();
        s.guardianId = document.getElementById('m_guardianId').value || null;
        const {countryCode, phone, display} = phoneWidget.getter();
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
        s.feeBalance = Number(document.getElementById('m_feeBalance').value || 0);
        s.lastPaymentDate = document.getElementById('m_lastPaymentDate').value || '';
        s.paymentStatus = document.getElementById('m_paymentStatus').value || 'Pending';
        const d = readData(); d.recent = (d.recent||[]).concat([`Student ${s.name} (${s.adm}) updated`]); saveData(d);
        closeModal(); render(searchInput.value.trim()); initDashboard();
      };
    }

    function showQr(adm){
      const d = readData(); const s = (d.students||[]).find(x=>x.adm===adm); if(!s) return;
      const qrSrc = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(s.qr||s.adm)}&choe=UTF-8`;
      showModal(`QR — ${escapeHtml(s.name)}`, `<div style="display:flex;gap:12px;align-items:center"><img src="${qrSrc}" alt="qr"><div><p class="muted">Payload:</p><code>${escapeHtml(s.qr||s.adm)}</code><div style="margin-top:8px"><a class="btn" href="${qrSrc}" download="${s.adm}-qr.png">Download</a><button id="m_close" class="btn ghost" style="margin-left:8px">Close</button></div></div></div>`);
      document.getElementById('m_close').onclick = closeModal;
    }

    // CSV import handler - expects adm,name,class (we can extend later)
    csvInput.onchange = (evt) => {
      const f = evt.target.files[0]; if(!f) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const rows = e.target.result.split(/\r?\n/).map(r=>r.trim()).filter(Boolean);
        let added = 0; const data = readData(); data.students = data.students || [];
        rows.forEach((r,i) => {
          if(i===0 && r.toLowerCase().includes('adm')) return;
          const cols = r.split(','); if(cols.length >= 3){
            const adm = cols[0].trim(), name = cols[1].trim(), cls = cols[2].trim();
            if(!data.students.find(s=>s.adm===adm)){ data.students.push({adm,name,cls,qr:adm}); added++; }
          }
        });
        data.recent = (data.recent||[]).concat([`Imported ${added} students via CSV`]); saveData(data); render(); initDashboard();
        alert(`Imported ${added} students (client-side).`);
      };
      reader.readAsText(f); csvInput.value = '';
    };

    addBtn.onclick = addStudent;
    if(searchInput) searchInput.oninput = () => render(searchInput.value.trim());
    render();
  };

  function parsePhoneDisplay(display){
    // input like "+254 712345678" or "+254712345678" -> return {countryCode, phone}
    if(!display) return {countryCode:'+254', phone:''};
    const m = display.trim().match(/^(\+\d{1,4})\s*(\d+)$/);
    if(m) return {countryCode:m[1], phone:m[2]};
    // fallback
    return {countryCode:'+254', phone: display.replace(/[^0-9]/g,'')};
  }

  /* ------------------ Page: Settings ------------------ */
  window.initSettingsPage = function(){
    seedIfEmpty();
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const saveBtn = document.getElementById('saveProfileBtn');
    const oldPw = document.getElementById('oldPw');
    const newPw = document.getElementById('newPw');
    const changePwBtn = document.getElementById('changePwBtn');

    profileName.value = localStorage.getItem('sv_admin_name') || 'Admin';
    profileEmail.value = localStorage.getItem('sv_admin_email') || localStorage.getItem('sv_admin_email') || '';

    saveBtn.onclick = () => {
      localStorage.setItem('sv_admin_name', profileName.value.trim());
      localStorage.setItem('sv_admin_email', profileEmail.value.trim());
      alert('Profile saved (client-side).');
    };
    changePwBtn.onclick = () => {
      if(!oldPw.value || !newPw.value) return alert('Fill both');
      alert('Password changed (mock). Replace with backend call.');
      oldPw.value = ''; newPw.value = '';
    };
  };

  /* ------------------ Modal helpers ------------------ */
  window.showModal = function(title, htmlContent){
    closeModal(); // ensure single
    const modalRoot = document.createElement('div'); modalRoot.className = 'modal-backdrop';
    modalRoot.innerHTML = `<div class="modal"><h3>${escapeHtml(title)}</h3><div>${htmlContent}</div></div>`;
    document.body.appendChild(modalRoot);
  };
  window.closeModal = function(){
    const m = document.querySelector('.modal-backdrop'); if(m) m.remove();
  };

  // expose debug helpers
  window.__sv_admin = { readData, saveData, seedIfEmpty };

  // seed immediately if needed
  seedIfEmpty();

})(); 