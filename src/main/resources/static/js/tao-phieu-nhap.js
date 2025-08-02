document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    // --- BIẾN TRẠNG THÁI & DOM ---
    let importSlipItems = [];
    let allArtists = [];
    let allCategories = [];

    const importSlipContainer = document.getElementById('import-slip-items');
    const artistSelect = document.getElementById('artist-select');
    const totalImportValueEl = document.getElementById('total-import-value');
    const addNewPaintingModal = new bootstrap.Modal(document.getElementById('addNewPaintingModal'));
    const confirmAddPaintingBtn = document.getElementById('confirm-add-painting-btn');
    
    const reviewImportBtn = document.getElementById('review-import-btn');
    const finalConfirmModal = new bootstrap.Modal(document.getElementById('finalConfirmModal'));
    const finalConfirmAndPrintBtn = document.getElementById('final-confirm-and-print-btn');

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
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // --- HÀM MỚI: TẢI FILE LÊN SERVER ---
    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/files/upload/painting`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Upload file thất bại.');
        }
        const result = await response.json();
        return result.filePath; // Trả về đường dẫn file trên server
    }

    // --- CÁC HÀM RENDER ---
    function renderImportSlip() {
        if (importSlipItems.length === 0) {
            importSlipContainer.innerHTML = '<div class="text-center text-muted mt-3 p-3"><p>Chưa có sản phẩm nào được thêm vào phiếu.</p></div>';
        } else {
            const table = document.createElement('table');
            table.className = 'table align-middle';
            table.innerHTML = `<thead><tr><th>Sản phẩm</th><th>Thể loại</th><th class="text-end">Giá nhập</th><th class="text-end">Giá bán</th><th></th></tr></thead><tbody></tbody>`;
            const tbody = table.querySelector('tbody');
            importSlipItems.forEach((item, index) => {
                const category = allCategories.find(c => c.id == item.categoryId);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${item.imageUrl || 'https://placehold.co/60x60'}" width="40" height="40" class="me-3 rounded" alt="${item.name}">
                            <div class="fw-bold">${item.name}</div>
                        </div>
                    </td>
                    <td>${category ? category.name : ''}</td>
                    <td class="text-end">${formatCurrency(item.importPrice)}</td>
                    <td class="text-end">${formatCurrency(item.sellingPrice)}</td>
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
        const total = importSlipItems.reduce((sum, item) => sum + (item.importPrice * 1), 0); // Mỗi sản phẩm nhập số lượng là 1
        totalImportValueEl.textContent = formatCurrency(total);
    }

    // --- CÁC HÀM XỬ LÝ ---
    async function handleAddItemToSlip() {
        const addPaintingForm = document.getElementById('add-painting-form');
        const imageFileInput = document.getElementById('add-image-file');
        let imageUrl = document.getElementById('add-image-url').value.trim();

        // Ưu tiên ảnh upload
        if (imageFileInput.files.length > 0) {
            try {
                imageUrl = await uploadFile(imageFileInput.files[0]);
            } catch (error) {
                alert(`Lỗi tải ảnh lên: ${error.message}`);
                return;
            }
        }
        
        const newItem = {
            name: document.getElementById('add-name').value,
            importPrice: parseFloat(document.getElementById('add-import-price').value),
            sellingPrice: parseFloat(document.getElementById('add-selling-price').value),
            description: document.getElementById('add-description').value,
            material: document.getElementById('add-material').value,
            size: document.getElementById('add-size').value,
            imageUrl: imageUrl, // Sử dụng URL sau khi đã upload
            categoryId: document.getElementById('add-category-select').value,
        };

        if (!newItem.name || !newItem.categoryId || isNaN(newItem.importPrice) || isNaN(newItem.sellingPrice)) {
            alert('Vui lòng điền đầy đủ Tên tranh, Giá nhập, Giá bán và chọn Thể loại.');
            return;
        }

        if (newItem.sellingPrice <= newItem.importPrice) {
            alert('Giá bán phải cao hơn giá nhập.');
            return;
        }

        importSlipItems.push(newItem);
        renderImportSlip();
        addNewPaintingModal.hide();
        addPaintingForm.reset();
    }

    function handleReviewImport() {
        if (importSlipItems.length === 0) {
            alert('Phiếu nhập trống, vui lòng thêm sản phẩm.');
            return false;
        }
        const artistId = artistSelect.value;
        if (!artistId) {
            alert('Vui lòng chọn nhà cung cấp (họa sĩ).');
            return false;
        }

        const artist = allArtists.find(a => a.id == artistId);
        const total = importSlipItems.reduce((sum, item) => sum + item.importPrice, 0);
        let itemsHtml = importSlipItems.map(p => `<tr><td>${p.name}</td><td class="text-end">${formatCurrency(p.importPrice)}</td></tr>`).join('');
        
        const summaryDiv = document.getElementById('final-confirm-summary');
        summaryDiv.innerHTML = `
            <p><strong>Nhà cung cấp:</strong> ${artist.name}</p>
            <p><strong>Ngày nhập:</strong> ${new Date(document.getElementById('import-date').value).toLocaleDateString('vi-VN')}</p>
            <div class="table-responsive">
                <table class="table table-sm"><thead><tr><th>Sản phẩm</th><th class="text-end">Giá nhập</th></tr></thead><tbody>${itemsHtml}</tbody></table>
            </div>
            <hr>
            <div class="text-end fs-5"><strong>Tổng cộng: <span class="text-primary">${formatCurrency(total)}</span></strong></div>
        `;
        return true;
    }

    async function handleFinalConfirm() {
        const requestData = {
            artistId: artistSelect.value,
            newPaintings: importSlipItems
        };

        try {
            const createdSlip = await fetchApi('/import-slips', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });
            alert('Tạo phiếu nhập thành công!');
            finalConfirmModal.hide();
            window.location.href = '/quan-ly-nhap-hang.html';
        } catch (error) {
            alert(`Lỗi tạo phiếu nhập: ${error.message}`);
        }
    }

    // --- KHỞI CHẠY & GẮN SỰ KIỆN ---
    async function initializePage() {
        try {
            [allArtists, allCategories] = await Promise.all([
                fetchApi('/artists'),
                fetchApi('/categories')
            ]);
            
            artistSelect.innerHTML = '<option value="" disabled selected>Chọn nhà cung cấp...</option>' + allArtists.filter(a => a.status).map(a => `<option value="${a.id}">${a.name}</option>`).join('');
            document.getElementById('add-category-select').innerHTML = '<option value="" disabled selected>Chọn thể loại...</option>' + allCategories.filter(c => c.status).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        
            renderImportSlip();
            document.getElementById('import-date').valueAsDate = new Date();
        } catch(error) {
            console.error(error);
            alert('Không thể tải dữ liệu cần thiết cho trang. Vui lòng thử lại.');
        }
    }
    
    confirmAddPaintingBtn.addEventListener('click', handleAddItemToSlip);
    
    reviewImportBtn.addEventListener('click', () => {
        if(handleReviewImport()) {
            finalConfirmModal.show();
        }
    });
    
    finalConfirmAndPrintBtn.addEventListener('click', handleFinalConfirm);
    
    importSlipContainer.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item-btn')) {
            const index = e.target.closest('.remove-item-btn').dataset.index;
            importSlipItems.splice(index, 1);
            renderImportSlip();
        }
    });

    initializePage();
});