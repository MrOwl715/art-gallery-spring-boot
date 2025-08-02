document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    // --- BIẾN LƯU TRỮ ---
    let allExportOrders = [];

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const ordersTableBody = document.getElementById('orders-table-body');
    const orderDetailModal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    const saveStatusBtn = document.getElementById('save-status-btn');
    
    // --- DOM CHO TÌM KIẾM ---
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
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
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const getStatusBadge = (status) => {
        const statusMap = {
            'COMPLETED': { class: 'bg-success', text: 'Hoàn thành' },
            'PENDING': { class: 'bg-warning text-dark', text: 'Chờ xử lý' },
            'CANCELLED': { class: 'bg-danger', text: 'Đã hủy' },
        };
        const statusInfo = statusMap[status] || { class: 'bg-secondary', text: 'Không xác định' };
        return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
    };

    // --- HÀM RENDER ---
    function renderOrders(orders) {
        ordersTableBody.innerHTML = '';
        if (orders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-5">Không có đơn hàng nào</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="fw-bold text-primary">#${order.id}</td>
                <td>${order.customerName || 'N/A'}</td>
                <td>${order.createdByUsername || 'N/A'}</td>
                <td>${formatDate(order.orderDate)}</td>
                <td class="text-end fw-bold">${formatCurrency(order.totalAmount)}</td>
                <td class="text-center">${getStatusBadge(order.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary view-detail-btn" data-id="${order.id}" title="Xem chi tiết">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
    }

    // --- HÀM LỌC VÀ TÌM KIẾM ---
    function filterAndRenderOrders() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusValue = statusFilter.value;
        const dateValue = dateFilter.value;

        let filteredOrders = allExportOrders;

        // Lọc theo trạng thái
        if (statusValue !== 'ALL') {
            filteredOrders = filteredOrders.filter(order => order.status === statusValue);
        }

        // Lọc theo ngày
        if (dateValue) {
            filteredOrders = filteredOrders.filter(order => {
                const orderDate = new Date(order.orderDate).toLocaleDateString('en-CA'); // Format YYYY-MM-DD
                return orderDate === dateValue;
            });
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            filteredOrders = filteredOrders.filter(order =>
                order.id.toString().includes(searchTerm) ||
                (order.customerName && order.customerName.toLowerCase().includes(searchTerm))
            );
        }

        renderOrders(filteredOrders);
    }

    // --- HÀM XỬ LÝ LOGIC ---
    function showOrderDetail(orderId) {
        const order = allExportOrders.find(o => o.id == orderId);
        if (!order) { alert('Không tìm thấy đơn hàng!'); return; }
        
        document.getElementById('modal-order-id').textContent = '#' + order.id;
        document.getElementById('modal-customer-name').textContent = order.customerName;
        document.getElementById('modal-employee-name').textContent = order.createdByUsername;
        document.getElementById('modal-order-date').textContent = formatDate(order.orderDate);
        document.getElementById('modal-order-status').innerHTML = getStatusBadge(order.status);
        
        const productListEl = document.getElementById('modal-product-list');
        productListEl.innerHTML = '';
        order.orderDetails.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.paintingName}</td>
                <td>${p.quantity}</td>
                <td class="text-end">${formatCurrency(p.price)}</td>
                <td class="text-end fw-bold">${formatCurrency(p.price * p.quantity)}</td>
            `;
            productListEl.appendChild(row);
        });

        document.getElementById('modal-total').textContent = formatCurrency(order.totalAmount);
        document.getElementById('update-status-select').value = order.status;
        saveStatusBtn.dataset.id = order.id;

        orderDetailModal.show();
    }

    // --- HÀM TẢI DỮ LIỆU BAN ĐẦU ---
    async function loadOrders() {
        try {
            allExportOrders = await fetchApi('/export-orders');
            filterAndRenderOrders(); // Thay vì renderOrders, gọi hàm filter để hiển thị ban đầu
        } catch (error) {
            console.error(error);
            ordersTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-5">Không thể tải dữ liệu đơn hàng.</td></tr>';
        }
    }

    // --- GẮN CÁC SỰ KIỆN ---
    ordersTableBody.addEventListener('click', function(event) {
        const viewBtn = event.target.closest('.view-detail-btn');
        if (viewBtn) {
            showOrderDetail(viewBtn.dataset.id);
        }
    });

    // Gắn sự kiện cho nút tìm kiếm và các bộ lọc
    searchBtn.addEventListener('click', filterAndRenderOrders);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            filterAndRenderOrders();
        }
    });
    statusFilter.addEventListener('change', filterAndRenderOrders);
    dateFilter.addEventListener('change', filterAndRenderOrders);

    // --- KHỞI CHẠY ---
    loadOrders();
});