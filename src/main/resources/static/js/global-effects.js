document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // ===============================================
    // Chức năng: Đóng/Mở Sidebar
    // ===============================================
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    if (sidebarToggleBtn && mainContainer) {
        sidebarToggleBtn.addEventListener('click', () => {
            mainContainer.classList.toggle('sidebar-collapsed');
        });
    }

    // ===============================================
    // Hiệu ứng 1: Trang web xuất hiện mềm mại khi tải
    // ===============================================
    document.body.classList.remove('preload');

    // ===============================================
    // Hiệu ứng 2: Spotlight "màu mè" đi theo chuột
    // ===============================================
    if (window.matchMedia("(min-width: 992px)").matches) {
        document.body.addEventListener('mousemove', e => {
            document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
            document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
        });
    }

    // ===============================================
    // Hiệu ứng 3: Các thẻ (card) hiện ra khi cuộn chuột
    // ===============================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1
    });

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        observer.observe(card);
    });
    
    // ===============================================
    // Hiệu ứng 5: Kích hoạt và làm đẹp Tooltip
    // ===============================================
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"], [title]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // --- GỌI CÁC HÀM CHỨC NĂNG KHI TẢI TRANG ---
    checkUserRoleAndApplyUI();
    updateUserInfoHeader();
    handleLogout();
});


/**
 * Kiểm tra vai trò của người dùng từ token và ẩn/hiện các mục menu tương ứng.
 */
function checkUserRoleAndApplyUI() {
    const token = localStorage.getItem('accessToken');

    // Nếu không có token và không phải trang đăng nhập, chuyển hướng
    if (!token && !window.location.pathname.endsWith('/dang-nhap.html')) {
        window.location.href = '/dang-nhap.html';
        return;
    }
    
    // Nếu có token thì mới tiến hành giải mã
    if (token) {
        try {
            // Giải mã phần payload của JWT
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = atob(payloadBase64);
            const payload = JSON.parse(decodedPayload);

            const userRoles = payload.roles; // Lấy chuỗi roles, ví dụ: "ROLE_MANAGER" hoặc "ROLE_STAFF"

            // Nếu người dùng là STAFF, ẩn các mục menu của Manager
            if (userRoles && userRoles.includes('ROLE_STAFF')) {
                const paymentMenuItem = document.getElementById('menu-thanh-toan');
                const accountMenuItem = document.getElementById('menu-tai-khoan');
                const textHethong = document.getElementById('text-hethong');
                const dashboard = document.getElementById('menu-dashboard')
                if (paymentMenuItem) {
                    paymentMenuItem.style.display = 'none';
                }
                if (accountMenuItem) {
                    accountMenuItem.style.display = 'none';
                }
                if (textHethong) {
                    textHethong.style.display = 'none';
                }
                 if (dashboard) {
                    dashboard.style.display = 'none';
                }
            }
        } catch (e) {
            console.error('Lỗi giải mã token hoặc áp dụng UI:', e);
            // Nếu token không hợp lệ, xóa và về trang đăng nhập
            localStorage.clear();
            window.location.href = '/dang-nhap.html';
        }
    }
}


/**
 * Hàm gọi API để lấy thông tin người dùng hiện tại và cập nhật header.
 */
async function updateUserInfoHeader() {
    const token = localStorage.getItem('accessToken');
    if (!token) return; // Không làm gì nếu không có token

    const userFullNameElement = document.getElementById('user-fullname-header');
    const userRoleElement = document.getElementById('user-role-header');

    // Nếu không tìm thấy các element này trên trang thì không cần làm gì
    if (!userFullNameElement || !userRoleElement) return;

    try {
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            userFullNameElement.textContent = user.fullName;
            userRoleElement.textContent = user.role === 'MANAGER' ? 'Quản trị viên' : 'Nhân viên';
        } else if (response.status === 401 || response.status === 403) {
            // Nếu token không hợp lệ, xóa và về trang đăng nhập
            localStorage.clear();
            window.location.href = '/dang-nhap.html';
        }
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        userFullNameElement.textContent = 'Lỗi tải';
    }
}

/**
 * Hàm xử lý đăng xuất
 */
function handleLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('tokenType');
            window.location.href = '/dang-nhap.html';
        });
    }
}