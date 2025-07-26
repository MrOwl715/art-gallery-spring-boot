document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    // --- BIẾN LƯU TRỮ DỮ LIỆU ---
    let allArtists = []; // Mảng chứa toàn bộ họa sĩ từ API

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const artistsTableBody = document.getElementById('artists-table-body');
    const addArtistModal = new bootstrap.Modal(document.getElementById('addArtistModal'));
    const editArtistModal = new bootstrap.Modal(document.getElementById('editArtistModal'));
    
    const addArtistForm = document.getElementById('add-artist-form');
    const saveAddBtn = document.querySelector('#addArtistModal .btn-primary');
    const saveEditBtn = document.querySelector('#editArtistModal .btn-primary');
    
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const searchBtn = document.getElementById('search-btn');

    // --- HÀM GỌI API CHUNG ---
    async function fetchApi(endpoint, options = {}) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = '/dang-nhap.html';
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Có lỗi xảy ra');
        }
        if (response.status === 204) return null;
        return response.json();
    }

    // --- HÀM TIỆN ÍCH ---
    const getStatusBadge = (status) => `<span class="badge ${status ? 'bg-success' : 'bg-secondary'}">${status ? 'Đang hợp tác' : 'Dừng hợp tác'}</span>`;

    // --- HÀM RENDER ---
    function renderArtists(artistsToRender) {
        artistsTableBody.innerHTML = '';
        if (!artistsToRender || artistsToRender.length === 0) {
            artistsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">Không tìm thấy họa sĩ nào</td></tr>';
            return;
        }
        artistsToRender.forEach((artist, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td><div class="fw-bold">${artist.name}</div></td>
                <td>
                    <div><i class="bi bi-phone me-2"></i>${artist.phone || 'Chưa có'}</div>
                    <div><i class="bi bi-envelope me-2"></i>${artist.email|| 'Chưa có'}</div>
                </td>
                <td>${artist.address || 'Chưa có'}</td>
                <td class="text-center">${getStatusBadge(artist.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${artist.id}" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${artist.id}" title="Xóa"><i class="bi bi-trash"></i></button>
                </td>
            `;
            artistsTableBody.appendChild(row);
        });
    }

    // --- HÀM LỌC VÀ TÌM KIẾM ---
    function filterAndRenderArtists() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusValue = statusFilter.value;

        let filteredArtists = allArtists;

        // 1. Lọc theo trạng thái
        if (statusValue !== 'all') {
            const isStatusActive = (statusValue === 'true');
            filteredArtists = filteredArtists.filter(artist => artist.status === isStatusActive);
        }

        // 2. Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            filteredArtists = filteredArtists.filter(artist => 
                artist.name.toLowerCase().includes(searchTerm) ||
                (artist.phone && artist.phone.toLowerCase().includes(searchTerm)) ||
                artist.email.toLowerCase().includes(searchTerm)
            );
        }

        renderArtists(filteredArtists);
    }
    
    // --- HÀM TẢI DỮ LIỆU ---
    async function loadArtists() {
        try {
            allArtists = await fetchApi('/artists');
            filterAndRenderArtists();
        } catch (error) {
            console.error("Lỗi tải danh sách họa sĩ:", error);
            alert(error.message);
        }
    }

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
    async function handleAddArtist(event) {
        event.preventDefault();
        const artistData = {
            name: document.getElementById('add-artist-name').value,
            phone: document.getElementById('add-artist-phone').value,
            email: document.getElementById('add-artist-email').value,
            address: document.getElementById('add-artist-address').value,
            biography: document.getElementById('add-artist-biography').value,
            status: true
        };

        try {
            await fetchApi('/artists', { method: 'POST', body: JSON.stringify(artistData) });
            addArtistModal.hide();
            addArtistForm.reset();
            loadArtists();
        } catch (error) {
            alert(`Thêm thất bại: ${error.message}`);
        }
    }

    async function handleEditClick(artistId) {
        try {
            const artist = await fetchApi(`/artists/${artistId}`);
            document.getElementById('edit-artist-id').value = artist.id;
            document.getElementById('edit-artist-name').value = artist.name;
            document.getElementById('edit-artist-phone').value = artist.phone;
            document.getElementById('edit-artist-email').value = artist.email;
            document.getElementById('edit-artist-address').value = artist.address;
            document.getElementById('edit-artist-biography').value = artist.biography;
            document.getElementById('edit-artist-status').value = artist.status ? "true" : "false";
            editArtistModal.show();
        } catch (error) {
            alert(`Lỗi: ${error.message}`);
        }
    }
    
    async function handleUpdateArtist(event) {
        event.preventDefault();
        const artistId = document.getElementById('edit-artist-id').value;
        const artistData = {
            name: document.getElementById('edit-artist-name').value,
            phone: document.getElementById('edit-artist-phone').value,
            email: document.getElementById('edit-artist-email').value,
            address: document.getElementById('edit-artist-address').value,
            biography: document.getElementById('edit-artist-biography').value,
            status: document.getElementById('edit-artist-status').value === 'true'
        };
        
        try {
            await fetchApi(`/artists/${artistId}`, { method: 'PUT', body: JSON.stringify(artistData) });
            editArtistModal.hide();
            loadArtists();
        } catch (error) {
            alert(`Cập nhật thất bại: ${error.message}`);
        }
    }

    async function handleDeleteClick(artistId) {
        if (!confirm('Bạn có chắc chắn muốn xóa họa sĩ này? Hành động này không thể hoàn tác.')) {
            return;
        }
        try {
            await fetchApi(`/artists/${artistId}`, { method: 'DELETE' });
            loadArtists();
        } catch (error) {
             alert(`Xóa thất bại: ${error.message}`);
        }
    }

    // --- GẮN CÁC SỰ KIỆN ---
    saveAddBtn.addEventListener('click', handleAddArtist);
    saveEditBtn.addEventListener('click', handleUpdateArtist);

    searchBtn.addEventListener('click', filterAndRenderArtists);
    statusFilter.addEventListener('change', filterAndRenderArtists);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterAndRenderArtists();
        }
    });

    artistsTableBody.addEventListener('click', function(event) {
        const editBtn = event.target.closest('.edit-btn');
        if (editBtn) handleEditClick(editBtn.dataset.id);

        const deleteBtn = event.target.closest('.delete-btn');
        if (deleteBtn) handleDeleteClick(deleteBtn.dataset.id);
    });
    
    const editStatusSelect = document.getElementById('edit-artist-status');
    if (editStatusSelect) {
        editStatusSelect.innerHTML = `
            <option value="true">Đang hợp tác</option>
            <option value="false">Dừng hợp tác</option>
        `;
    }

    // --- KHỞI CHẠY ---
    loadArtists();
});