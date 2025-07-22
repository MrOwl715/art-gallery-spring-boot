document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // =======================================
    // CSDL MẪU
    // =======================================
    const sampleArtists = [ { id: 'HS01', name: 'Văn Cao' }, { id: 'HS02', name: 'Bùi Xuân Phái' }, { id: 'HS03', name: 'Lê Phổ' } ];
    const availableCategories = ['Sơn dầu', 'Trừu tượng', 'Phong cảnh', 'Sơn mài', 'Chân dung'];
    const availableMaterials = ['Sơn dầu', 'Màu nước', 'Sơn mài', 'Acrylic', 'Lụa'];

    // =======================================
    // BIẾN TRẠNG THÁI & LẤY PHẦN TỬ DOM
    // =======================================
    let importSlipItems = []; // Mảng chứa các sản phẩm trong phiếu nhập hiện tại
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const importSlipContainer = document.getElementById('import-slip-items');
    const artistSelect = document.getElementById('artist-select');
    const totalImportValueEl = document.getElementById('total-import-value');
    const addNewPaintingModal = new bootstrap.Modal(document.getElementById('addNewPaintingModal'));
    const confirmAddPaintingBtn = document.getElementById('confirm-add-painting-btn');
    const reviewImportBtn = document.getElementById('review-import-btn');
    const finalConfirmModal = new bootstrap.Modal(document.getElementById('finalConfirmModal'));
    const finalConfirmAndPrintBtn = document.getElementById('final-confirm-and-print-btn');

    // =======================================
    // CÁC HÀM TIỆN ÍCH
    // =======================================
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // =======================================
    // CÁC HÀM RENDER
    // =======================================
    function renderImportSlip() {
        // Nếu không có sản phẩm nào, hiển thị thông báo
        if (importSlipItems.length === 0) {
            importSlipContainer.innerHTML = '<div class="text-center text-muted mt-3 p-3"><p>Chưa có sản phẩm nào được thêm vào phiếu.</p></div>';
        } else {
            // Nếu có sản phẩm, tạo bảng để hiển thị
            const table = document.createElement('table');
            table.className = 'table align-middle';
            table.innerHTML = `
                <thead class="table-light"><tr><th>Sản phẩm</th><th>Thể loại</th><th>Chất liệu</th><th class="text-end">Giá nhập</th><th></th></tr></thead>
                <tbody></tbody>
            `;
            const tbody = table.querySelector('tbody');
            importSlipItems.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="fw-bold">${item.name}</div>
                        <small class="text-muted">Họa sĩ: ${item.artist}</small>
                    </td>
                    <td>${item.category}</td>
                    <td>${item.material}</td>
                    <td class="text-end">${formatCurrency(item.importPrice)}</td>
                    <td class="text-center"><button class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${index}" title="Xóa">&times;</button></td>
                `;
                tbody.appendChild(row);
            });
            importSlipContainer.innerHTML = '';
            importSlipContainer.appendChild(table);
        }
        updateTotalValue();
    }
    
    function updateTotalValue() {
        const total = importSlipItems.reduce((sum, item) => sum + item.importPrice, 0);
        totalImportValueEl.textContent = formatCurrency(total);
    }
    
    function populateSelects() {
        artistSelect.innerHTML = '<option selected disabled>Chọn nhà cung cấp...</option>' + sampleArtists.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
        
        const categorySelect = document.getElementById('add-category-select');
        const materialSelect = document.getElementById('add-material-select');
        categorySelect.innerHTML = availableCategories.map(c => `<option value="${c}">${c}</option>`).join('');
        materialSelect.innerHTML = availableMaterials.map(m => `<option value="${m}">${m}</option>`).join('');
    }

    // =======================================
    // GẮN CÁC SỰ KIỆN
    // =======================================
    sidebarToggleBtn.addEventListener('click', () => mainContainer.classList.toggle('sidebar-collapsed'));

    artistSelect.addEventListener('change', function() {
        const artistName = this.value;
        const addArtistSelect = document.getElementById('add-artist-select');
        addArtistSelect.innerHTML = `<option value="${artistName}" selected>${artistName}</option>`;
    });

    confirmAddPaintingBtn.addEventListener('click', () => {
        const formData = {
            id: 'temp_' + Date.now(),
            name: document.getElementById('add-name').value,
            artist: document.getElementById('add-artist-select').value,
            importPrice: parseFloat(document.getElementById('add-import-price').value),
            category: document.getElementById('add-category-select').value,
            material: document.getElementById('add-material-select').value,
            quantity: 1 // Số lượng luôn là 1 theo yêu cầu
        };

        if (!formData.name || !formData.artist || isNaN(formData.importPrice)) {
            alert('Vui lòng điền đầy đủ Tên tranh, Họa sĩ và Giá nhập.');
            return;
        }

        importSlipItems.push(formData);
        renderImportSlip();
        addNewPaintingModal.hide();
        document.getElementById('add-painting-form').reset();
    });

    importSlipContainer.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item-btn')) {
            const itemIndex = parseInt(e.target.closest('.remove-item-btn').dataset.index, 10);
            importSlipItems.splice(itemIndex, 1); // Xóa sản phẩm khỏi mảng
            renderImportSlip(); // Vẽ lại danh sách
        }
    });

    reviewImportBtn.addEventListener('click', function() {
        const artist = artistSelect.value;
        if (!artist || artist === 'Chọn nhà cung cấp...') { alert('Vui lòng chọn nhà cung cấp.'); return; }
        if (importSlipItems.length === 0) { alert('Phiếu nhập trống. Vui lòng thêm sản phẩm.'); return; }

        // Tạo nội dung tóm tắt và điền vào modal xác nhận cuối cùng
        const summaryDiv = document.getElementById('final-confirm-summary');
        let total = importSlipItems.reduce((sum, item) => sum + item.importPrice, 0);
        let itemsHtml = importSlipItems.map(p => `<tr><td>${p.name}</td><td class="text-end">${formatCurrency(p.importPrice)}</td></tr>`).join('');
        
        summaryDiv.innerHTML = `
            <p><strong>Nhà cung cấp:</strong> ${artist}</p>
            <p><strong>Ngày nhập:</strong> ${new Date(document.getElementById('import-date').value).toLocaleDateString('vi-VN')}</p>
            <div class="table-responsive">
                <table class="table table-sm"><thead><tr><th>Sản phẩm</th><th class="text-end">Giá nhập</th></tr></thead><tbody>${itemsHtml}</tbody></table>
            </div>
            <hr>
            <div class="text-end fs-5"><strong>Tổng cộng: <span class="text-primary">${formatCurrency(total)}</span></strong></div>
        `;
        finalConfirmModal.show();
    });
    
    finalConfirmAndPrintBtn.addEventListener('click', function() {
        const slipData = {
            id: 'PN' + Date.now().toString().slice(-6),
            artistName: artistSelect.value,
            date: document.getElementById('import-date').value,
            employeeName: 'Admin',
            products: importSlipItems,
            totalValue: importSlipItems.reduce((sum, item) => sum + item.importPrice, 0)
        };
        
        localStorage.setItem('slipForPrint', JSON.stringify(slipData));
        window.open('hoa-don-nhap.html', '_blank');
        
        alert(`Đã tạo thành công Phiếu nhập #${slipData.id}. Chuyển về trang quản lý.`);
        finalConfirmModal.hide();
        window.location.href = 'quan-ly-nhap-hang.html';
    });


    // =======================================
    // KHỞI CHẠY LẦN ĐẦU
    // =======================================
    function initialize() {
        populateSelects();
        renderImportSlip();
        document.getElementById('import-date').valueAsDate = new Date();
    }
    
    initialize();
});