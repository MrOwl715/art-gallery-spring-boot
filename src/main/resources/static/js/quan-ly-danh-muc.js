document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // =======================================
    // CSDL MẪU CHO CẢ 2 LOẠI
    // =======================================
    const sampleGenres = [
        { id: 'gen01', name: 'Sơn dầu', description: 'Tranh được vẽ bằng chất liệu sơn dầu, có độ bền cao.', paintingCount: 3, status: 'Hiển thị' },
        { id: 'gen02', name: 'Trừu tượng', description: 'Tranh không mô tả vật thể cụ thể, thể hiện ý tưởng và cảm xúc.', paintingCount: 2, status: 'Hiển thị' },
        { id: 'gen03', name: 'Phong cảnh', description: 'Tranh vẽ về các khung cảnh thiên nhiên, làng quê, thành phố.', paintingCount: 2, status: 'Hiển thị' },
        { id: 'gen04', name: 'Sơn mài', description: 'Nghệ thuật truyền thống sử dụng nhựa cây sơn.', paintingCount: 1, status: 'Hiển thị' },
        { id: 'gen05', name: 'Chân dung', description: 'Tranh vẽ về con người.', paintingCount: 0, status: 'Ẩn' }
    ];
    const sampleMaterials = [
        { id: 'mat01', name: 'Sơn dầu', description: 'Chất liệu sơn dầu trên vải toan.', paintingCount: 2, status: 'Hiển thị' },
        { id: 'mat02', name: 'Màu nước', description: 'Chất liệu màu nước trên giấy.', paintingCount: 1, status: 'Ẩn' },
        { id: 'mat03', name: 'Sơn mài', description: 'Chất liệu sơn mài truyền thống.', paintingCount: 1, status: 'Hiển thị' },
    ];

    // =======================================
    // BIẾN TRẠNG THÁI & LẤY PHẦN TỬ DOM
    // =======================================
    let currentTab = 'genres'; // 'genres' hoặc 'materials'
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const genresTableBody = document.getElementById('genres-table-body');
    const materialsTableBody = document.getElementById('materials-table-body');
    const addNewBtn = document.getElementById('add-new-btn');
    const addNewBtnText = document.getElementById('add-new-btn-text');
    
    // Khởi tạo các đối tượng Modal của Bootstrap
    const genreModal = new bootstrap.Modal(document.getElementById('genreModal'));
    const materialModal = new bootstrap.Modal(document.getElementById('materialModal'));

    // =======================================
    // CÁC HÀM TIỆN ÍCH
    // =======================================
    const getStatusBadge = (status) => `<span class="badge ${status === 'Hiển thị' ? 'bg-success' : 'bg-secondary'}">${status}</span>`;

    // =======================================
    // CÁC HÀM RENDER
    // =======================================
    // Hàm render chung cho cả hai bảng
    function renderTable(data, tableBody, type) {
        tableBody.innerHTML = '';
        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-5">Chưa có dữ liệu</td></tr>`; return;
        }
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="fw-bold">${item.name}</div>
                    <div class="small text-muted">${item.id}</div>
                </td>
                <td style="max-width: 400px;">${item.description}</td>
                <td class="text-center">${item.paintingCount}</td>
                <td class="text-center">${getStatusBadge(item.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${item.id}" data-type="${type}" title="Chỉnh sửa"><i class="bi bi-pencil-square"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // =======================================
    // CÁC HÀM XỬ LÝ MODAL
    // =======================================
    function openEditModal(type, itemId) {
        if (type === 'genre') {
            const item = sampleGenres.find(g => g.id === itemId);
            if (!item) return;
            document.getElementById('genre-modal-title').textContent = 'Chỉnh sửa Thể loại';
            document.getElementById('genre-id').value = item.id;
            document.getElementById('genre-name').value = item.name;
            document.getElementById('genre-description').value = item.description;
            document.getElementById('genre-status-wrapper').style.display = 'block';
            document.getElementById('genre-status').value = item.status;
            genreModal.show();
        } else if (type === 'material') {
            const item = sampleMaterials.find(m => m.id === itemId);
            if (!item) return;
            document.getElementById('material-modal-title').textContent = 'Chỉnh sửa Chất liệu';
            document.getElementById('material-id').value = item.id;
            document.getElementById('material-name').value = item.name;
            document.getElementById('material-description').value = item.description;
            document.getElementById('material-status-wrapper').style.display = 'block';
            document.getElementById('material-status').value = item.status;
            materialModal.show();
        }
    }

    // =======================================
    // GẮN CÁC SỰ KIỆN
    // =======================================
    sidebarToggleBtn.addEventListener('click', () => mainContainer.classList.toggle('sidebar-collapsed'));

    // Sự kiện khi chuyển tab
    document.querySelectorAll('#category-tabs button[data-bs-toggle="tab"]').forEach(tabEl => {
        tabEl.addEventListener('show.bs.tab', event => {
            currentTab = event.target.id === 'genres-tab' ? 'genres' : 'materials';
            addNewBtnText.textContent = currentTab === 'genres' ? 'Thêm Thể loại mới' : 'Thêm Chất liệu mới';
        });
    });

    // Sự kiện cho nút Thêm mới (nút chính ở trên cùng)
    addNewBtn.addEventListener('click', () => {
        if (currentTab === 'genres') {
            document.getElementById('genre-modal-title').textContent = 'Thêm Thể loại mới';
            document.getElementById('genre-form').reset();
            document.getElementById('genre-status-wrapper').style.display = 'none'; // Ẩn trạng thái khi thêm mới
            genreModal.show();
        } else {
            document.getElementById('material-modal-title').textContent = 'Thêm Chất liệu mới';
            document.getElementById('material-form').reset();
            document.getElementById('material-status-wrapper').style.display = 'none'; // Ẩn trạng thái khi thêm mới
            materialModal.show();
        }
    });

    // Sự kiện cho các nút sửa (dùng event delegation)
    genresTableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) openEditModal(editBtn.dataset.type, editBtn.dataset.id);
    });
    materialsTableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) openEditModal(editBtn.dataset.type, editBtn.dataset.id);
    });

    // =======================================
    // KHỞI CHẠY LẦN ĐẦU
    // =======================================
    function initialize() {
        renderTable(sampleGenres, genresTableBody, 'genre');
        renderTable(sampleMaterials, materialsTableBody, 'material');
    }

    initialize();
});