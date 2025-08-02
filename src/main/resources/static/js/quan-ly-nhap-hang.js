document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    let allImportSlips = [];

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const importsTableBody = document.getElementById('imports-table-body');
    const importDetailModal = new bootstrap.Modal(document.getElementById('importDetailModal'));

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
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');
    const getStatusBadge = (status) => `<span class="badge ${status === 'COMPLETED' ? 'bg-success' : 'bg-secondary'}">${status === 'COMPLETED' ? 'Đã hoàn tất' : 'Đã hủy'}</span>`;

    // --- HÀM RENDER ---
    function renderImports(imports) {
        importsTableBody.innerHTML = '';
        if (!imports || imports.length === 0) {
            importsTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-5">Chưa có phiếu nhập nào</td></tr>'; 
            return;
        }
        imports.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><div class="fw-bold text-primary">#${item.id}</div></td>
                <td>${item.artistName || 'N/A'}</td>
                <td>${formatDate(item.importDate)}</td>
                <td>${item.createdByUsername || 'N/A'}</td>
                <td class="text-end fw-bold">${formatCurrency(item.totalAmount)}</td>
                <td class="text-center">${getStatusBadge(item.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary view-detail-btn" data-id="${item.id}" title="Xem chi tiết"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-info print-btn" data-id="${item.id}" title="In phiếu"><i class="bi bi-printer"></i></button>
                </td>
            `;
            importsTableBody.appendChild(row);
        });
    }

     function handleViewDetailClick(slipId) {
        const slip = allImportSlips.find(s => s.id == slipId);
        if (!slip) {
            alert('Không tìm thấy thông tin phiếu nhập.');
            return;
        }

        document.getElementById('modal-import-id').textContent = '#' + slip.id;
        document.getElementById('modal-artist-name').textContent = slip.artistName;
        document.getElementById('modal-employee-name').textContent = slip.createdByUsername;
        document.getElementById('modal-import-date').textContent = formatDate(slip.importDate);
        document.getElementById('modal-import-status').innerHTML = getStatusBadge(slip.status);
        document.getElementById('modal-total').textContent = formatCurrency(slip.totalAmount);
        
        const productListBody = document.getElementById('modal-product-list');
        productListBody.innerHTML = '';
        slip.slipDetails.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.paintingName}</td>
                <td>${p.quantity}</td>
                <td class="text-end">${formatCurrency(p.importPrice)}</td>
                <td class="text-end fw-bold">${formatCurrency(p.importPrice * p.quantity)}</td>
            `;
            productListBody.appendChild(row);
        });
        
        importDetailModal.show();
    }

    // --- HÀM MỚI ĐỂ XỬ LÝ IN ---
    function handlePrintClick(slipId) {
        const slip = allImportSlips.find(s => s.id == slipId);
        if (!slip) {
            alert('Không tìm thấy phiếu nhập để in.');
            return;
        }

        // Chuẩn bị dữ liệu theo cấu trúc mà hoa-don-nhap.html cần
        const dataForPrint = {
            id: slip.id,
            date: slip.importDate,
            artistName: slip.artistName,
            products: slip.slipDetails.map(detail => ({
                name: detail.paintingName,
                importPrice: detail.importPrice
            })),
            totalValue: slip.totalAmount
        };

        // Lưu vào localStorage và mở trang in
        localStorage.setItem('slipForPrint', JSON.stringify(dataForPrint));
        window.open('hoa-don-nhap.html', '_blank', 'width=500,height=700');
    }


    // --- HÀM TẢI DỮ LIỆU ---
    async function loadImportSlips() {
        try {
            allImportSlips = await fetchApi('/import-slips');
            renderImports(allImportSlips);
        } catch (error) {
            console.error("Lỗi tải danh sách phiếu nhập:", error);
            importsTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-5">Không thể tải dữ liệu</td></tr>';
        }
    }

    // --- CẬP NHẬT LẠI HÀM LẮNG NGHE SỰ KIỆN ---
    importsTableBody.addEventListener('click', function(event) {
        const targetBtn = event.target.closest('button');
        if (!targetBtn) return;
        
        const slipId = targetBtn.dataset.id;

        // Kiểm tra xem nút nào được nhấn
        if (targetBtn.classList.contains('view-detail-btn')) {
            handleViewDetailClick(slipId);
        } else if (targetBtn.classList.contains('print-btn')) {
            handlePrintClick(slipId);
        }
    });  

    // --- KHỞI CHẠY ---
    loadImportSlips();
});