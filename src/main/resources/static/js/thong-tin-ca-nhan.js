// document.addEventListener('DOMContentLoaded', function () {
//     'use strict';

//     // --- CSDL MẪU: Dữ liệu của người dùng đang đăng nhập ---
//     const currentUser = {
//         username: 'admin',
//         password: '123', // Trong thực tế không bao giờ lưu password ở client
//         role: 'Admin',
//         name: 'Quang Đẹp Zai',
//         phone: '0987654321',
//         email: 'admin@artgallery.com',
//         status: true
//     };

//     // --- Lấy các phần tử DOM ---
//     const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
//     const mainContainer = document.querySelector('.main-container');
//     const infoForm = document.getElementById('info-form');
//     const passwordForm = document.getElementById('password-form');

//     // --- Hàm điền dữ liệu vào giao diện ---
//     function populateProfileData() {
//         // Cột trái
//         document.getElementById('profile-name').textContent = currentUser.name;
//         document.getElementById('profile-role').textContent = currentUser.role;
//         document.getElementById('profile-username').textContent = `@${currentUser.username}`;

//         // Form thông tin chung
//         document.getElementById('info-name').value = currentUser.name;
//         document.getElementById('info-email').value = currentUser.email;
//         document.getElementById('info-phone').value = currentUser.phone;
//         document.getElementById('info-username').value = currentUser.username;
//         document.getElementById('info-role').value = currentUser.role;
//     }

//     // --- Gắn các sự kiện ---
//     sidebarToggleBtn.addEventListener('click', () => {
//         mainContainer.classList.toggle('sidebar-collapsed');
//     });

//     infoForm.addEventListener('submit', function(event) {
//         event.preventDefault();
//         alert('Đã cập nhật thông tin cá nhân thành công! (hành động mô phỏng)');
//     });

//     passwordForm.addEventListener('submit', function(event) {
//         event.preventDefault();
//         const currentPassword = document.getElementById('current-password').value;
//         const newPassword = document.getElementById('new-password').value;
//         const confirmPassword = document.getElementById('confirm-password').value;

//         if (newPassword !== confirmPassword) {
//             alert('Mật khẩu mới không khớp. Vui lòng kiểm tra lại.');
//             return;
//         }

//         if (newPassword.length < 6) {
//             alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
//             return;
//         }

//         // Mô phỏng việc kiểm tra mật khẩu cũ và lưu
//         alert('Đổi mật khẩu thành công! (hành động mô phỏng)');
//         passwordForm.reset(); // Xóa các ô input
//     });

//     // --- Khởi chạy ---
//     populateProfileData();
// });

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- LẤY API VÀ TOKEN ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    // --- Lấy các phần tử DOM ---
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const infoForm = document.getElementById('info-form');
    const passwordForm = document.getElementById('password-form');

    // --- Hàm gọi API chung ---
    async function fetchApi(endpoint, options = {}) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        });
        if (!response.ok) {
            // Nếu token hết hạn hoặc không hợp lệ, server sẽ trả về lỗi 401 hoặc 403
            if (response.status === 401 || response.status === 403) {
                window.location.href = '/dang-nhap.html'; // Chuyển về trang đăng nhập
            }
            throw new Error('Lỗi mạng hoặc server.');
        }
        return response.json();
    }

    // --- Hàm điền dữ liệu vào giao diện ---
    function populateProfileData(user) {
        if (!user) return;
        // Cột trái
        document.getElementById('profile-name').textContent = user.fullName;
        document.getElementById('profile-role').textContent = user.role === 'MANAGER' ? 'Quản trị viên' : 'Nhân viên';
        document.getElementById('profile-username').textContent = `@${user.username}`;

        // Form thông tin chung
        document.getElementById('info-name').value = user.fullName;
        document.getElementById('info-email').value = user.email;
        document.getElementById('info-phone').value = user.phone || ''; // Xử lý nếu phone là null
        document.getElementById('info-username').value = user.username;
        document.getElementById('info-role').value = user.role === 'MANAGER' ? 'Quản trị viên' : 'Nhân viên';
    }

    // --- Hàm tải dữ liệu người dùng ---
    async function loadCurrentUser() {
        try {
            const user = await fetchApi('/users/me');
            populateProfileData(user);
        } catch (error) {
            console.error('Không thể tải thông tin người dùng:', error);
            alert('Không thể tải thông tin cá nhân. Vui lòng đăng nhập lại.');
        }
    }

    // --- Gắn các sự kiện ---
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            mainContainer.classList.toggle('sidebar-collapsed');
        });
    }

    infoForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Lấy dữ liệu từ form
        const updatedInfo = {
            fullName: document.getElementById('info-name').value,
            email: document.getElementById('info-email').value,
            phone: document.getElementById('info-phone').value
        };

        try {
            const updatedUser = await fetchApi('/users/me', {
                method: 'PUT',
                body: JSON.stringify(updatedInfo)
            });

            // Cập nhật lại giao diện với thông tin mới
            populateProfileData(updatedUser);
            alert('Cập nhật thông tin thành công!');

        } catch (error) {
            console.error('Lỗi cập nhật thông tin:', error);
            // Cần có một hàm để hiển thị lỗi đẹp hơn, tạm thời dùng alert
            alert('Cập nhật thất bại. Vui lòng thử lại.');
        }
    });

    passwordForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert('Mật khẩu mới không khớp. Vui lòng kiểm tra lại.');
            return;
        }

        const passwordData = {
            currentPassword: currentPassword,
            newPassword: newPassword
        };

        try {
            // Gọi API đổi mật khẩu
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(passwordData)
            });

            if (response.ok) {
                alert('Đổi mật khẩu thành công!');
                passwordForm.reset(); // Xóa các ô input
            } else {
                const errorData = await response.json();
                alert(`Lỗi: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Lỗi đổi mật khẩu:', error);
            alert('Đổi mật khẩu thất bại. Vui lòng thử lại.');
        }
    });

    // --- Khởi chạy ---
    loadCurrentUser();
});