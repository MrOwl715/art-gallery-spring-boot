document.addEventListener('DOMContentLoaded', function() {

    // --- CSDL MẪU (Sẽ được thay bằng API thật) ---
    const sampleOrders = [
        {
            id: 'DH001', customer: 'Anh Nam', employee: 'Admin', date: '25-06-2025', total: 450000000, status: 'Hoàn thành',
            products: [{ name: 'Phố cổ về đêm', artist: 'Bùi Xuân Phái', price: 450000000 }]
        },
        {
            id: 'DH002', customer: 'Chị Lan', employee: 'Admin', date: '26-06-2025', total: 106000000, status: 'Đang xử lý',
            products: [
                { name: 'Chiều hoàng hôn', artist: 'Văn Cao', price: 12000000 },
                { name: 'Sen hạ', artist: 'Mai Trung Thứ', price: 88000000 }
            ]
        },
        {
            id: 'DH003', customer: 'Khách lẻ', employee: 'Admin', date: '26-06-2025', total: 25500000, status: 'Chờ xác nhận',
            products: [{ name: 'Mảnh ghép', artist: 'Bùi Xuân Phái', price: 25500000 }]
        },
        {
            id: 'DH004', customer: 'Anh Tuấn', employee: 'Admin', date: '24-06-2025', total: 32000000, status: 'Đã hủy',
            products: [{ name: 'Tĩnh vật bên cửa sổ', artist: 'Nguyễn Gia Trí', price: 32000000 }]
        }
    ];
    const TAX_RATE = 0.08;

    // --- Lấy các phần tử DOM ---
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const ordersTableBody = document.getElementById('orders-table-body');
    const orderDetailModal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    
    // --- Các hàm tiện ích ---
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const getStatusBadge = (status) => {
        const statusMap = {
            'Hoàn thành': 'bg-success',
            'Đang xử lý': 'bg-info',
            'Chờ xác nhận': 'bg-warning text-dark',
            'Đã hủy': 'bg-danger',
        };
        return `<span class="badge ${statusMap[status] || 'bg-secondary'}">${status}</span>`;
    };

    // --- Các hàm render ---
    function renderOrders(orders) {
        ordersTableBody.innerHTML = '';
        if (orders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">Không có đơn hàng nào</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="fw-bold text-primary">#${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.date}</td>
                <td>${formatCurrency(order.total)}</td>
                <td>${getStatusBadge(order.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary view-detail-btn" data-id="${order.id}" title="Xem chi tiết">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" title="In hóa đơn">
                        <i class="bi bi-printer"></i>
                    </button>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
    }

    // --- Các hàm xử lý logic ---
    function showOrderDetail(orderId) {
        const order = sampleOrders.find(o => o.id === orderId);
        if (!order) return;

        // Populate modal header and basic info
        document.getElementById('modal-order-id').textContent = '#' + order.id;
        document.getElementById('modal-customer-name').textContent = order.customer;
        document.getElementById('modal-employee-name').textContent = order.employee;
        document.getElementById('modal-order-date').textContent = order.date;
        document.getElementById('modal-order-status').innerHTML = getStatusBadge(order.status);
        
        // Populate product list
        const productListEl = document.getElementById('modal-product-list');
        productListEl.innerHTML = '';
        let subtotal = 0;
        order.products.forEach(p => {
            subtotal += p.price;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.name}</td>
                <td>${p.artist}</td>
                <td class="text-end">${formatCurrency(p.price)}</td>
            `;
            productListEl.appendChild(row);
        });

        // Populate totals
        const tax = subtotal * TAX_RATE;
        document.getElementById('modal-subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('modal-tax').textContent = formatCurrency(tax);
        document.getElementById('modal-total').textContent = formatCurrency(subtotal + tax);

        // Set current status in dropdown
        document.getElementById('update-status-select').value = order.status;

        orderDetailModal.show();
    }

    // --- Gắn các sự kiện ---
    // Toggle sidebar
    sidebarToggleBtn.addEventListener('click', () => {
        mainContainer.classList.toggle('sidebar-collapsed');
    });

    // Event delegation for view detail buttons
    ordersTableBody.addEventListener('click', function(event) {
        const viewBtn = event.target.closest('.view-detail-btn');
        if (viewBtn) {
            const orderId = viewBtn.dataset.id;
            showOrderDetail(orderId);
        }
    });

    // --- Khởi chạy ---
    renderOrders(sampleOrders);

});