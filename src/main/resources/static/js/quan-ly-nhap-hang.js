document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CSDL MẪU ---
    const sampleImports = [
        { 
            id: 'PN001', artistName: 'Văn Cao', employeeName: 'Admin', date: '2025-06-20', totalValue: 6000000, status: 'Đã hoàn tất', 
            products: [{ name: 'Chiều hoàng hôn', quantity: 1, price: 6000000 }]
        },
        { 
            id: 'PN002', artistName: 'Bùi Xuân Phái', employeeName: 'Admin', date: '2025-06-22', totalValue: 240000000, status: 'Đã hoàn tất', 
            products: [
                { name: 'Mảnh ghép', quantity: 1, price: 12000000 },
                { name: 'Phố cổ về đêm', quantity: 1, price: 228000000 }
            ]
        },
        { 
            id: 'PN003', artistName: 'Lê Phổ', employeeName: 'Admin', date: '2025-06-25', totalValue: 90000000, status: 'Đã hủy', 
            products: [{ name: 'Dòng chảy', quantity: 1, price: 90000000 }]
        }
    ];

    // --- Lấy các phần tử DOM (đã bổ sung) ---
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const importsTableBody = document.getElementById('imports-table-body');
    const importDetailModal = new bootstrap.Modal(document.getElementById('importDetailModal'));
    const cancelConfirmModal = new bootstrap.Modal(document.getElementById('cancelConfirmModal')); // Modal mới

    // --- Hàm tiện ích ---
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const getStatusBadge = (status) => `<span class="badge ${status === 'Đã hoàn tất' ? 'bg-success' : 'bg-secondary'}">${status}</span>`;

    // --- Hàm Render (đã cập nhật các nút hành động) ---
    function renderImports(imports) {
        importsTableBody.innerHTML = '';
        if (!imports || imports.length === 0) {
            importsTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-5">Chưa có phiếu nhập nào</td></tr>'; return;
        }
        imports.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><div class="fw-bold text-primary">#${item.id}</div></td>
                <td>${item.artistName}</td>
                <td>${new Date(item.date).toLocaleDateString('vi-VN')}</td>
                <td>${item.employeeName}</td>
                <td class="text-end fw-bold">${formatCurrency(item.totalValue)}</td>
                <td class="text-center">${getStatusBadge(item.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary view-detail-btn" data-id="${item.id}" title="Xem chi tiết"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-info print-btn" data-id="${item.id}" title="In phiếu"><i class="bi bi-printer"></i></button>
                    <button class="btn btn-sm btn-outline-danger cancel-btn" data-id="${item.id}" title="Hủy phiếu" ${item.status === 'Đã hủy' ? 'disabled' : ''}><i class="bi bi-x-circle"></i></button>
                </td>
            `;
            importsTableBody.appendChild(row);
        });
    }

    // --- Hàm xử lý Logic & Modal ---
    function handleViewDetailClick(importId) {
        const item = sampleImports.find(i => i.id === importId);
        if (!item) return;

        document.getElementById('modal-import-id').textContent = '#' + item.id;
        document.getElementById('modal-artist-name').textContent = item.artistName;
        document.getElementById('modal-employee-name').textContent = item.employeeName;
        document.getElementById('modal-import-date').textContent = new Date(item.date).toLocaleDateString('vi-VN');
        document.getElementById('modal-import-status').innerHTML = getStatusBadge(item.status);
        document.getElementById('modal-total').textContent = formatCurrency(item.totalValue);
        
        const productListBody = document.getElementById('modal-product-list');
        productListBody.innerHTML = '';
        item.products.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${p.name}</td><td>${p.quantity}</td><td class="text-end">${formatCurrency(p.price)}</td><td class="text-end fw-bold">${formatCurrency(p.price * p.quantity)}</td>`;
            productListBody.appendChild(row);
        });
        
        importDetailModal.show();
    }
    
    // HÀM MỚI: Xử lý sự kiện In phiếu
    function handlePrintClick(importId) {
        const slipData = sampleImports.find(i => i.id === importId);
        if (slipData) {
            localStorage.setItem('slipForPrint', JSON.stringify(slipData));
            window.open('hoa-don-nhap.html', '_blank');
        }
    }

    // --- Gắn các sự kiện (đã cập nhật) ---
    sidebarToggleBtn.addEventListener('click', () => mainContainer.classList.toggle('sidebar-collapsed'));

    importsTableBody.addEventListener('click', function(event) {
        const targetBtn = event.target.closest('button');
        if (!targetBtn) return;
        
        const importId = targetBtn.dataset.id;

        if (targetBtn.classList.contains('view-detail-btn')) {
            handleViewDetailClick(importId);
        } else if (targetBtn.classList.contains('print-btn')) {
            handlePrintClick(importId);
        } else if (targetBtn.classList.contains('cancel-btn')) {
            // Thay vì confirm, giờ ta mở modal
            document.getElementById('cancel-slip-id').textContent = '#' + importId;
            document.getElementById('confirm-cancel-btn').dataset.id = importId; // Gắn id vào nút xác nhận
            cancelConfirmModal.show();
        }
    });
    
    // Gắn sự kiện cho nút xác nhận hủy trong modal
    document.getElementById('confirm-cancel-btn').addEventListener('click', function() {
        const importId = this.dataset.id;
        alert(`Đã hủy phiếu nhập #${importId} (hành động mô phỏng).`);
        // Trong dự án thực tế, đây là lúc gọi API để cập nhật trạng thái
        // Sau đó render lại bảng...
        cancelConfirmModal.hide();
    });

    // --- Khởi chạy ---
    renderImports(sampleImports);
});