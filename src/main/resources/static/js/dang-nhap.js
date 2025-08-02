// document.addEventListener('DOMContentLoaded', function() {
//     'use strict';

//     const loginForm = document.getElementById('login-form');

//     if (loginForm) {
//         loginForm.addEventListener('submit', function(event) {
//             // Ngăn chặn hành vi gửi form mặc định của trình duyệt
//             event.preventDefault();

//             // Lấy giá trị từ các ô input
//             const username = document.getElementById('username').value;
//             const password = document.getElementById('password').value;

//             // Mô phỏng việc kiểm tra đăng nhập
//             // Trong dự án thực tế, đây là lúc bạn sẽ gọi API của Backend
//             if (username.trim() !== '' && password.trim() !== '') {
//                 // Nếu đăng nhập thành công (chỉ cần nhập bất cứ gì)
//                 alert('Đăng nhập thành công! Đang chuyển hướng đến trang quản trị...');
                
//                 // Chuyển hướng người dùng đến trang tổng quan (index.html)
//                 window.location.href = 'index.html';
//             } else {
//                 // Nếu thất bại
//                 alert('Tên đăng nhập và mật khẩu không được để trống.');
//             }
//         });
//     }
// });

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const errorMessageDiv = document.getElementById('error-message');

    loginForm.addEventListener('submit', async function (event) {
        // Ngăn form gửi đi theo cách truyền thống
        event.preventDefault();

        // Xóa thông báo lỗi cũ
        errorMessageDiv.textContent = '';

        // Lấy giá trị từ các ô input
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Tạo đối tượng body cho request
        const loginData = {
            username: username,
            password: password
        };

        try {
            // Gọi API đăng nhập
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            // Nếu đăng nhập thành công
            if (response.ok) {
                const data = await response.json();
                
                // Lưu token vào localStorage của trình duyệt
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('tokenType', data.tokenType);
                
                // Chuyển hướng đến trang dashboard (hoặc trang chính)
                window.location.href = '/ban-hang.html'; // Đổi tên file nếu trang chính của bạn khác
            } else {
                // Nếu có lỗi (sai pass, user không tồn tại,...)
                const errorData = await response.json();
                errorMessageDiv.textContent = errorData.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
            }
        } catch (error) {
            // Lỗi mạng hoặc server không phản hồi
            console.error('Login error:', error);
            errorMessageDiv.textContent = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        }
    });
});