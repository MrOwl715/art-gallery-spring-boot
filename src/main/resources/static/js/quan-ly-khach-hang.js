document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CSDL MẪU ---
    const sampleCustomers = [
        { id: 'KH001', name: 'Anh Nam', phone: '0987654321', email: 'anhnam@email.com', address: '123 Đường Láng, Đống Đa, Hà Nội', status: 'Hoạt động' },
        { id: 'KH002', name: 'Chị Lan', phone: '0912345678', email: 'chilan@email.com', address: '45 Hai Bà Trưng, Hoàn Kiếm, Hà Nội', status: 'Hoạt động' },
        { id: 'KH003', name: 'Anh Tuấn', phone: '0934567890', email: 'anhtuan@email.com', address: '78 Cầu Giấy, Cầu Giấy, Hà Nội', status: 'Dừng hoạt động' },
    ];
    const samplePurchaseHistory = {
        'KH001': [{ id: 'DH001', date: '25-06-2025', total: 450000000, status: 'Hoàn thành' }],
        'KH002': [{ id: 'DH002', date: '26-06-2025', total: 106000000, status: 'Đang xử lý' }]
    };

    // --- Lấy các phần tử DOM ---
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const customersTableBody = document.getElementById('customers-table-body');
    const editCustomerModal = new bootstrap.Modal(document.getElementById('editCustomerModal'));
    const purchaseHistoryModal = new bootstrap.Modal(document.getElementById('purchaseHistoryModal'));

    // --- Hàm tiện ích ---
    const getStatusBadge = (status, type = 'customer') => {
        let badgeClass = '';
        if (type === 'customer') {
            badgeClass = status === 'Hoạt động' ? 'bg-success' : 'bg-secondary';
        } else { // For order status
            const statusMap = {'Hoàn thành': 'bg-success', 'Đang xử lý': 'bg-info', 'Chờ xác nhận': 'bg-warning text-dark', 'Đã hủy': 'bg-danger'};
            badgeClass = statusMap[status] || 'bg-secondary';
        }
        return `<span class="badge ${badgeClass}">${status}</span>`;
    };
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // --- Hàm Render ---
    function renderCustomers(customers) {
        customersTableBody.innerHTML = '';
        if (!customers || customers.length === 0) {
            customersTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5">Không có khách hàng nào</td></tr>'; return;
        }
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><div class="fw-bold">${customer.name}</div><div class="small text-muted">${customer.id}</div></td>
                <td><div><i class="bi bi-phone me-2"></i>${customer.phone || ''}</div><div><i class="bi bi-envelope me-2"></i>${customer.email || ''}</div></td>
                <td>${customer.address || 'Chưa có'}</td>
                <td class="text-center">${getStatusBadge(customer.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${customer.id}" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-secondary history-btn" data-id="${customer.id}" title="Lịch sử mua hàng"><i class="bi bi-clock-history"></i></button>
                </td>
            `;
            customersTableBody.appendChild(row);
        });
    }

    // --- Hàm xử lý Logic & Modal ---
    function handleEditClick(customerId) {
        const customer = sampleCustomers.find(c => c.id === customerId);
        if (!customer) return;
        document.getElementById('edit-customer-id').value = customer.id;
        document.getElementById('edit-customer-name').value = customer.name;
        document.getElementById('edit-customer-phone').value = customer.phone;
        document.getElementById('edit-customer-email').value = customer.email;
        document.getElementById('edit-customer-address').value = customer.address;
        document.getElementById('edit-customer-status').value = customer.status;
        editCustomerModal.show();
    }

    function handleHistoryClick(customerId) {
        const customer = sampleCustomers.find(c => c.id === customerId);
        const history = samplePurchaseHistory[customerId] || [];
        if (!customer) return;
        document.getElementById('history-customer-name').textContent = customer.name;
        const historyBody = document.getElementById('history-table-body');
        historyBody.innerHTML = '';
        if (history.length === 0) {
            historyBody.innerHTML = '<tr><td colspan="4" class="text-center">Chưa có lịch sử mua hàng.</td></tr>';
        } else {
            history.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>#${order.id}</td><td>${order.date}</td><td class="text-end">${formatCurrency(order.total)}</td><td class="text-center">${getStatusBadge(order.status, 'order')}</td>`;
                historyBody.appendChild(row);
            });
        }
        purchaseHistoryModal.show();
    }

    // --- Gắn các sự kiện ---
    sidebarToggleBtn.addEventListener('click', () => mainContainer.classList.toggle('sidebar-collapsed'));

    customersTableBody.addEventListener('click', function(event) {
        const editBtn = event.target.closest('.edit-btn');
        const historyBtn = event.target.closest('.history-btn');
        if (editBtn) { handleEditClick(editBtn.dataset.id); }
        if (historyBtn) { handleHistoryClick(historyBtn.dataset.id); }
    });

    // --- Khởi chạy ---
    renderCustomers(sampleCustomers);
});