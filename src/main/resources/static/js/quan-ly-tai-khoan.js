document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    const accountsTableBody = document.getElementById('accounts-table-body');
    const addAccountModal = new bootstrap.Modal(document.getElementById('addAccountModal'));
    const editAccountModal = new bootstrap.Modal(document.getElementById('editAccountModal'));
    const saveAddBtn = document.querySelector('#addAccountModal .btn-primary');
    const saveEditBtn = document.querySelector('#editAccountModal .btn-primary');

    async function fetchApi(endpoint, options = {}) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers },
        });
        if (response.status === 401 || response.status === 403) {
            alert('Bạn không có quyền truy cập chức năng này hoặc phiên đăng nhập đã hết hạn.');
            window.location.href = '/index.html';
            throw new Error('Unauthorized'); // Dừng thực thi
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Có lỗi xảy ra');
        }
        if (response.status === 204) return null;
        return response.json();
    }

    const getStatusBadge = (status) => `<span class="badge ${status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}">${status === 'ACTIVE' ? 'Hoạt động' : 'Chưa kích hoạt'}</span>`;
    const getRoleBadge = (role) => `<span class="badge ${role === 'MANAGER' ? 'bg-primary' : 'bg-info'}">${role === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}</span>`;

    function renderAccounts(accounts) {
        accountsTableBody.innerHTML = '';
        if (!accounts || accounts.length === 0) {
            accountsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">Không có tài khoản nào</td></tr>'; return;
        }
        accounts.forEach(acc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><div class="fw-bold">${acc.username}</div></td>
                <td>${acc.fullName}</td>
                <td>${acc.email}</td>
                <td class="text-center">${getRoleBadge(acc.role)}</td>
                <td class="text-center">${getStatusBadge(acc.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${acc.id}" title="Chỉnh sửa trạng thái"><i class="bi bi-pencil-square"></i></button>
                </td>
            `;
            accountsTableBody.appendChild(row);
        });
    }

    async function loadAccounts() {
        try {
            const accounts = await fetchApi('/users');
            renderAccounts(accounts);
        } catch (error) {
            if (error.message !== 'Unauthorized') {
                 console.error("Lỗi tải danh sách tài khoản:", error);
            }
        }
    }

    // HÀM NÀY ĐÃ ĐƯỢC CẬP NHẬT HOÀN TOÀN
    async function handleAddAccount(event) {
        event.preventDefault();
        const errorMessageDiv = document.getElementById('add-account-error-message');
        // Ẩn thông báo lỗi cũ khi người dùng thử lại
        errorMessageDiv.classList.add('d-none');
        errorMessageDiv.innerHTML = '';


        const accountData = {
            fullName: document.getElementById('add-fullname').value,
            username: document.getElementById('add-username').value,
            password: document.getElementById('add-password').value,
            email: document.getElementById('add-email').value,
            role: document.getElementById('add-role').value
        };

        try {
            // Chúng ta sẽ trực tiếp gọi fetch ở đây để xử lý lỗi tốt hơn
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(accountData)
            });

            // Nếu request không thành công (lỗi 4xx, 5xx)
            if (!response.ok) {
                const errorData = await response.json();
                // Ném lỗi để khối catch bên dưới có thể bắt được
                throw errorData; 
            }

            // Nếu thành công
            addAccountModal.hide();
            document.getElementById('add-account-form').reset();
            loadAccounts();

        } catch (error) {
            // Khối catch này sẽ nhận được object lỗi từ backend
            let messages = [];
            // Nếu có danh sách lỗi chi tiết của từng trường
            if (error.errors) {
                for (const field in error.errors) {
                    messages.push(`<li>${error.errors[field]}</li>`);
                }
                errorMessageDiv.innerHTML = `<strong>${error.message}</strong><ul>${messages.join('')}</ul>`;
            } else {
                // Nếu chỉ có lỗi chung (ví dụ: email/username đã tồn tại)
                errorMessageDiv.textContent = error.message || 'Tạo tài khoản thất bại. Vui lòng thử lại.';
            }
            // Hiển thị vùng báo lỗi
            errorMessageDiv.classList.remove('d-none');
        }
    }

    async function handleEditClick(userId) {
        try {
            const users = await fetchApi('/users');
            const user = users.find(u => u.id == userId);
            if (!user) { alert('Không tìm thấy người dùng!'); return; }
            document.getElementById('edit-account-id').value = user.id;
            document.getElementById('edit-employee-name').value = user.fullName;
            document.getElementById('edit-username').value = user.username;
            document.getElementById('edit-email').value = user.email;
            document.getElementById('edit-role').value = user.role;
            document.getElementById('edit-status').value = user.status;
            editAccountModal.show();
        } catch (error) {
            alert(`Lỗi: ${error.message}`);
        }
    }
    
    async function handleUpdateStatus(event) {
        event.preventDefault();
        const userId = document.getElementById('edit-account-id').value;
        const newStatus = document.getElementById('edit-status').value;
        try {
            await fetchApi(`/users/${userId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            editAccountModal.hide();
            loadAccounts();
        } catch (error) {
            alert(`Cập nhật thất bại: ${error.message}`);
        }
    }

    saveAddBtn.addEventListener('click', handleAddAccount);
    saveEditBtn.addEventListener('click', handleUpdateStatus);
    accountsTableBody.addEventListener('click', function(event) {
        const editBtn = event.target.closest('.edit-btn');
        if (editBtn) handleEditClick(editBtn.dataset.id);
    });
    
    const editStatusSelect = document.getElementById('edit-status');
    if (editStatusSelect) { editStatusSelect.innerHTML = `<option value="ACTIVE">Hoạt động</option><option value="DEACTIVE">Chưa kích hoạt</option>`; }
    const editRoleSelect = document.getElementById('edit-role');
    if(editRoleSelect){ editRoleSelect.innerHTML = `<option value="STAFF">Nhân viên</option><option value="MANAGER">Quản lý</option>`; }

    loadAccounts();
});