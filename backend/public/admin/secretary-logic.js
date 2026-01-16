/**
 * Secretary Dashboard Logic
 * Focuses on Visitor Approval Workflow
 */

document.addEventListener('DOMContentLoaded', () => {
    // Role Enforcement
    if (typeof authAPI !== 'undefined') {
        if (!authAPI.enforcePortalAccess(['secretary', 'staff'], '/public/admin_login.html')) return;
    }

    // 1. Initial Data Load
    loadDashboardData();

    // 2. Event Listeners
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDashboardData);
    }

    // Handle Log Out
    const logoutBtns = document.querySelectorAll('[data-logout]');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear all possible session tokens
            localStorage.removeItem('sv_token');
            localStorage.removeItem('sv_admin_token');
            localStorage.removeItem('sv_auth_token');
            localStorage.removeItem('sv_user_data');

            // Redirect to landing page
            window.location.href = '/';
        });
    });
});

async function loadDashboardData() {
    try {
        const rawVisitors = await visitorsAPI.getAll();
        const visitors = Array.isArray(rawVisitors) ? rawVisitors : (rawVisitors.visitors || rawVisitors.data || []);

        updateStats(visitors);
        renderPendingList(visitors.filter(v => {
            const s = (v.status || '').toLowerCase();
            return s === 'pending' || s === 'waiting';
        }));
        renderActivityList(visitors.slice(0, 10)); // Top 10 recent
        loadCharts(visitors);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // showNotification('Failed to load dashboard data', 'error');
    }
}

function updateStats(visitors) {
    const total = visitors.length;
    const pending = visitors.filter(v => v.status === 'pending').length;
    const approvedToday = visitors.filter(v => {
        const isApproved = v.status === 'approved' || v.status === 'checked_in' || v.status === 'checked_out';
        const isToday = new Date(v.check_in_time).toDateString() === new Date().toDateString();
        return isApproved && isToday;
    }).length;

    const elTotal = document.getElementById('countTotal');
    const elPending = document.getElementById('countPending');
    const elApproved = document.getElementById('countApproved');
    const elBadge = document.getElementById('pendingCountBadge');

    if (elTotal) elTotal.textContent = total;
    if (elPending) elPending.textContent = pending;
    if (elApproved) elApproved.textContent = approvedToday;
    if (elBadge) elBadge.textContent = pending;
}

function renderPendingList(pendingVisitors) {
    const container = document.getElementById('pendingList');
    if (!container) return;

    if (pendingVisitors.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #94a3b8; padding: 40px;">
                <i class="fa-solid fa-circle-check" style="font-size: 2.5rem; display: block; margin-bottom: 10px; color: #10b981;"></i>
                No pending approvals!
            </div>
        `;
        return;
    }

    container.innerHTML = pendingVisitors.map(v => `
        <div class="visitor-item">
            <div class="vis-info">
                <div class="vis-avatar">
                    <i class="fa-solid fa-user-clock"></i>
                </div>
                <div>
                    <div class="vis-name">${v.name}</div>
                    <div class="vis-meta">${v.purpose} • Host: ${v.host_name || 'N/A'}</div>
                </div>
            </div>
            <div class="vis-actions">
                <button class="btn-action approve" onclick="handleApprove(${v.id})" title="Approve">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button class="btn-action reject" onclick="handleReject(${v.id})" title="Reject">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderActivityList(visitors) {
    const container = document.getElementById('recentActivityList');
    if (!container) return;

    if (visitors.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 20px; color: #94a3b8;">No recent activity.</div>';
        return;
    }

    container.innerHTML = visitors.map(v => {
        const time = new Date(v.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const initial = v.name.charAt(0).toUpperCase();

        return `
            <div class="visitor-item">
                <div class="vis-info">
                    <div class="vis-avatar" style="background: rgba(79, 70, 229, 0.1); color: #4f46e5; font-weight: 800;">
                        ${initial}
                    </div>
                    <div>
                        <div class="vis-name">${v.name}</div>
                        <div class="vis-meta">${time} • ${v.host_name || 'General Office'}</div>
                    </div>
                </div>
                <span class="status-pill status-${v.status}">${v.status.replace('_', ' ')}</span>
            </div>
        `;
    }).join('');
}

function loadCharts(visitors) {
    const ctxVisitor = document.getElementById('chartVisitorStatus');
    if (!ctxVisitor || typeof Chart === 'undefined') return;

    if (window.visitorChart) window.visitorChart.destroy();

    const checkedIn = visitors.filter(v => {
        const s = (v.status || '').toLowerCase();
        return s === 'checked_in' || s === 'approved';
    }).length;

    const checkedOut = visitors.filter(v => (v.status || '').toLowerCase() === 'checked_out').length;
    const pending = visitors.filter(v => {
        const s = (v.status || '').toLowerCase();
        return s === 'pending' || s === 'waiting';
    }).length;

    window.visitorChart = new Chart(ctxVisitor, {
        type: 'doughnut',
        data: {
            labels: ['In', 'Out', 'Pending'],
            datasets: [{
                data: [checkedIn, checkedOut, pending],
                backgroundColor: ['#10b981', '#64748b', '#f59e0b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// --- Specific Initialization for Visitors Page ---
window.initSecretaryVisitorsPage = function () {
    loadVisitorTable();
};

async function handleApprove(id) {
    console.log('[DEBUG] handleApprove called for ID:', id);
    try {
        await visitorsAPI.approve(id);
        const isDashboard = document.body.dataset.page === 'secretaryDashboard';
        if (isDashboard) loadDashboardData();
        else if (typeof loadVisitorTable === 'function') loadVisitorTable();

        showFeedback('Visitor approved successfully!', 'success');
    } catch (error) {
        console.error('Approve failed:', error);
        const msg = error.message || 'Error occurred';
        showFeedback(`Failed to approve visitor: ${msg}`, 'error');
    }
}

async function handleReject(id) {
    console.log('[DEBUG] handleReject called for ID:', id);
    if (!confirm('Are you sure you want to reject this visitor?')) return;
    try {
        await visitorsAPI.reject(id);
        const isDashboard = document.body.dataset.page === 'secretaryDashboard';
        if (isDashboard) loadDashboardData();
        else if (typeof loadVisitorTable === 'function') loadVisitorTable();

        showFeedback('Visitor rejected.', 'info');
    } catch (error) {
        console.error('Reject failed:', error);
        const msg = error.message || 'Error occurred';
        showFeedback(`Failed to reject visitor: ${msg}`, 'error');
    }
}

function showFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `feedback-toast ${type}`;
    feedback.style = `
        position: fixed; top: 20px; right: 20px; 
        background: ${type === 'error' ? '#ef4444' : (type === 'info' ? '#3b82f6' : '#10b981')}; 
        color: white; padding: 12px 24px; border-radius: 12px;
        box-shadow: 0 10px 15px rgba(0,0,0,0.1);
        z-index: 1000; font-weight: 600;
        transition: all 0.3s ease;
    `;
    feedback.textContent = message;
    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.style.transform = 'translateX(120%)';
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
`;
document.head.appendChild(style);
