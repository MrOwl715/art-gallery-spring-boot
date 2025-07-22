document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            // Ngăn chặn hành vi gửi form mặc định của trình duyệt
            event.preventDefault();

            // Lấy giá trị từ các ô input
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Mô phỏng việc kiểm tra đăng nhập
            // Trong dự án thực tế, đây là lúc bạn sẽ gọi API của Backend
            if (username.trim() !== '' && password.trim() !== '') {
                // Nếu đăng nhập thành công (chỉ cần nhập bất cứ gì)
                alert('Đăng nhập thành công! Đang chuyển hướng đến trang quản trị...');
                
                // Chuyển hướng người dùng đến trang tổng quan (index.html)
                window.location.href = 'index.html';
            } else {
                // Nếu thất bại
                alert('Tên đăng nhập và mật khẩu không được để trống.');
            }
        });
    }
});