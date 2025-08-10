document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const API_BASE_URL = '/api';
    const accountsTableBody = document.getElementById('accounts-table-body');
    const addAccountModal = new bootstrap.Modal(document.getElementById('addAccountModal'));
    const editAccountModal = new bootstrap.Modal(document.getElementById('editAccountModal'));
    const saveAddBtn = document.querySelector('#addAccountModal .btn-primary');
    const saveEditBtn = document.querySelector('#editAccountModal .btn-primary');

    async function fetchApi(endpoint, options = {}) {
        const token = localStorage.getItem('accessToken');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401 || response.status === 403) {
            const errorData = await response.json().catch(() => ({ message: 'Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.' }));
            throw new Error(errorData.message);
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

    // --- HÀM VALIDATION MỚI ---
    const validateEmail = (email) => {
        if (!email) return false; // Email là bắt buộc
        const re = /^[^S@]+@[^S@]+\.[^S@]+$/; // Sử dụng regex đơn giản và chuẩn hơn
        return re.test(String(email).toLowerCase());
    };

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

    async function handleAddAccount(event) {
        event.preventDefault();
        const errorAlert = document.getElementById('add-error-message');
        errorAlert.classList.add('d-none');

        const fullName = document.getElementById('add-fullname').value;
        const username = document.getElementById('add-username').value;
        const password = document.getElementById('add-password').value;
        const email = document.getElementById('add-email').value;

        // --- VALIDATION ---
        if (!fullName.trim() || !username.trim() || !password.trim()) {
            errorAlert.textContent = 'Vui lòng điền đầy đủ các trường bắt buộc (Tên, Tên đăng nhập, Mật khẩu).';
            errorAlert.classList.remove('d-none');
            return;
        }
        if (!validateEmail(email)) {
            errorAlert.textContent = 'Vui lòng nhập địa chỉ email hợp lệ.';
            errorAlert.classList.remove('d-none');
            return;
        }
        if (password.length < 6) {
            errorAlert.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
            errorAlert.classList.remove('d-none');
            return;
        }
        // --- END VALIDATION ---

        const accountData = {
            fullName: fullName,
            username: username,
            password: password,
            email: email,
            role: document.getElementById('add-role').value
        };
        try {
            await fetchApi('/users', {
                method: 'POST',
                body: JSON.stringify(accountData)
            });
            addAccountModal.hide();
            document.getElementById('add-account-form').reset();
            loadAccounts();
        } catch (error) {
            errorAlert.textContent = `Tạo tài khoản thất bại: ${error.message}`;
            errorAlert.classList.remove('d-none');
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
        const errorAlert = document.getElementById('edit-error-message');
        errorAlert.classList.add('d-none');

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
            errorAlert.textContent = `Cập nhật thất bại: ${error.message}`;
            errorAlert.classList.remove('d-none');
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