/**
 * Mockup Layout Logic - Shuleni Advantage (Pelio Theme)
 */

(function () {
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = [
        { name: 'Dashboard', url: 'preview-dashboard.html', icon: 'M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z' },
        { name: 'Students', url: 'preview-students.html', icon: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' },
        { name: 'Parents', url: 'preview-parents.html', icon: 'M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M15.94 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13M15 4A3.39 3.39 0 0 0 13.07 4.59A5 5 0 0 1 13.07 10.41A3.39 3.39 0 0 0 15 11A3.5 3.5 0 0 0 15 4Z' },
        { name: 'Staff', url: 'preview-staff.html', icon: 'M21.1,12.5L22.5,13.91L15.97,20.5L12.5,17L13.9,15.59L15.97,17.67L21.1,12.5M10,17L13,20H3V18C3,15.79 6.58,14 11,14L12.89,14.11L10,17M11,4A4,4 0 0,1 15,8A4,4 0 0,1 11,12A4,4 0 0,1 7,8A4,4 0 0,1 11,4Z' },
        { name: 'Visitors', url: 'preview-visitors.html', icon: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' },
        { name: 'ID Generator', url: 'preview-id-gen.html', icon: 'M2,2H22V22H2M4,4V20H20V4H4M7,7H10V10H7V7M11,7H17V10H11V7M7,11H10V14H7V11M11,11H17V14H11V11M7,15H10V18H7V15M11,15H17V18H11V15Z' },
        { name: 'Settings', url: 'preview-settings.html', icon: 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z' }
    ];

    function initLayout() {
        const sidebar = document.createElement('aside');
        sidebar.className = 'p-sidebar';
        sidebar.innerHTML = `
            <div class="p-brand">
                <img src="/assets/maseno_logo.png" class="p-brand-img" alt="Logo">
                <div class="p-brand-text">
                    <span class="p-brand-title">Shuleni</span>
                    <span class="p-brand-sub">Advantage</span>
                </div>
            </div>
            <ul class="p-nav">
                ${navItems.map(item => {
            const isActive = item.url === currentPage;
            return `
                        <li class="p-nav-item">
                            <a href="${item.url}" class="p-nav-link ${isActive ? 'active' : ''}">
                                <svg class="p-nav-icon" viewBox="0 0 24 24">
                                    <path d="${item.icon}" />
                                </svg>
                                <span>${item.name}</span>
                            </a>
                        </li>
                    `;
        }).join('')}
            </ul>
        `;

        document.body.insertAdjacentElement('afterbegin', sidebar);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLayout);
    } else {
        initLayout();
    }
})();
