document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CSDL MẪU ---
    const sampleAccounts = [
        { id: 'acc01', username: 'admin', employeeName: 'Quang Đẹp Zai', email: 'admin@artgallery.com', role: 'Admin', status: 'Hoạt động' },
        { id: 'acc02', username: 'nhanvien1', employeeName: 'Nguyễn Văn A', email: 'nhanvien1@artgallery.com', role: 'Nhân viên', status: 'Hoạt động' },
        { id: 'acc03', username: 'nhanvien2', employeeName: 'Lê Thị B', email: 'nhanvien2@artgallery.com', role: 'Nhân viên', status: 'Dừng hoạt động' },
    ];

    // --- Lấy các phần tử DOM (đã bổ sung) ---
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const accountsTableBody = document.getElementById('accounts-table-body');
    const editAccountModal = new bootstrap.Modal(document.getElementById('editAccountModal'));
    const resetPasswordModal = new bootstrap.Modal(document.getElementById('resetPasswordModal')); // Modal mới

    // --- Hàm tiện ích ---
    const getStatusBadge = (status) => `<span class="badge ${status === 'Hoạt động' ? 'bg-success' : 'bg-secondary'}">${status}</span>`;
    const getRoleBadge = (role) => `<span class="badge ${role === 'Admin' ? 'bg-primary' : 'bg-info'}">${role}</span>`;

    // --- Hàm Render (đã cập nhật nút bấm) ---
    function renderAccounts(accounts) {
        accountsTableBody.innerHTML = '';
        if (!accounts || accounts.length === 0) {
            accountsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">Không có tài khoản nào</td></tr>'; return;
        }
        accounts.forEach(acc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><div class="fw-bold">${acc.username}</div><div class="small text-muted">${acc.id}</div></td>
                <td>${acc.employeeName}</td>
                <td>${acc.email}</td>
                <td class="text-center">${getRoleBadge(acc.role)}</td>
                <td class="text-center">${getStatusBadge(acc.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${acc.id}" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-secondary reset-password-btn" data-id="${acc.id}" title="Đặt lại mật khẩu"><i class="bi bi-key-fill"></i></button>
                </td>
            `;
            accountsTableBody.appendChild(row);
        });
    }

    // --- Hàm xử lý Logic & Modal ---
    function handleEditClick(accountId) {
        const account = sampleAccounts.find(a => a.id === accountId);
        if (!account) return;

        document.getElementById('edit-account-id').value = account.id;
        document.getElementById('edit-employee-name').value = account.employeeName;
        document.getElementById('edit-username').value = account.username;
        document.getElementById('edit-email').value = account.email;
        document.getElementById('edit-role').value = account.role;
        document.getElementById('edit-status').value = account.status;
        
        editAccountModal.show();
    }

    // --- HÀM MỚI: Xử lý cho modal đặt lại mật khẩu ---
    function handleResetPasswordClick(accountId) {
        const account = sampleAccounts.find(a => a.id === accountId);
        if (!account) return;
        
        // Điền thông tin vào modal
        document.getElementById('reset-password-username').textContent = account.username;
        document.getElementById('reset-password-account-id').value = account.id;
        
        // Reset các ô nhập mật khẩu
        document.getElementById('reset-password-form').reset();

        resetPasswordModal.show();
    }

    // --- Gắn các sự kiện (đã cập nhật) ---
    sidebarToggleBtn.addEventListener('click', () => {
        mainContainer.classList.toggle('sidebar-collapsed');
    });

    accountsTableBody.addEventListener('click', function(event) {
        const editBtn = event.target.closest('.edit-btn');
        const resetBtn = event.target.closest('.reset-password-btn'); // Lắng nghe nút mới

        if (editBtn) {
            handleEditClick(editBtn.dataset.id);
        }
        if (resetBtn) {
            handleResetPasswordClick(resetBtn.dataset.id);
        }
    });
    
    // Gắn sự kiện cho nút "Lưu mật khẩu mới"
    document.getElementById('save-new-password-btn').addEventListener('click', function() {
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!newPassword || newPassword !== confirmPassword) {
            alert('Mật khẩu mới không hợp lệ hoặc không khớp. Vui lòng kiểm tra lại.');
            return;
        }

        // Mô phỏng hành động lưu
        const accountId = document.getElementById('reset-password-account-id').value;
        alert(`Đã đặt lại mật khẩu thành công cho tài khoản có ID: ${accountId}. (Hành động mô phỏng)`);
        resetPasswordModal.hide();
    });

    // --- Khởi chạy ---
    renderAccounts(sampleAccounts);
});