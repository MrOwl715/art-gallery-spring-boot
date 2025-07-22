document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CSDL MẪU: Dữ liệu của người dùng đang đăng nhập ---
    const currentUser = {
        username: 'admin',
        password: '123', // Trong thực tế không bao giờ lưu password ở client
        role: 'Admin',
        name: 'Quang Đẹp Zai',
        phone: '0987654321',
        email: 'admin@artgallery.com',
        status: true
    };

    // --- Lấy các phần tử DOM ---
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const infoForm = document.getElementById('info-form');
    const passwordForm = document.getElementById('password-form');

    // --- Hàm điền dữ liệu vào giao diện ---
    function populateProfileData() {
        // Cột trái
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-role').textContent = currentUser.role;
        document.getElementById('profile-username').textContent = `@${currentUser.username}`;

        // Form thông tin chung
        document.getElementById('info-name').value = currentUser.name;
        document.getElementById('info-email').value = currentUser.email;
        document.getElementById('info-phone').value = currentUser.phone;
        document.getElementById('info-username').value = currentUser.username;
        document.getElementById('info-role').value = currentUser.role;
    }

    // --- Gắn các sự kiện ---
    sidebarToggleBtn.addEventListener('click', () => {
        mainContainer.classList.toggle('sidebar-collapsed');
    });

    infoForm.addEventListener('submit', function(event) {
        event.preventDefault();
        alert('Đã cập nhật thông tin cá nhân thành công! (hành động mô phỏng)');
    });

    passwordForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu mới không khớp. Vui lòng kiểm tra lại.');
            return;
        }

        if (newPassword.length < 6) {
            alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        // Mô phỏng việc kiểm tra mật khẩu cũ và lưu
        alert('Đổi mật khẩu thành công! (hành động mô phỏng)');
        passwordForm.reset(); // Xóa các ô input
    });

    // --- Khởi chạy ---
    populateProfileData();
});