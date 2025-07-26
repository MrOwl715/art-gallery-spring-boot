document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // ===============================================
    // Hiệu ứng 1: Trang web xuất hiện mềm mại khi tải
    // ===============================================
    // Xóa class 'preload' khỏi body để kích hoạt hiệu ứng transition trong CSS
    document.body.classList.remove('preload');


    // ===============================================
    // Hiệu ứng 2: Spotlight "màu mè" đi theo chuột
    // ===============================================
    // Chỉ kích hoạt hiệu ứng này trên các màn hình lớn (desktop)
    if (window.matchMedia("(min-width: 992px)").matches) {
        document.body.addEventListener('mousemove', e => {
            // Cập nhật vị trí của chuột vào các biến CSS
            document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
            document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
        });
    }

    checkUserRoleAndApplyUI();
    // ===============================================
    // Hiệu ứng 3: Các thẻ (card) hiện ra khi cuộn chuột
    // ===============================================
    // Sử dụng Intersection Observer API để có hiệu năng tốt nhất
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1 // Kích hoạt khi 10% của element hiện ra
    });

    // Tìm tất cả các thẻ có class .card và quan sát chúng
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        observer.observe(card);
    });

});

// Thêm vào file: js/global-effects.js

// ===============================================
// Hiệu ứng 5: Kích hoạt và làm đẹp Tooltip
// ===============================================
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"], [title]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

function checkUserRoleAndApplyUI() {
    const token = localStorage.getItem('accessToken');

    // Nếu không có token, chuyển về trang đăng nhập
    if (!token && window.location.pathname !== '/dang-nhap.html') {
        window.location.href = '/dang-nhap.html';
        return;
    }

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
            if (paymentMenuItem) {
                paymentMenuItem.style.display = 'none';
            }
            if (accountMenuItem) {
                accountMenuItem.style.display = 'none';
            }
            if (textHethong) {
                textHethong.style.display = 'none';
            }
        }
    } catch (e) {
        console.error('Lỗi giải mã token hoặc áp dụng UI:', e);
        // Nếu token không hợp lệ, xóa và về trang đăng nhập
        localStorage.clear();
        window.location.href = '/dang-nhap.html';
    }
}