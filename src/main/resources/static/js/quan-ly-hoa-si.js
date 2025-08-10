document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';

    // --- BIẾN LƯU TRỮ ---
    let allArtists = [];
    let timeoutId; // Biến để lưu ID của setTimeout cho debounce

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const artistsTableBody = document.getElementById('artists-table-body');
    const addArtistModal = new bootstrap.Modal(document.getElementById('addArtistModal'));
    const editArtistModal = new bootstrap.Modal(document.getElementById('editArtistModal'));
    
    const addArtistForm = document.getElementById('add-artist-form');
    const editArtistForm = document.getElementById('edit-artist-form');

    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');

    // --- HÀM TIỆN ÍCH ---
    const getStatusBadge = (status) => `<span class="badge ${status ? 'bg-success' : 'bg-secondary'}">${status ? 'Đang hợp tác' : 'Dừng hợp tác'}</span>`;

    // Hàm hiển thị thông báo lỗi/thành công
    function showToast(message, isSuccess = true) {
        const toastEl = document.getElementById('liveToast');
        if (!toastEl) return; // Tránh lỗi nếu không có toast element
        const toastBody = toastEl.querySelector('.toast-body');
        toastBody.textContent = message;
        toastEl.classList.remove('bg-danger', 'bg-success');
        toastEl.classList.add(isSuccess ? 'bg-success' : 'bg-danger');
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

    // Hàm Debounce
    function debounce(func, delay = 300) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
    }

    // --- HÀM GỌI API CHUNG ---
    async function fetchApi(endpoint, options = {}) {
        const token = localStorage.getItem('accessToken');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('accessToken');
                showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', false);
                setTimeout(() => window.location.href = '/dang-nhap.html', 2000);
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                let errorMessage = 'Có lỗi xảy ra';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // Giữ nguyên errorMessage mặc định nếu không parse được JSON
                }
                throw new Error(errorMessage);
            }

            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            // Chỉ hiển thị toast nếu lỗi không phải là do hết hạn token
            if (error.message !== 'Unauthorized') {
                 showToast(`Lỗi API: ${error.message}`, false);
            }
            throw error;
        }
    }

    // --- RENDER DANH SÁCH HỌA SĨ ---
    function renderArtists(artists) {
        artistsTableBody.innerHTML = '';
        if (!Array.isArray(artists) || artists.length === 0) {
            artistsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">Không tìm thấy họa sĩ nào</td></tr>';
            return;
        }
        const fragment = document.createDocumentFragment();
        artists.forEach((artist, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td><div class="fw-bold">${artist.name}</div></td>
                <td>
                    <div><i class="bi bi-phone me-2"></i>${artist.phone || 'N/A'}</div>
                    <div><i class="bi bi-envelope me-2"></i>${artist.email || 'N/A'}</div>
                </td>
                <td>${artist.address || 'Chưa có'}</td>
                <td class="text-center">${getStatusBadge(artist.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${artist.id}" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${artist.id}" title="Xóa"><i class="bi bi-trash"></i></button>
                </td>
            `;
            fragment.appendChild(row);
        });
        artistsTableBody.appendChild(fragment);
    }

    // --- LỌC & TÌM KIẾM ---
    function filterAndRenderArtists() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusValue = statusFilter.value;

        let filtered = allArtists;

        if (statusValue !== 'all') {
            const isActive = (statusValue === 'true');
            filtered = filtered.filter(a => a.status === isActive);
        }

        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(searchTerm) ||
                (a.phone && a.phone.toString().includes(searchTerm)) ||
                (a.email && a.email.toLowerCase().includes(searchTerm))
            );
        }
        renderArtists(filtered);
    }

    // --- LOAD DANH SÁCH ---
    async function loadArtists() {
        artistsTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';
        try {
            allArtists = await fetchApi('/artists');
            filterAndRenderArtists();
        } catch (error) {
            console.error(error);
            artistsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-5">Không thể tải danh sách họa sĩ.</td></tr>';
        }
    }

    // --- VALIDATE DỮ LIỆU ---
    function validateArtistData(name, phone, email) {
        if (!name) {
            showToast('Tên họa sĩ không được để trống.', false);
            return false;
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Email không hợp lệ.', false);
            return false;
        }
        if (phone && !/^\d{9,12}$/.test(phone)) {
            showToast('Số điện thoại không hợp lệ (yêu cầu 9-12 chữ số)..', false);
            return false;
        }
        return true;
    }

    // --- THÊM HỌA SĨ ---
    addArtistForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const name = document.getElementById('add-artist-name').value.trim();
        const phone = document.getElementById('add-artist-phone').value.trim();
        const email = document.getElementById('add-artist-email').value.trim();
        const address = document.getElementById('add-artist-address').value.trim();
        const biography = document.getElementById('add-artist-biography').value.trim();

        if (!validateArtistData(name, phone, email)) return;

        const artistData = { name, phone, email, address, biography, status: true };
        const saveBtn = addArtistForm.querySelector('button[type="submit"]');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang lưu...';

        try {
            await fetchApi('/artists', { method: 'POST', body: JSON.stringify(artistData) });
            addArtistModal.hide();
            addArtistForm.reset();
            showToast('Thêm họa sĩ thành công!');
            await loadArtists(); // Tải lại danh sách
        } catch (error) {
            // Lỗi đã được hiển thị bởi fetchApi
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Lưu lại';
        }
    });

    // --- SỬA HỌA SĨ ---
    async function handleEditClick(artistId) {
        try {
            const artist = await fetchApi(`/artists/${artistId}`);
            if (!artist) return;
            document.getElementById('edit-artist-id').value = artist.id;
            document.getElementById('edit-artist-name').value = artist.name || '';
            document.getElementById('edit-artist-phone').value = artist.phone || '';
            document.getElementById('edit-artist-email').value = artist.email || '';
            document.getElementById('edit-artist-address').value = artist.address || '';
            document.getElementById('edit-artist-biography').value = artist.biography || '';
            document.getElementById('edit-artist-status').value = (artist.status ?? true).toString();
            editArtistModal.show();
        } catch (error) {
            // Lỗi đã được hiển thị bởi fetchApi
        }
    }

    editArtistForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const artistId = document.getElementById('edit-artist-id').value;
        const name = document.getElementById('edit-artist-name').value.trim();
        const phone = document.getElementById('edit-artist-phone').value.trim();
        const email = document.getElementById('edit-artist-email').value.trim();
        const address = document.getElementById('edit-artist-address').value.trim();
        const biography = document.getElementById('edit-artist-biography').value.trim();
        const status = document.getElementById('edit-artist-status').value === 'true';

        if (!validateArtistData(name, phone, email)) return;

        const artistData = { name, phone, email, address, biography, status };
        const saveBtn = editArtistForm.querySelector('button[type="submit"]');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang cập nhật...';

        try {
            await fetchApi(`/artists/${artistId}`, { method: 'PUT', body: JSON.stringify(artistData) });
            editArtistModal.hide();
            showToast('Cập nhật họa sĩ thành công!');
            await loadArtists(); // Tải lại danh sách
        } catch (error) {
            // Lỗi đã được hiển thị bởi fetchApi
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Lưu thay đổi';
        }
    });

    // --- XÓA HỌA SĨ ---
    async function handleDeleteClick(artistId) {
        if (!confirm('Bạn có chắc chắn muốn xóa họa sĩ này? Hành động này có thể ảnh hưởng đến các tác phẩm liên quan.')) {
            return;
        }
        try {
            await fetchApi(`/artists/${artistId}`, { method: 'DELETE' });
            showToast('Xóa họa sĩ thành công!');
            await loadArtists(); // Tải lại danh sách
        } catch (error) {
            // Lỗi đã được hiển thị bởi fetchApi
        }
    }

    // --- GẮN SỰ KIỆN ---
    artistsTableBody.addEventListener('click', function (event) {
        const editBtn = event.target.closest('.edit-btn');
        if (editBtn) {
            handleEditClick(editBtn.dataset.id);
            return;
        }

        const deleteBtn = event.target.closest('.delete-btn');
        if (deleteBtn) {
            handleDeleteClick(deleteBtn.dataset.id);
        }
    });

    searchInput.addEventListener('input', () => debounce(filterAndRenderArtists, 300));
    statusFilter.addEventListener('change', filterAndRenderArtists);

    // --- KHỞI CHẠY ---
    loadArtists();
});
