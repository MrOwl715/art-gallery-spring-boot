document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const tableBody = document.getElementById('payment-methods-table-body');
    const addModal = new bootstrap.Modal(document.getElementById('addPaymentModal'));
    const editModal = new bootstrap.Modal(document.getElementById('editPaymentModal'));
    
    const addForm = document.getElementById('add-payment-form');
    const saveAddBtn = document.querySelector('#addPaymentModal .btn-primary');
    
    const saveEditBtn = document.querySelector('#editPaymentModal .btn-primary');

    // --- HÀM GỌI API CHUNG ---
    async function fetchApi(endpoint, options = {}) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers },
        });
        if (response.status === 401 || response.status === 403) { window.location.href = '/dang-nhap.html'; }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Có lỗi xảy ra');
        }
        if (response.status === 204) return null;
        return response.json();
    }

    // --- HÀM MỚI: UPLOAD FILE ---
    async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    // Khi gửi FormData, trình duyệt sẽ tự động đặt Content-Type là multipart/form-data
    // nên chúng ta không cần khai báo nó trong headers.
    const response = await fetch(`${API_BASE_URL}/files/upload/qr`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Xóa dòng 'Content-Type': 'application/json'
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Upload file thất bại.');
    }
    const result = await response.json();
    return result.filePath; // Trả về đường dẫn file trên server
}


    // --- HÀM TIỆN ÍCH & RENDER ---
    const getStatusBadge = (status) => `<span class="badge ${status ? 'bg-success' : 'bg-secondary'}">${status ? 'Hoạt động' : 'Tạm ẩn'}</span>`;

    function renderMethods(methods) {
        tableBody.innerHTML = '';
        if (!methods || methods.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">Chưa có phương thức thanh toán nào</td></tr>';
            return;
        }
        methods.forEach((method, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td><div class="fw-bold">${method.method}</div></td>
                <td>${method.description || ''}</td>
                <td>${method.accountNumber || ''}</td>
                <td class="text-center">${getStatusBadge(method.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${method.id}" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${method.id}" title="Xóa"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // --- HÀM TẢI DỮ LIỆU ---
    async function loadMethods() {
        try {
            const methods = await fetchApi('/payment-methods');
            renderMethods(methods);
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
            alert(error.message);
        }
    }

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
    async function handleAdd(event) {
        event.preventDefault();
        const fileInput = document.getElementById('add-method-qr-file');
        let qrCodeImageUrl = '';

        try {
            if (fileInput.files.length > 0) {
                qrCodeImageUrl = await uploadFile(fileInput.files[0]);
            }

            const data = {
                method: document.getElementById('add-method-name').value,
                description: document.getElementById('add-method-desc').value,
                accountNumber: document.getElementById('add-method-account').value,
                qrCodeImageUrl: qrCodeImageUrl,
                status: true
            };
            
            await fetchApi('/payment-methods', { method: 'POST', body: JSON.stringify(data) });
            addModal.hide();
            addForm.reset();
            loadMethods();
        } catch (error) {
            alert(`Thêm thất bại: ${error.message}`);
        }
    }

    async function handleEditClick(methodId) {
        try {
            const method = await fetchApi(`/payment-methods/${methodId}`);
            document.getElementById('edit-method-id').value = method.id;
            document.getElementById('edit-method-name').value = method.method;
            document.getElementById('edit-method-desc').value = method.description;
            document.getElementById('edit-method-account').value = method.accountNumber;
            document.getElementById('edit-method-qr-url').value = method.qrCodeImageUrl || '';
            document.getElementById('edit-method-status').value = method.status.toString();
            editModal.show();
        } catch (error) {
            alert(`Lỗi: ${error.message}`);
        }
    }
    
    async function handleUpdate(event) {
        event.preventDefault();
        const methodId = document.getElementById('edit-method-id').value;
        let qrCodeImageUrl = document.getElementById('edit-method-qr-url').value;
        const fileInput = document.getElementById('edit-method-qr-file');

        try {
            if (fileInput.files.length > 0) {
                qrCodeImageUrl = await uploadFile(fileInput.files[0]);
            }

            const data = {
                method: document.getElementById('edit-method-name').value,
                description: document.getElementById('edit-method-desc').value,
                accountNumber: document.getElementById('edit-method-account').value,
                qrCodeImageUrl: qrCodeImageUrl,
                status: document.getElementById('edit-method-status').value === 'true'
            };

            await fetchApi(`/payment-methods/${methodId}`, { method: 'PUT', body: JSON.stringify(data) });
            editModal.hide();
            loadMethods();
        } catch (error) {
            alert(`Cập nhật thất bại: ${error.message}`);
        }
    }

    async function handleDeleteClick(methodId) {
        if (!confirm('Bạn có chắc chắn muốn xóa phương thức này?')) return;
        try {
            await fetchApi(`/payment-methods/${methodId}`, { method: 'DELETE' });
            loadMethods();
        } catch (error) {
             alert(`Xóa thất bại: ${error.message}`);
        }
    }

    // --- GẮN CÁC SỰ KIỆN ---
    saveAddBtn.addEventListener('click', handleAdd);
    saveEditBtn.addEventListener('click', handleUpdate);

    tableBody.addEventListener('click', function(event) {
        const editBtn = event.target.closest('.edit-btn');
        if (editBtn) handleEditClick(editBtn.dataset.id);

        const deleteBtn = event.target.closest('.delete-btn');
        if (deleteBtn) handleDeleteClick(deleteBtn.dataset.id);
    });
    
    // --- KHỞI CHẠY ---
    loadMethods();
});