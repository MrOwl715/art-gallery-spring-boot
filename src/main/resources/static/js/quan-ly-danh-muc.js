document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const genresTableBody = document.getElementById('genres-table-body');
    const genreModal = new bootstrap.Modal(document.getElementById('genreModal'));
    const genreForm = document.getElementById('genre-form');
    const saveGenreBtn = document.getElementById('save-genre-btn');
    const addNewBtn = document.getElementById('add-new-btn');
    const modalTitle = document.getElementById('genre-modal-title');

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
    const getStatusBadge = (status) => `<span class="badge ${status ? 'bg-success' : 'bg-secondary'}">${status ? 'Hiển thị' : 'Ẩn'}</span>`;

    // --- HÀM RENDER ---
    function renderTable(categories) {
        genresTableBody.innerHTML = '';
        if (!categories || categories.length === 0) {
            genresTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-5">Chưa có danh mục nào</td></tr>`;
            return;
        }
        categories.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><div class="fw-bold">${item.name}</div></td>
                <td style="max-width: 400px;">${item.description || ''}</td>
                <td class="text-center">${item.paintingCount}</td>
                <td class="text-center">${getStatusBadge(item.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${item.id}" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${item.id}" title="Xóa"><i class="bi bi-trash"></i></button>
                </td>
            `;
            genresTableBody.appendChild(row);
        });
    }

    // --- HÀM TẢI DỮ LIỆU ---
    async function loadCategories() {
        try {
            const categories = await fetchApi('/categories');
            renderTable(categories);
        } catch (error) {
            alert(`Lỗi tải danh mục: ${error.message}`);
        }
    }
    
    // --- HÀM XỬ LÝ SỰ KIỆN ---
    function handleAddNewClick() {
        genreForm.reset();
        document.getElementById('genre-id').value = '';
        modalTitle.textContent = 'Thêm Thể loại mới';
        document.getElementById('genre-status').value = "true";
        genreModal.show();
    }

    async function handleEditClick(categoryId) {
        try {
            const category = await fetchApi(`/categories/${categoryId}`);
            document.getElementById('genre-id').value = category.id;
            modalTitle.textContent = 'Chỉnh sửa Thể loại';
            document.getElementById('genre-name').value = category.name;
            document.getElementById('genre-description').value = category.description;
            // DÒNG NÀY GIỜ SẼ HOẠT ĐỘNG ĐÚNG
            document.getElementById('genre-status').value = category.status;
            genreModal.show();
        } catch (error) {
            alert(`Lỗi: ${error.message}`);
        }
    }

    async function handleSave() {
        const categoryId = document.getElementById('genre-id').value;
        const categoryData = {
            name: document.getElementById('genre-name').value,
            description: document.getElementById('genre-description').value,
            // DÒNG NÀY GIỜ SẼ HOẠT ĐỘNG ĐÚNG
            status: document.getElementById('genre-status').value === 'true'
        };

        const isUpdating = !!categoryId;
        const endpoint = isUpdating ? `/categories/${categoryId}` : '/categories';
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            await fetchApi(endpoint, {
                method: method,
                body: JSON.stringify(categoryData)
            });
            genreModal.hide();
            loadCategories(); // Tải lại danh sách sau khi lưu
        } catch (error) {
            alert(`Lưu thất bại: ${error.message}`);
        }
    }
    
    async function handleDeleteClick(categoryId) {
        if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
        try {
            await fetchApi(`/categories/${categoryId}`, { method: 'DELETE' });
            loadCategories();
        } catch (error) {
            alert(`Xóa thất bại: ${error.message}`);
        }
    }

    // --- GẮN CÁC SỰ KIỆN ---
    addNewBtn.addEventListener('click', handleAddNewClick);
    saveGenreBtn.addEventListener('click', handleSave);

    genresTableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) handleEditClick(editBtn.dataset.id);
        
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) handleDeleteClick(deleteBtn.dataset.id);
    });

    // --- KHỞI CHẠY ---
    loadCategories();
});