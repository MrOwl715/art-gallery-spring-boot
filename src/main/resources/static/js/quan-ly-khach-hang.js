document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';

    // --- BIẾN LƯU TRỮ ---
    let allCustomers = [];
    let timeoutId; // Biến để lưu ID của setTimeout cho debounce

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const customersTableBody = document.getElementById('customers-table-body');
    const addCustomerModal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    const editCustomerModal = new bootstrap.Modal(document.getElementById('editCustomerModal'));
    const purchaseHistoryModal = new bootstrap.Modal(document.getElementById('purchaseHistoryModal'));

    const addCustomerForm = document.getElementById('add-customer-form');
    const editCustomerForm = document.getElementById('edit-customer-form');

    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');

    // --- HÀM TIỆN ÍCH ---
    const getStatusBadge = (status) => `<span class="badge ${status ? 'bg-success' : 'bg-secondary'}">${status ? 'Hoạt động' : 'Tạm ẩn'}</span>`;
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

    // Hàm hiển thị thông báo lỗi/thành công
    function showToast(message, isSuccess = true) {
        const toastEl = document.getElementById('liveToast');
        const toastBody = toastEl.querySelector('.toast-body');
        toastBody.textContent = message;
        toastEl.classList.remove('bg-danger', 'bg-success');
        toastEl.classList.add(isSuccess ? 'bg-success' : 'bg-danger');
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

    // Hàm Debounce
    function debounce(func, delay = 500) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
    }

    // --- HÀM GỌI API CHUNG ---
    async function fetchApi(endpoint, options = {}) {
        const token = localStorage.getItem('accessToken');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('accessToken');
                showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', false);
                setTimeout(() => window.location.href = '/dang-nhap.html', 2000);
                return;
            }

            if (!response.ok) {
                let errorMessage = 'Có lỗi xảy ra';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {}
                throw new Error(errorMessage);
            }

            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            showToast(`Lỗi API: ${error.message}`, false);
            throw error;
        }
    }

    // --- RENDER DANH SÁCH KHÁCH HÀNG ---
    function renderCustomers(customers) {
        customersTableBody.innerHTML = '';
        if (!Array.isArray(customers) || customers.length === 0) {
            customersTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5">Không tìm thấy khách hàng nào</td></tr>';
            return;
        }
        const fragment = document.createDocumentFragment();
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><div class="fw-bold">${customer.name}</div></td>
                <td>
                    <div><i class="bi bi-phone me-2"></i>${customer.phone || 'N/A'}</div>
                    <div><i class="bi bi-envelope me-2"></i>${customer.email || 'N/A'}</div>
                </td>
                <td>${customer.address || 'Chưa có'}</td>
                <td class="text-center">${getStatusBadge(customer.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${customer.id}" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-info history-btn" data-id="${customer.id}" title="Lịch sử mua hàng"><i class="bi bi-clock-history"></i></button>
                </td>
            `;
            fragment.appendChild(row);
        });
        customersTableBody.appendChild(fragment);
    }

    // --- LỌC & TÌM KIẾM ---
    function filterAndRenderCustomers() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusValue = statusFilter.value;

        let filtered = allCustomers;

        if (statusValue !== 'all') {
            const isActive = (statusValue === 'true');
            filtered = filtered.filter(c => c.status === isActive);
        }

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm) ||
                (c.phone && c.phone.toString().includes(searchTerm)) ||
                (c.email && c.email.toLowerCase().includes(searchTerm))
            );
        }
        renderCustomers(filtered);
    }

    // --- LOAD DANH SÁCH ---
    async function loadCustomers() {
        customersTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';
        try {
            allCustomers = await fetchApi('/customers');
            filterAndRenderCustomers();
        } catch (error) {
            // Lỗi đã được xử lý trong fetchApi, chỉ cần log ra
            console.error(error);
        }
    }

    // --- VALIDATE DỮ LIỆU ---
    function validateCustomerData(name, phone, email) {
        if (!name) {
            showToast('Tên khách hàng không được để trống.', false);
            return false;
        }
        if (phone && !/^\d{9,12}$/.test(phone)) {
            showToast('Số điện thoại không hợp lệ.', false);
            return false;
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Email không hợp lệ.', false);
            return false;
        }
        return true;
    }

    // --- THÊM KHÁCH HÀNG ---
    addCustomerForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const name = document.getElementById('add-customer-name').value.trim();
        const phone = document.getElementById('add-customer-phone').value.trim();
        const email = document.getElementById('add-customer-email').value.trim();
        const address = document.getElementById('add-customer-address').value.trim();

        if (!validateCustomerData(name, phone, email)) return;

        const customerData = { name, phone, email, address, status: true };
        const saveBtn = addCustomerForm.querySelector('button[type="submit"]');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang lưu...';

        try {
            await fetchApi('/customers', { method: 'POST', body: JSON.stringify(customerData) });
            addCustomerModal.hide();
            addCustomerForm.reset();
            showToast('Thêm khách hàng thành công!');
            loadCustomers();
        } catch (error) {
            console.error(error);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Lưu lại';
        }
    });

    // --- SỬA KHÁCH HÀNG ---
    async function handleEditClick(customerId) {
        try {
            const customer = await fetchApi(`/customers/${customerId}`);
            if (!customer) return;
            document.getElementById('edit-customer-id').value = customer.id;
            document.getElementById('edit-customer-name').value = customer.name || '';
            document.getElementById('edit-customer-phone').value = customer.phone || '';
            document.getElementById('edit-customer-email').value = customer.email || '';
            document.getElementById('edit-customer-address').value = customer.address || '';
            document.getElementById('edit-customer-status').value = (customer.status ?? false).toString();
            editCustomerModal.show();
        } catch (error) {
            console.error(error);
        }
    }

    editCustomerForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const customerId = document.getElementById('edit-customer-id').value;
        const name = document.getElementById('edit-customer-name').value.trim();
        const phone = document.getElementById('edit-customer-phone').value.trim();
        const email = document.getElementById('edit-customer-email').value.trim();
        const address = document.getElementById('edit-customer-address').value.trim();
        const status = document.getElementById('edit-customer-status').value === 'true';

        if (!validateCustomerData(name, phone, email)) return;

        const customerData = { name, phone, email, address, status };
        const saveBtn = editCustomerForm.querySelector('button[type="submit"]');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang cập nhật...';

        try {
            await fetchApi(`/customers/${customerId}`, { method: 'PUT', body: JSON.stringify(customerData) });
            editCustomerModal.hide();
            showToast('Cập nhật khách hàng thành công!');
            loadCustomers();
        } catch (error) {
            console.error(error);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Lưu thay đổi';
        }
    });

    // --- LỊCH SỬ MUA HÀNG ---
    async function handleHistoryClick(customerId) {
        const customer = allCustomers.find(c => c.id == customerId);
        if (!customer) return;

        document.getElementById('history-customer-name').textContent = customer.name;
        const historyTableBody = document.getElementById('history-table-body');
        historyTableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary" role="status"></div> Đang tải...</td></tr>';
        purchaseHistoryModal.show();

        try {
            const orders = await fetchApi(`/customers/${customerId}/orders`);
            
            if (!Array.isArray(orders) || orders.length === 0) {
                historyTableBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Khách hàng này chưa có đơn hàng nào.</td></tr>';
                return;
            }

            historyTableBody.innerHTML = '';
            orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${order.id}</td>
                    <td>${formatDate(order.orderDate)}</td>
                    <td class="text-end fw-bold">${formatCurrency(order.totalAmount)}</td>
                `;
                historyTableBody.appendChild(row);
            });

        } catch (error) {
            console.error(error);
            historyTableBody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Có lỗi khi tải lịch sử. Vui lòng thử lại.</td></tr>';
        }
    }

    // --- GẮN SỰ KIỆN ---
    customersTableBody.addEventListener('click', function (event) {
        const editBtn = event.target.closest('.edit-btn');
        if (editBtn) {
            handleEditClick(editBtn.dataset.id);
            return;
        }

        const historyBtn = event.target.closest('.history-btn');
        if (historyBtn) {
            handleHistoryClick(historyBtn.dataset.id);
        }
    });

    searchInput.addEventListener('input', () => debounce(filterAndRenderCustomers, 300));
    statusFilter.addEventListener('change', filterAndRenderCustomers);

    // Set options cho status select khi edit
    const editStatusSelect = document.getElementById('edit-customer-status');
    if (editStatusSelect) {
        editStatusSelect.innerHTML = `<option value="true">Hoạt động</option><option value="false">Tạm ẩn</option>`;
    }

    // --- KHỞI CHẠY ---
    loadCustomers();
});