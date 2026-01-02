/**
 * Secretary Dashboard Logic
 * Focuses on Visitor Approval Workflow
 */

document.addEventListener('DOMContentLoaded', () => {
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
            localStorage.removeItem('sv_token');
            localStorage.removeItem('sv_user_data');
            window.location.href = '/admin_login.html';
        });
    });
});

async function loadDashboardData() {
    try {
        const visitors = await visitorsAPI.getAll();
        updateStats(visitors);
        renderPendingList(visitors.filter(v => v.status === 'pending'));
        renderActivityList(visitors.slice(0, 10)); // Top 10 recent
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

    document.getElementById('countTotal').textContent = total;
    document.getElementById('countPending').textContent = pending;
    document.getElementById('countApproved').textContent = approvedToday;
    document.getElementById('pendingBadge').textContent = pending;
}

function renderPendingList(pendingVisitors) {
    const container = document.getElementById('pendingList');
    if (!container) return;

    if (pendingVisitors.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 40px;">
                <i class="fa-solid fa-circle-check" style="font-size: 2.5rem; display: block; margin-bottom: 10px; color: #10b981;"></i>
                All clear! No pending visitors.
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
                <div class="vis-details">
                    <h4>${v.name}</h4>
                    <p>${v.purpose} • Visiting: ${v.host_name || 'N/A'}</p>
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

    container.innerHTML = visitors.map(v => {
        const time = new Date(v.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const initial = v.name.charAt(0).toUpperCase();
        let statusHtml = '';

        if (v.status === 'pending') statusHtml = '<span class="status-pill pending">Pending</span>';
        else if (v.status === 'rejected') statusHtml = '<span class="status-pill" style="background:#fee2e2; color:#ef4444;">Rejected</span>';
        else statusHtml = '<span class="status-pill approved">Approved</span>';

        return `
            <div class="visitor-item">
                <div class="vis-info">
                    <div class="vis-avatar" style="background: rgba(79, 70, 229, 0.1); color: #4f46e5;">
                        ${initial}
                    </div>
                    <div class="vis-details">
                        <h4>${v.name}</h4>
                        <p>${time} • ${v.host_name || 'General'}</p>
                    </div>
                </div>
                ${statusHtml}
            </div>
        `;
    }).join('');
}

async function handleApprove(id) {
    try {
        await visitorsAPI.approve(id);
        loadDashboardData();
        showFeedback('Visitor approved successfully!', 'success');
    } catch (error) {
        console.error('Approve failed:', error);
        showFeedback('Failed to approve visitor', 'error');
    }
}

async function handleReject(id) {
    if (!confirm('Are you sure you want to reject this visitor?')) return;
    try {
        await visitorsAPI.reject(id);
        loadDashboardData();
        showFeedback('Visitor rejected.', 'info');
    } catch (error) {
        console.error('Reject failed:', error);
        showFeedback('Failed to reject visitor', 'error');
    }
}

function showFeedback(message, type) {
    // Basic toast or notification
    const feedback = document.createElement('div');
    feedback.style = `
        position: fixed; top: 20px; right: 20px; 
        background: ${type === 'error' ? '#ef4444' : '#10b981'}; 
        color: white; padding: 12px 24px; border-radius: 12px;
        box-shadow: 0 10px 15px rgba(0,0,0,0.1);
        z-index: 1000; font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    feedback.textContent = message;
    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease-in';
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
