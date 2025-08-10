document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    let allImportSlips = [];
    let allArtists = [];
    let allCategories = [];

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const importsTableBody = document.getElementById('imports-table-body');
    const importDetailModal = new bootstrap.Modal(document.getElementById('importDetailModal'));
    
    // --- DOM CHO TÌM KIẾM VÀ LỌC ---
    const searchInput = document.getElementById('search-input');
    const artistFilter = document.getElementById('artist-filter');
    const categoryFilter = document.getElementById('category-filter');
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
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');
    const getStatusBadge = (status) => `<span class="badge ${status === 'COMPLETED' ? 'bg-success' : 'bg-secondary'}">${status === 'COMPLETED' ? 'Đã hoàn tất' : 'Đã hủy'}</span>`;

    // --- HÀM TẢI DỮ LIỆU BỔ SUNG ---
    async function loadArtists() {
        try {
            allArtists = await fetchApi('/artists');
            populateArtistFilter();
        } catch (error) {
            console.error('Lỗi tải danh sách họa sĩ:', error);
        }
    }

    async function loadCategories() {
        try {
            allCategories = await fetchApi('/categories');
            populateCategoryFilter();
        } catch (error) {
            console.error('Lỗi tải danh sách danh mục:', error);
        }
    }

    function populateArtistFilter() {
        if (!artistFilter) return;
        
        artistFilter.innerHTML = '<option value="ALL">Tất cả họa sĩ</option>';
        allArtists.forEach(artist => {
            const option = document.createElement('option');
            option.value = artist.id;
            option.textContent = artist.name;
            artistFilter.appendChild(option);
        });
    }

    function populateCategoryFilter() {
        if (!categoryFilter) return;
        
        categoryFilter.innerHTML = '<option value="ALL">Tất cả thể loại</option>';
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }

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

    // --- HÀM LỌC VÀ TÌM KIẾM ---
    function filterAndRenderImports() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const artistValue = artistFilter ? artistFilter.value : 'ALL';
        const categoryValue = categoryFilter ? categoryFilter.value : 'ALL';
        const dateValue = dateFilter ? dateFilter.value : '';

        let filteredImports = allImportSlips;

        // Lọc theo họa sĩ
        if (artistValue !== 'ALL' && artistFilter) {
            filteredImports = filteredImports.filter(slip => 
                slip.artistId == artistValue || slip.artistName === allArtists.find(a => a.id == artistValue)?.name
            );
        }

        // Lọc theo thể loại
        if (categoryValue !== 'ALL' && categoryFilter) {
            filteredImports = filteredImports.filter(slip => {
                return slip.slipDetails && slip.slipDetails.some(detail => 
                    detail.painting && detail.painting.category && detail.painting.category.id == categoryValue
                );
            });
        }

        // Lọc theo ngày
        if (dateValue && dateFilter) {
            filteredImports = filteredImports.filter(slip => {
                const importDate = new Date(slip.importDate).toLocaleDateString('en-CA'); // Format YYYY-MM-DD
                return importDate === dateValue;
            });
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm && searchInput) {
            filteredImports = filteredImports.filter(slip =>
                slip.id.toString().includes(searchTerm) ||
                (slip.artistName && slip.artistName.toLowerCase().includes(searchTerm))
            );
        }

        renderImports(filteredImports);
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
            filterAndRenderImports(); // Thay vì renderImports, gọi hàm filter để hiển thị ban đầu
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

    // Gắn sự kiện cho các bộ lọc
    if (searchBtn) {
        searchBtn.addEventListener('click', filterAndRenderImports);
    }
    if (searchInput) {
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                filterAndRenderImports();
            }
        });
    }
    if (artistFilter) {
        artistFilter.addEventListener('change', filterAndRenderImports);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAndRenderImports);
    }
    if (dateFilter) {
        dateFilter.addEventListener('change', filterAndRenderImports);
    }

    // --- KHỞI CHẠY ---
    loadImportSlips();
    loadArtists();
    loadCategories();
});