document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    // --- BIẾN LƯU TRỮ DỮ LIỆU ---
    let allPaintings = [];
    let allArtists = [];
    let allCategories = [];
    let currentView = 'grid'; // Biến để theo dõi chế độ xem

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const displayArea = document.getElementById('painting-display-area');
    const editPaintingModal = new bootstrap.Modal(document.getElementById('editPaintingModal'));
    const saveEditBtn = document.querySelector('#editPaintingModal .btn-primary');
    
    // DOM cho Tìm kiếm & Lọc
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('filter-status');
    const searchBtn = document.getElementById('search-btn');
    const gridViewBtn = document.getElementById('view-grid-btn');
    const listViewBtn = document.getElementById('view-list-btn');

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
    
    // --- HÀM TẢI FILE LÊN SERVER ---
    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/files/upload/painting`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Upload file thất bại.');
        }
        const result = await response.json();
        return result.filePath;
    }

    // --- CÁC HÀM TIỆN ÍCH ---
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    
    const getStatusBadge = (status) => {
        switch (status) {
            case 'FOR_SALE':
                return `<span class="badge bg-success">Đang bán</span>`;
            case 'SOLD':
                return `<span class="badge bg-secondary">Đã bán</span>`;
            case 'NOT_FOR_SALE':
                return `<span class="badge bg-danger">Dừng bán</span>`;
            default:
                return `<span class="badge bg-dark">Không rõ</span>`;
        }
    };

    // --- CÁC HÀM RENDER ---
    function renderGridView(paintings) {
        displayArea.innerHTML = '';
        const row = document.createElement('div');
        row.className = 'row g-4';
        if (paintings.length === 0) {
            displayArea.innerHTML = '<p class="col-12 text-muted text-center mt-5">Không tìm thấy tranh nào.</p>'; return;
        }
        paintings.forEach(p => {
            const artist = allArtists.find(a => a.id === p.artistId);
            const col = document.createElement('div');
            col.className = 'col-12 col-sm-6 col-lg-4 col-xl-3';
            
            const soldClass = p.status === 'SOLD' ? 'is-sold' : '';

            col.innerHTML = `
                <div class="card h-100 product-card ${soldClass}" data-id="${p.id}">
                    <img src="${p.imageUrl || 'https://placehold.co/400x300'}" class="card-img-top" alt="${p.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${p.name}</h5>
                        <p class="card-text text-muted small">Họa sĩ: ${artist ? artist.name : 'N/A'}</p>
                        <div class="mt-auto">
                            <span class="price d-block mb-2">${formatCurrency(p.sellingPrice)}</span>
                            ${getStatusBadge(p.status)}
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-0 text-end pb-3">
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
            displayArea.innerHTML = '<p class="col-12 text-muted text-center mt-5">Không tìm thấy tranh nào.</p>';
            return;
        }
        paintings.forEach(p => {
            const artist = allArtists.find(a => a.id === p.artistId);
            const item = document.createElement('div');
            
            const soldClass = p.status === 'SOLD' ? 'is-sold' : '';
            item.className = `painting-list-item ${soldClass}`; 

            item.innerHTML = `
                <img src="${p.imageUrl || 'https://placehold.co/80x80'}" class="item-image" alt="${p.name}">
                <div class="item-info">
                    <h5>${p.name}</h5>
                    <p>Họa sĩ: ${artist ? artist.name : 'N/A'}</p>
                </div>
                <div class="item-price">
                    ${formatCurrency(p.sellingPrice)}
                </div>
                <div class="item-status">
                    ${getStatusBadge(p.status)}
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${p.id}" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>
                </div>
            `;
            displayArea.appendChild(item);
        });
    }

    function renderPaintings(paintings) {
        if (currentView === 'grid') {
            renderGridView(paintings);
        } else {
            renderListView(paintings);
        }
    }

    function populateSelectOptions(selectElementId, data, valueField, textField) {
        const select = document.getElementById(selectElementId);
        if (!select) return;
        select.innerHTML = '<option value="" disabled selected>Chọn...</option>';
        data.forEach(item => {
            select.innerHTML += `<option value="${item[valueField]}">${item[textField]}</option>`;
        });
    }

    // --- HÀM LỌC VÀ TÌM KIẾM ---
    function filterAndRenderPaintings() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusValue = statusFilter.value;

        let filteredPaintings = allPaintings;

        if (statusValue !== 'ALL') {
            filteredPaintings = filteredPaintings.filter(p => p.status === statusValue);
        }

        if (searchTerm) {
            filteredPaintings = filteredPaintings.filter(p => {
                const artist = allArtists.find(a => a.id === p.artistId);
                const artistName = artist ? artist.name.toLowerCase() : '';
                return p.name.toLowerCase().includes(searchTerm) || artistName.includes(searchTerm);
            });
        }

        renderPaintings(filteredPaintings);
    }
    
    // --- HÀM XỬ LÝ SỰ KIỆN (Sửa, Cập nhật) ---
    async function handleEditClick(paintingId) {
        try {
            const painting = await fetchApi(`/paintings/${paintingId}`);
            document.getElementById('edit-painting-id').value = painting.id;
            document.getElementById('edit-painting-name-title').textContent = painting.name;
            document.getElementById('edit-name').value = painting.name;
            document.getElementById('edit-selling-price').value = painting.sellingPrice;
            document.getElementById('edit-image-url').value = painting.imageUrl || '';
            document.getElementById('edit-image-file').value = '';
            document.getElementById('edit-material-input').value = painting.material || '';
            document.getElementById('edit-size').value = painting.size || '';
            document.getElementById('edit-description').value = painting.description || '';
            
            const statusSelect = document.getElementById('edit-status');
            statusSelect.value = painting.status;
            statusSelect.disabled = painting.status === 'SOLD';

            document.getElementById('edit-artist-select').value = painting.artistId;
            document.getElementById('edit-category-select').value = painting.categoryId;
            editPaintingModal.show();
        } catch (error) {
            alert(`Lỗi khi tải thông tin tranh: ${error.message}`);
        }
    }

    async function handleUpdatePainting(event) {
        event.preventDefault();
        const paintingId = document.getElementById('edit-painting-id').value;
        const imageFileInput = document.getElementById('edit-image-file');
        let imageUrl = document.getElementById('edit-image-url').value.trim();

        if (imageFileInput.files.length > 0) {
            try {
                imageUrl = await uploadFile(imageFileInput.files[0]);
            } catch (error) {
                alert(`Lỗi tải ảnh lên: ${error.message}`);
                return;
            }
        }
        
        const currentPainting = await fetchApi(`/paintings/${paintingId}`);
        const paintingData = {
            sellingPrice: document.getElementById('edit-selling-price').value,
            importPrice: currentPainting.importPrice,
            name: document.getElementById('edit-name').value,
            imageUrl: imageUrl,
            material: document.getElementById('edit-material-input').value,
            size: document.getElementById('edit-size').value,
            description: document.getElementById('edit-description').value,
            status: document.getElementById('edit-status').value,
            artistId: document.getElementById('edit-artist-select').value,
            categoryId: document.getElementById('edit-category-select').value,
        };
        try {
            await fetchApi(`/paintings/${paintingId}`, { method: 'PUT', body: JSON.stringify(paintingData) });
            editPaintingModal.hide();
            initializePage();
        } catch(error) {
            alert(`Cập nhật thất bại: ${error.message}`);
        }
    }

    async function initializePage() {
        try {
            const [paintings, artists, categories] = await Promise.all([
                fetchApi('/paintings'), fetchApi('/artists'), fetchApi('/categories')
            ]);
            allPaintings = paintings; allArtists = artists; allCategories = categories;
            
            filterAndRenderPaintings();
            
            populateSelectOptions('edit-artist-select', allArtists, 'id', 'name');
            populateSelectOptions('edit-category-select', allCategories, 'id', 'name');
        } catch (error) {
            console.error("Lỗi khởi tạo trang:", error);
            alert("Không thể tải dữ liệu cho trang. Vui lòng thử lại.");
        }
    }

    // --- GẮN CÁC SỰ KIỆN ---
    displayArea.addEventListener('click', (event) => {
        const editBtn = event.target.closest('.edit-btn');
        if (editBtn) handleEditClick(editBtn.dataset.id);
    });
    saveEditBtn.addEventListener('click', handleUpdatePainting);
    searchBtn.addEventListener('click', filterAndRenderPaintings);
    statusFilter.addEventListener('change', filterAndRenderPaintings);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') filterAndRenderPaintings();
    });
    gridViewBtn.addEventListener('click', () => {
        if (currentView !== 'grid') {
            currentView = 'grid';
            listViewBtn.classList.remove('active');
            gridViewBtn.classList.add('active');
            filterAndRenderPaintings();
        }
    });
    listViewBtn.addEventListener('click', () => {
        if (currentView !== 'list') {
            currentView = 'list';
            gridViewBtn.classList.remove('active');
            listViewBtn.classList.add('active');
            filterAndRenderPaintings();
        }
    });

    // --- KHỞI CHẠY ---
    initializePage();
});