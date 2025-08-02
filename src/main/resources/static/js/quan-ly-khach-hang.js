document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    // --- BIẾN LƯU TRỮ ---
    let allCustomers = [];

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const customersTableBody = document.getElementById('customers-table-body');
    const addCustomerModal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    const editCustomerModal = new bootstrap.Modal(document.getElementById('editCustomerModal'));
    const purchaseHistoryModal = new bootstrap.Modal(document.getElementById('purchaseHistoryModal')); // Modal mới

    const saveAddBtn = document.querySelector('#addCustomerModal .btn-primary');
    const saveEditBtn = document.querySelector('#editCustomerModal .btn-primary');
    
    // DOM cho Tìm kiếm & Lọc
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const searchBtn = document.getElementById('search-btn');

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

    // --- CÁC HÀM TIỆN ÍCH ---
    const getStatusBadge = (status) => `<span class="badge ${status ? 'bg-success' : 'bg-secondary'}">${status ? 'Hoạt động' : 'Tạm ẩn'}</span>`;
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

    // --- HÀM RENDER ---
    function renderCustomers(customers) {
        customersTableBody.innerHTML = '';
        if (!customers || customers.length === 0) {
            customersTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5">Không tìm thấy khách hàng nào</td></tr>';
            return;
        }
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><div class="fw-bold">${customer.name}</div></td>
                <td><div><i class="bi bi-phone me-2"></i>${customer.phone || ''}</div><div><i class="bi bi-envelope me-2"></i>${customer.email || ''}</div></td>
                <td>${customer.address || 'Chưa có'}</td>
                <td class="text-center">${getStatusBadge(customer.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${customer.id}" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-info history-btn" data-id="${customer.id}" title="Lịch sử mua hàng"><i class="bi bi-clock-history"></i></button>
                </td>
            `;
            customersTableBody.appendChild(row);
        });
    }

    // --- HÀM LỌC VÀ TÌM KIẾM ---
    function filterAndRenderCustomers() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusValue = statusFilter.value;

        let filteredCustomers = allCustomers;

        if (statusValue !== 'all') {
            const isActive = (statusValue === 'true');
            filteredCustomers = filteredCustomers.filter(c => c.status === isActive);
        }

        if (searchTerm) {
            filteredCustomers = filteredCustomers.filter(c => 
                c.name.toLowerCase().includes(searchTerm) ||
                (c.phone && c.phone.includes(searchTerm)) ||
                (c.email && c.email.toLowerCase().includes(searchTerm))
            );
        }

        renderCustomers(filteredCustomers);
    }

    // --- HÀM TẢI DỮ LIỆU ---
    async function loadCustomers() {
        try {
            allCustomers = await fetchApi('/customers');
            filterAndRenderCustomers();
        } catch (error) {
            alert(`Lỗi tải danh sách khách hàng: ${error.message}`);
        }
    }

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
    async function handleAddCustomer(event) {
        event.preventDefault();
        const customerData = {
            name: document.getElementById('add-customer-name').value,
            phone: document.getElementById('add-customer-phone').value,
            email: document.getElementById('add-customer-email').value,
            address: document.getElementById('add-customer-address').value,
            status: true
        };

        try {
            await fetchApi('/customers', { method: 'POST', body: JSON.stringify(customerData) });
            addCustomerModal.hide();
            document.getElementById('add-customer-form').reset();
            loadCustomers();
        } catch (error) {
            alert(`Thêm thất bại: ${error.message}`);
        }
    }

    async function handleEditClick(customerId) {
        try {
            const customer = await fetchApi(`/customers/${customerId}`);
            document.getElementById('edit-customer-id').value = customer.id;
            document.getElementById('edit-customer-name').value = customer.name;
            document.getElementById('edit-customer-phone').value = customer.phone;
            document.getElementById('edit-customer-email').value = customer.email;
            document.getElementById('edit-customer-address').value = customer.address;
            document.getElementById('edit-customer-status').value = customer.status.toString();
            editCustomerModal.show();
        } catch (error) {
            alert(`Lỗi: ${error.message}`);
        }
    }
    
    async function handleUpdateCustomer(event) {
        event.preventDefault();
        const customerId = document.getElementById('edit-customer-id').value;
        const customerData = {
            name: document.getElementById('edit-customer-name').value,
            phone: document.getElementById('edit-customer-phone').value,
            email: document.getElementById('edit-customer-email').value,
            address: document.getElementById('edit-customer-address').value,
            status: document.getElementById('edit-customer-status').value === 'true'
        };

        try {
            await fetchApi(`/customers/${customerId}`, { method: 'PUT', body: JSON.stringify(customerData) });
            editCustomerModal.hide();
            loadCustomers();
        } catch (error)
        {
            alert(`Cập nhật thất bại: ${error.message}`);
        }
    }

    // --- HÀM MỚI: XỬ LÝ XEM LỊCH SỬ MUA HÀNG ---
    async function handleHistoryClick(customerId) {
        try {
            const customer = allCustomers.find(c => c.id == customerId);
            if (!customer) return;

            document.getElementById('history-customer-name').textContent = customer.name;
            const historyTableBody = document.getElementById('history-table-body');
            historyTableBody.innerHTML = '<tr><td colspan="3" class="text-center">Đang tải...</td></tr>';
            purchaseHistoryModal.show();
            
            const orders = await fetchApi(`/customers/${customerId}/orders`);
            
            if (orders.length === 0) {
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
            alert(`Lỗi khi tải lịch sử mua hàng: ${error.message}`);
            purchaseHistoryModal.hide();
        }
    }

    // --- GẮN CÁC SỰ KIỆN ---
    saveAddBtn.addEventListener('click', handleAddCustomer);
    saveEditBtn.addEventListener('click', handleUpdateCustomer);

    customersTableBody.addEventListener('click', function(event) {
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
    
    searchBtn.addEventListener('click', filterAndRenderCustomers);
    statusFilter.addEventListener('change', filterAndRenderCustomers);
    searchInput.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') filterAndRenderCustomers();
    });
    
    const editStatusSelect = document.getElementById('edit-customer-status');
    if (editStatusSelect) {
        editStatusSelect.innerHTML = `<option value="true">Hoạt động</option><option value="false">Tạm ẩn</option>`;
    }

    // --- KHỞI CHẠY ---
    loadCustomers();
});