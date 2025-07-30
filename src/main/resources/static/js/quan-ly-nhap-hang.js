document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const importsTableBody = document.getElementById('imports-table-body');
    
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
                <td>${item.artistName}</td>
                <td>${formatDate(item.orderDate)}</td>
                <td>N/A</td> <td class="text-end fw-bold">${formatCurrency(item.totalAmount)}</td>
                <td class="text-center">${getStatusBadge(item.status)}</td>
                <td class="text-center">
                    </td>
            `;
            importsTableBody.appendChild(row);
        });
    }

    // --- HÀM TẢI DỮ LIỆU ---
    async function loadImportOrders() {
        try {
            const importOrders = await fetchApi('/orders/imports');
            renderImports(importOrders);
        } catch (error) {
            console.error("Lỗi tải danh sách phiếu nhập:", error);
            importsTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-5">Không thể tải dữ liệu</td></tr>';
        }
    }

    // --- KHỞI CHẠY ---
    loadImportOrders();
});