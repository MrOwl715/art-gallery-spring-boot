document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // =======================================
    // CSDL MẪU & DỮ LIỆU CÓ SẴN
    // =======================================
    const samplePaintings = [
        { id: 'p1', name: 'Chiều hoàng hôn', artist: 'Văn Cao', importPrice: 6000000, sellingPrice: 12000000, category: 'Phong cảnh', material: 'Sơn dầu', image: 'https://images.unsplash.com/photo-1569783721365-4a634b3563a6?q=80&w=870', status: 'Đang bán' },
        { id: 'p2', name: 'Mảnh ghép', artist: 'Bùi Xuân Phái', importPrice: 12000000, sellingPrice: 25500000, category: 'Trừu tượng', material: 'Sơn dầu', image: 'https://images.unsplash.com/photo-1531816434923-a07a75309328?q=80&w=774', status: 'Đang bán' },
        { id: 'p3', name: 'Phố cổ về đêm', artist: 'Bùi Xuân Phái', importPrice: 228000000, sellingPrice: 450000000, category: 'Phong cảnh', material: 'Sơn dầu', image: 'https://images.unsplash.com/photo-1599409353922-22c6a1eaf3e5?q=80&w=870', status: 'Đang bán' },
        { id: 'p4', name: 'Dòng chảy', artist: 'Lê Phổ', importPrice: 90000000, sellingPrice: 180000000, category: 'Trừu tượng', material: 'Màu nước', image: 'https://images.unsplash.com/photo-1502908813589-54315f6c9a35?q=80&w=870', status: 'Dừng bán' },
        { id: 'p5', name: 'Tĩnh vật bên cửa sổ', artist: 'Nguyễn Gia Trí', importPrice: 15000000, sellingPrice: 32000000, category: 'Sơn dầu', material: 'Sơn dầu', image: 'https://images.unsplash.com/photo-1574993022519-3c35f05d539e?q=80&w=774', status: 'Đang bán' },
        { id: 'p6', name: 'Sen hạ', artist: 'Mai Trung Thứ', importPrice: 40000000, sellingPrice: 88000000, category: 'Sơn mài', material: 'Sơn mài', image: 'https://images.unsplash.com/photo-1596634125381-196155456673?q=80&w=774', status: 'Dừng bán' },
    ];
    const sampleHistory = {
        'p1': [{ date: '25-06-2025 10:30', user: 'Admin', action: 'Tạo mới sản phẩm.' }],
        'p4': [{ date: '26-06-2025 09:00', user: 'Admin', action: 'Thay đổi trạng thái: Dừng bán.' }, { date: '15-01-2025 14:00', user: 'Admin', action: 'Tạo mới sản phẩm.' }]
    };
    const availableCategories = ['Sơn dầu', 'Trừu tượng', 'Phong cảnh', 'Sơn mài', 'Chân dung'];
    const availableMaterials = ['Sơn dầu', 'Màu nước', 'Sơn mài', 'Acrylic', 'Lụa'];
    let currentView = 'grid';

    // =======================================
    // LẤY CÁC PHẦN TỬ DOM
    // =======================================
    const displayArea = document.getElementById('painting-display-area');
    const gridBtn = document.getElementById('view-grid-btn');
    const listBtn = document.getElementById('view-list-btn');
    const statusFilter = document.getElementById('filter-status');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const editPaintingModal = new bootstrap.Modal(document.getElementById('editPaintingModal'));
    const historyModal = new bootstrap.Modal(document.getElementById('historyModal'));

    // =======================================
    // CÁC HÀM TIỆN ÍCH
    // =======================================
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const getStatusBadge = (status) => `<span class="badge ${status === 'Đang bán' ? 'bg-success' : 'bg-secondary'}">${status}</span>`;

    // =======================================
    // HÀM LỌC VÀ RENDER TỔNG HỢP
    // =======================================
    function filterAndRenderPaintings() {
        const statusValue = statusFilter.value;
        const searchTerm = searchInput.value.toLowerCase().trim();

        let filteredPaintings = samplePaintings;

        // 1. Lọc theo trạng thái
        if (statusValue !== 'all') {
            filteredPaintings = filteredPaintings.filter(p => p.status === statusValue);
        }

        // 2. Lọc theo từ khóa tìm kiếm (tên, họa sĩ, thể loại)
        if (searchTerm) {
            filteredPaintings = filteredPaintings.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.artist.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            );
        }

        // 3. Render kết quả cuối cùng theo chế độ xem đã chọn
        if (currentView === 'grid') {
            renderGridView(filteredPaintings);
        } else {
            renderListView(filteredPaintings);
        }
    }
    
    // =======================================
    // CÁC HÀM RENDER CHI TIẾT
    // =======================================
    function renderGridView(paintings) {
        displayArea.innerHTML = '';
        const row = document.createElement('div');
        row.className = 'row g-4';
        if (paintings.length === 0) {
            displayArea.innerHTML = '<p class="col-12 text-muted text-center mt-5">Không tìm thấy tranh nào.</p>'; return;
        }
        paintings.forEach(p => {
            const col = document.createElement('div');
            col.className = 'col-12 col-sm-6 col-lg-4 col-xl-3';
            col.innerHTML = `
                <div class="card h-100 product-card">
                    <img src="${p.image}" class="card-img-top" alt="${p.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${p.name}</h5>
                        <p class="card-text text-muted small">Họa sĩ: ${p.artist}</p>
                        <div class="mt-auto">
                            <span class="price d-block mb-2">${formatCurrency(p.sellingPrice)}</span>
                            ${getStatusBadge(p.status)}
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-0 text-end pb-3">
                         <button class="btn btn-sm btn-outline-secondary history-btn" data-id="${p.id}" title="Xem lịch sử"><i class="bi bi-clock-history"></i></button>
                         <button class="btn btn-sm btn-primary edit-btn" data-id="${p.id}" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>
                    </div>
                </div>`;
            row.appendChild(col);
        });
        displayArea.appendChild(row);
    }
    function renderListView(paintings) {
        displayArea.innerHTML = '';
        if (paintings.length === 0) {
            displayArea.innerHTML = '<p class="text-muted text-center mt-5">Không tìm thấy tranh nào.</p>'; return;
        }
        paintings.forEach(p => {
            const item = document.createElement('div');
            item.className = 'painting-list-item';
            item.innerHTML = `
                <img src="${p.image}" class="item-image" alt="${p.name}">
                <div class="item-info">
                    <h5>${p.name}</h5>
                    <p>Họa sĩ: ${p.artist}</p>
                </div>
                <div class="item-price">${formatCurrency(p.sellingPrice)}</div>
                <div class="item-status">${getStatusBadge(p.status)}</div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline-secondary history-btn" data-id="${p.id}" title="Xem lịch sử"><i class="bi bi-clock-history"></i></button>
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${p.id}" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>
                </div>`;
            displayArea.appendChild(item);
        });
    }

    // =======================================
    // CÁC HÀM XỬ LÝ LOGIC & MODAL
    // =======================================
    function handleEditClick(paintingId) {
        const painting = samplePaintings.find(p => p.id === paintingId);
        if (!painting) return;

        document.getElementById('edit-painting-id').value = painting.id;
        document.getElementById('edit-painting-name-title').textContent = painting.name;
        document.getElementById('edit-name').value = painting.name;
        document.getElementById('edit-artist').value = painting.artist;
        document.getElementById('edit-import-price').value = painting.importPrice;
        document.getElementById('edit-selling-price').value = painting.sellingPrice;
        document.getElementById('edit-status').value = painting.status;
        document.getElementById('edit-category-select').value = painting.category;
        document.getElementById('edit-material-select').value = painting.material;

        const imagePreview = document.getElementById('edit-image-preview');
        const uploadText = imagePreview.closest('.image-upload-box').querySelector('.upload-text');
        imagePreview.src = painting.image;
        imagePreview.style.display = 'block';
        uploadText.style.display = 'none';
        
        editPaintingModal.show();
    }
    function handleHistoryClick(paintingId) {
        const painting = samplePaintings.find(p => p.id === paintingId);
        const history = sampleHistory[paintingId] || [];
        if (!painting) return;
        document.getElementById('history-painting-name').textContent = painting.name;
        const historyBody = document.getElementById('history-table-body');
        historyBody.innerHTML = '';
        if (history.length === 0) {
            historyBody.innerHTML = '<tr><td colspan="3" class="text-center">Chưa có lịch sử chỉnh sửa.</td></tr>';
        } else {
            history.forEach(log => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${new Date(log.date).toLocaleString('vi-VN')}</td><td>${log.user}</td><td>${log.action}</td>`;
                historyBody.appendChild(row);
            });
        }
        historyModal.show();
    }
    function populateSelectOptions(selectId, options) {
        const select = document.getElementById(selectId);
        if(select) {
            select.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        }
    }
    function setupImageUpload(inputId) {
        const imageInput = document.getElementById(inputId);
        const uploadBox = imageInput.closest('.image-upload-box');
        const imagePreview = uploadBox.querySelector('.image-preview');
        const uploadText = uploadBox.querySelector('.upload-text');
        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    if (uploadText) uploadText.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // =======================================
    // GẮN CÁC SỰ KIỆN
    // =======================================
    gridBtn.addEventListener('click', () => { if (currentView !== 'grid') { currentView = 'grid'; listBtn.classList.remove('active'); gridBtn.classList.add('active'); filterAndRenderPaintings(); } });
    listBtn.addEventListener('click', () => { if (currentView !== 'list') { currentView = 'list'; gridBtn.classList.remove('active'); listBtn.classList.add('active'); filterAndRenderPaintings(); } });
    statusFilter.addEventListener('change', filterAndRenderPaintings);
    searchBtn.addEventListener('click', filterAndRenderPaintings);
    searchInput.addEventListener('keyup', function(event) { if (event.key === 'Enter') { filterAndRenderPaintings(); } });
    sidebarToggleBtn.addEventListener('click', () => mainContainer.classList.toggle('sidebar-collapsed'));
    displayArea.addEventListener('click', function (event) { const editBtn = event.target.closest('.edit-btn'); const historyBtn = event.target.closest('.history-btn'); if (editBtn) { handleEditClick(editBtn.dataset.id); } if (historyBtn) { handleHistoryClick(historyBtn.dataset.id); } });
    document.querySelector('button[data-bs-target="#addPaintingModal"]').addEventListener('click', () => { document.getElementById('add-painting-form').reset(); const uploadBox = document.querySelector('#addPaintingModal .image-upload-box'); const preview = uploadBox.querySelector('.image-preview'); const text = uploadBox.querySelector('.upload-text'); preview.style.display = 'none'; text.style.display = 'flex'; preview.src = ''; });

    // =======================================
    // KHỞI CHẠY LẦN ĐẦU
    // =======================================
    function initialize() {
        populateSelectOptions('add-category-select', availableCategories);
        populateSelectOptions('add-material-select', availableMaterials);
        populateSelectOptions('edit-category-select', availableCategories);
        populateSelectOptions('edit-material-select', availableMaterials);
        setupImageUpload('add-image-input');
        setupImageUpload('edit-image-input');

        const artistToFilter = localStorage.getItem('filterArtistName');
        const categoryToFilter = localStorage.getItem('filterCategoryName');
        if (artistToFilter) {
            searchInput.value = artistToFilter;
            localStorage.removeItem('filterArtistName');
        }
        if (categoryToFilter) {
            searchInput.value = categoryToFilter;
            localStorage.removeItem('filterCategoryName');
        }

        filterAndRenderPaintings();
    }
    initialize();
});