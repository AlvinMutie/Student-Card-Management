/**
 * Admin Layout System - Shuleni Advantage
 * Standardizes the sidebar and top navigation across all admin pages.
 */

(function () {
    const navItems = [
        { name: 'Dashboard', url: 'admindashboard.html', icon: 'M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z' },
        { name: 'Students', url: 'students.html', icon: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' },
        { name: 'Parents', url: 'parents.html', icon: 'M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M15.94 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13M15 4A3.39 3.39 0 0 0 13.07 4.59A5 5 0 0 1 13.07 10.41A3.39 3.39 0 0 0 15 11A3.5 3.5 0 0 0 15 4Z' },
        { name: 'Staff', url: 'staff.html', icon: 'M21.1,12.5L22.5,13.91L15.97,20.5L12.5,17L13.9,15.59L15.97,17.67L21.1,12.5M10,17L13,20H3V18C3,15.79 6.58,14 11,14L12.89,14.11L10,17M11,4A4,4 0 0,1 15,8A4,4 0 0,1 11,12A4,4 0 0,1 7,8A4,4 0 0,1 11,4Z' },
        { name: 'Visitors', url: 'visitors.html', icon: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' },
        { name: 'ID Generator', url: 'student-id-generator.html', icon: 'M14,21H10V19H14M17.71,5.29L19.79,7.37L18.37,8.79L16.29,6.71M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z' },
        { name: 'Settings', url: 'adminsettings.html', icon: 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z' }
    ];

    function initLayout() {
        const currentPage = window.location.pathname.split('/').pop() || 'admindashboard.html';
        const sidebarHTML = `
            <div class="sidebar">
                <div class="sidebar-content">
                    <div class="brand">
                        <img src="../assets/maseno_logo.png" alt="Maseno School" class="brand-icon" style="width: 60px; height: 60px; object-fit: contain;">
                        <div class="brand-text">
                            <span class="brand-title">Shuleni</span>
                            <span class="brand-subtitle">Advantage</span>
                        </div>
                    </div>
                    
                    <div class="nav-section">
                        <div class="nav-label">Menu</div>
                        <ul class="nav-links">
                            ${navItems.map(item => `
                                <li>
                                    <a href="${item.url}" class="${currentPage === item.url ? 'active' : ''}">
                                        <svg class="nav-icon" viewBox="0 0 24 24">
                                            <path d="${item.icon}" />
                                        </svg>
                                        <span>${item.name}</span>
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <div class="sidebar-footer">
                    <button class="logout-btn" data-logout>
                        <svg class="logout-icon" viewBox="0 0 24 24">
                            <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                        </svg>
                        <span>Log Out</span>
                    </button>
                    <div class="app-version">Ver 2.4.0</div>
                </div>
            </div>
        `;

        // Inject sidebar at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

        // Standardize Admin Info in top-row
        const adminSection = document.querySelector('.admin-section');
        if (adminSection) {
            const adminEmail = localStorage.getItem('sv_admin_email') || 'admin';
            const adminName = adminEmail.split('@')[0];
            adminSection.innerHTML = `
                <div id="adminInfo">Hi, <span data-admin-name>${adminName}</span></div>
            `;
        }

        // Handle logout
        document.querySelectorAll('[data-logout]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.authAPI && typeof window.authAPI.logout === 'function') {
                    window.authAPI.logout();
                } else {
                    localStorage.removeItem('sv_auth_token');
                    localStorage.removeItem('sv_user_data');
                    localStorage.removeItem('sv_admin_token');
                    localStorage.removeItem('sv_admin_email');
                    window.location.href = '/';
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLayout);
    } else {
        initLayout();
    }
})();
