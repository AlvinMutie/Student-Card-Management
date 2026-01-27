/**
 * SuperAdmin Layout & Logic
 * Handles sidebar injection, auth checks, and global UI behavior.
 */

(function () {
    // 1. Auth Check (Skip for login page)
    const isLoginPage = window.location.pathname.includes('login.html');
    if (!isLoginPage) {
        const token = localStorage.getItem('sa_token');
        if (!token) {
            window.location.href = 'login.html';
            return; // Stop execution
        }
    }

    if (isLoginPage) return; // Don't inject layout on login page

    // 2. Sidebar Navigation Data
    const navItems = [
        { name: 'Overview', url: 'dashboard.html', icon: 'M3,13H11V3H3V13M3,21H11V15H3V21M13,21H21V11H13V21M13,3V9H21V3H13Z' },
        { name: 'Schools', url: 'schools.html', icon: 'M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z' },
        { name: 'Users', url: 'users.html', icon: 'M16,11C17.66,11 19,9.66 19,8C19,6.34 17.66,5 16,5C14.34,5 13,6.34 13,8C13,9.66 14.34,11 16,11M16,13C13.33,13 8,14.33 8,17V20H24V17C24,14.33 18.67,13 16,13M4,8C4,5.79 5.79,4 8,4C10.21,4 12,5.79 12,8C12,10.21 10.21,12 8,12C5.79,12 4,10.21 4,8M4,13C1.33,13 0,14.33 0,17V20H6V17C6,14.33 1.33,13 4,13Z' },
        { name: 'Subscriptions', url: 'subscriptions.html', icon: 'M20,6C20.58,6 21.05,6.2 21.42,6.59C21.8,7 22,7.45 22,8V19C22,19.55 21.8,20 21.42,20.41C21.05,20.8 20.58,21 20,21H4C3.42,21 2.95,20.8 2.58,20.41C2.2,20 2,19.55 2,19V8C2,7.45 2.2,7 2.58,6.59C2.95,6.2 3.42,6 4,6H8V4C8,3.42 8.2,2.95 8.58,2.58C8.95,2.2 9.42,2 10,2H14C14.58,2 15.05,2.2 15.42,2.58C15.8,2.95 16,3.42 16,4V6H20M4,8V19H20V8H4M14,6V4H10V6H14M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11Z' },
        { name: 'Audit Logs', url: 'logs.html', icon: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M16,20H8V18H16V20M16,16H8V14H16V16M13,9V3.5L18.5,9H13Z' },
        { name: 'Settings', url: 'settings.html', icon: 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z' }
    ];

    function initLayout() {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

        const sidebarHTML = `
            <div class="sa-sidebar">
                <div class="sa-brand">
                    <div class="sa-brand-icon">
                        <svg style="width: 20px; height: 20px; fill: white;" viewBox="0 0 24 24">
                            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,11.95L5.5,8.04L7.54,4.5L12,7.11L16.46,4.5L18.5,8.04L12,11.95Z" />
                        </svg>
                    </div>
                    <div class="sa-brand-text">Platform Admin</div>
                </div>

                <ul class="sa-nav">
                    ${navItems.map(item => `
                        <li class="sa-nav-item">
                            <a href="${item.url}" class="${currentPage === item.url ? 'active' : ''}">
                                <svg class="sa-nav-icon" viewBox="0 0 24 24">
                                    <path d="${item.icon}" />
                                </svg>
                                <span>${item.name}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>

                <div class="sa-user-menu">
                    <button class="sa-logout" id="saLogout">
                        <svg style="width: 18px; height: 18px; fill: currentColor; margin-right: 8px;" viewBox="0 0 24 24">
                            <path d="M16 17V19H2V5H16V7H4V17H16M17 11V8L22 12L17 16V13H8V11H17Z" />
                        </svg>
                        Secure Logout
                    </button>
                    <div style="text-align: center; color: var(--sa-slate-500); font-size: 0.7rem; margin-top: 12px;">
                        Version 2.4.0 (Build 892)
                    </div>
                </div>
            </div>
        `;

        // Inject Sidebar
        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

        // Header Logic (Assuming page has .sa-header)
        const header = document.querySelector('.sa-header');
        if (header) {
            header.innerHTML = `
                <div class="sa-breadcrumbs">
                    System / ${currentPage.replace('.html', '').charAt(0).toUpperCase() + currentPage.replace('.html', '').slice(1)}
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--sa-slate-700);">System Operational</span>
                </div>
            `;
        }

        // Logout Logic
        const logoutBtn = document.getElementById('saLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Terminate secure session?')) {
                    localStorage.removeItem('sa_token');
                    window.location.href = 'login.html';
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLayout);
    } else {
        initLayout();
    }
})();
