document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CSDL MẪU (đã thêm trường mới) ---
    const sampleArtists = [
        { id: 'HS01', name: 'Văn Cao', phone: '0901234567', email: 'vancao@email.com', address: '123 Phố Huế, Hà Nội', joinDate: '2022-01-15', status: 'Đang hợp tác' },
        { id: 'HS02', name: 'Bùi Xuân Phái', phone: '0912345678', email: 'buixuanphai@email.com', address: '45 Nguyễn Du, Hà Nội', joinDate: '2021-11-20', status: 'Đang hợp tác' },
        { id: 'HS03', name: 'Lê Phổ', phone: '0923456789', email: 'lepho@email.com', address: '78 Hàng Bông, Hà Nội', joinDate: '2023-03-10', status: 'Đang hợp tác' },
        { id: 'HS04', name: 'Nguyễn Gia Trí', phone: '0934567890', email: 'nguyengiatri@email.com', address: '21 Lý Thường Kiệt, Hà Nội', joinDate: '2020-05-01', status: 'Dừng hợp tác' },
        { id: 'HS05', name: 'Mai Trung Thứ', phone: '0945678901', email: 'maitrungthu@email.com', address: '90 Phan Đình Phùng, Hà Nội', joinDate: '2022-08-22', status: 'Đang hợp tác' }
    ];

    // --- Lấy các phần tử DOM ---
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const artistsTableBody = document.getElementById('artists-table-body');
    const editArtistModal = new bootstrap.Modal(document.getElementById('editArtistModal'));

    // --- Hàm tiện ích ---
    const getStatusBadge = (status) => {
        const badgeClass = status === 'Đang hợp tác' ? 'bg-success' : 'bg-secondary';
        return `<span class="badge ${badgeClass}">${status}</span>`;
    };

    // --- Hàm Render (đã cập nhật để hiển thị cột mới) ---
    function renderArtists(artists) {
        artistsTableBody.innerHTML = '';
        if (!artists || artists.length === 0) {
            artistsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">Không có dữ liệu</td></tr>';
            return;
        }

        artists.forEach((artist, index) => {
            const row = document.createElement('tr');
            // Cập nhật lại cấu trúc bảng để thêm cột Ngày hợp tác
            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td>
                    <div class="fw-bold">${artist.name}</div>
                    <div class="small text-muted">${artist.id}</div>
                </td>
                <td>
                    <div><i class="bi bi-phone me-2"></i>${artist.phone || 'Chưa có'}</div>
                    <div><i class="bi bi-envelope me-2"></i>${artist.email}</div>
                </td>
                <td>${artist.joinDate ? new Date(artist.joinDate).toLocaleDateString('vi-VN') : 'Chưa có'}</td>
                <td class="text-center">${getStatusBadge(artist.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${artist.id}" title="Chỉnh sửa">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary view-paintings-btn" data-name="${artist.name}" title="Xem các tác phẩm">
                        <i class="bi bi-palette"></i>
                    </button>
                </td>
            `;
            artistsTableBody.appendChild(row);
        });
    }

    // --- Hàm xử lý Logic & Modal (đã cập nhật để điền các trường mới) ---
    function handleEditClick(artistId) {
        const artist = sampleArtists.find(a => a.id === artistId);
        if (!artist) return;

        // Điền dữ liệu vào form, bao gồm cả các trường mới
        document.getElementById('edit-artist-id').value = artist.id;
        document.getElementById('edit-artist-name').value = artist.name;
        document.getElementById('edit-artist-phone').value = artist.phone;
        document.getElementById('edit-artist-email').value = artist.email;
        document.getElementById('edit-artist-address').value = artist.address;
        document.getElementById('edit-artist-date').value = artist.joinDate;
        document.getElementById('edit-artist-status').value = artist.status;
        
        editArtistModal.show();
    }
    
    // --- HÀM MỚI: Xử lý chuyển trang và lọc ---
    function handleViewPaintingsClick(artistName) {
        // Lưu tên họa sĩ vào localStorage để trang kia có thể đọc được
        localStorage.setItem('filterArtistName', artistName);
        // Chuyển hướng đến trang quản lý tranh
        window.location.href = 'quan-ly-tranh.html';
    }

    // --- Gắn các sự kiện (đã cập nhật) ---
    sidebarToggleBtn.addEventListener('click', () => {
        mainContainer.classList.toggle('sidebar-collapsed');
    });

    artistsTableBody.addEventListener('click', function(event) {
        const editBtn = event.target.closest('.edit-btn');
        const viewPaintingsBtn = event.target.closest('.view-paintings-btn');

        if (editBtn) {
            handleEditClick(editBtn.dataset.id);
        }
        if (viewPaintingsBtn) {
            handleViewPaintingsClick(viewPaintingsBtn.dataset.name);
        }
    });

    // --- Khởi chạy ---
    renderArtists(sampleArtists);
});