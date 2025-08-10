document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    // --- TRẠNG THÁI ---
    let allArtists = [];
    let allCategories = [];
    let importSlipItems = [];
    let accessToken = localStorage.getItem('accessToken') || null;

    // --- HELPERS ---
    const formatCurrency = (amount) => {
        if (isNaN(amount) || amount === null) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const validateFileUpload = (file) => {
        if (!file) return { valid: false, error: 'Không có file được chọn' };
        if (file.size > MAX_FILE_SIZE) return { valid: false, error: 'File quá lớn. Kích thước tối đa là 5MB' };
        if (!ALLOWED_FILE_TYPES.includes(file.type)) return { valid: false, error: 'Định dạng file không được hỗ trợ. Chỉ hỗ trợ JPG, PNG, GIF, WebP' };
        return { valid: true };
    };

    // Toast notification (custom, self-contained)
    const showNotification = (message, type = 'info') => {
        const toastContainer = document.getElementById('toast-container') || createToastContainer();
        const toast = createToast(message, type);
        toastContainer.appendChild(toast);
        // Auto remove
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 5000);
    };

    const createToastContainer = () => {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1050';
        document.body.appendChild(container);
        return container;
    };

    const createToast = (message, type) => {
        const toast = document.createElement('div');
        toast.className = 'toast show border-0 mb-2';
        toast.setAttribute('role', 'alert');
        const bgClass = type === 'error' ? 'bg-danger' : type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning' : 'bg-info';
        toast.innerHTML = `
            <div class="${bgClass} toast-header text-white">
                <strong class="me-auto">Thông báo</strong>
                <button type="button" class="btn-close btn-close-white" aria-label="Close"></button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        toast.querySelector('.btn-close').addEventListener('click', () => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        });
        return toast;
    };

    const showLoading = (element, show = true) => {
        if (!element) return;
        if (show) {
            element.disabled = true;
            element.dataset.originalText = element.innerHTML;
            element.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang xử lý...';
        } else {
            element.disabled = false;
            element.innerHTML = element.dataset.originalText || element.innerHTML;
        }
    };

    const getElement = (id) => {
        const el = document.getElementById(id);
        if (!el) console.warn(`Element với id="${id}" không tồn tại`);
        return el;
    };

    // --- DOM ELEMENTS ---
    const finalConfirmAndPrintBtn = getElement('final-confirm-and-print-btn');
    const artistSelect = getElement('artist-select');
    const importSlipContainer = getElement('import-slip-container');
    const totalImportValueEl = getElement('total-import-value');
    const confirmAddPaintingBtn = getElement('confirm-add-painting-btn');
    const reviewImportBtn = getElement('review-import-btn');
    const importDateInput = getElement('import-date');
    const importSlipsListContainer = getElement('import-slips-list-container'); // nơi render danh sách phiếu nhập

    // Bootstrap modals (safe init)
    let addNewPaintingModal = null;
    let finalConfirmModal = null;
    const initializeModals = () => {
        const addModalEl = getElement('addNewPaintingModal');
        const finalModalEl = getElement('finalConfirmModal');
        if (addModalEl && typeof bootstrap !== 'undefined') addNewPaintingModal = new bootstrap.Modal(addModalEl);
        if (finalModalEl && typeof bootstrap !== 'undefined') finalConfirmModal = new bootstrap.Modal(finalModalEl);
    };

    // --- FETCH API (chung) ---
    async function fetchApi(endpoint, options = {}) {
        const token = localStorage.getItem('accessToken') || accessToken;
        const headers = { ...options.headers };
        // Don't set Content-Type when sending FormData
        if (!(options.body instanceof FormData)) headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('accessToken');
                showNotification('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
                setTimeout(() => window.location.href = '/dang-nhap.html', 1200);
                return null;
            }
            if (!response.ok) {
                // Try parse message
                let msg = 'Có lỗi xảy ra';
                try {
                    const err = await response.json();
                    msg = err.message || msg;
                } catch (e) {}
                throw new Error(msg);
            }
            if (response.status === 204) return null;
            return await response.json();
        } catch (err) {
            showNotification(`Lỗi API: ${err.message}`, 'error');
            throw err;
        }
    }

    // --- UPLOAD FILE ---
    async function uploadFile(file) {
        const validation = validateFileUpload(file);
        if (!validation.valid) throw new Error(validation.error);

        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('accessToken') || accessToken;
        const headers = {}; // do dùng FormData, để fetch tự set boundary
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const resp = await fetch(`${API_BASE_URL}/files/upload/painting`, {
            method: 'POST',
            headers,
            body: formData
        });

        if (!resp.ok) {
            let msg = 'Upload file thất bại';
            try { const d = await resp.json(); msg = d.message || msg; } catch {}
            throw new Error(msg);
        }
        const data = await resp.json();
        // giả sử API trả { filePath: '...'}
        return data.filePath || data.path || data.url || '';
    }

    // --- RENDER PHIẾU NHẬP (trong trang tạo) ---
    function renderImportSlip() {
        if (!importSlipContainer) return;
        if (!Array.isArray(importSlipItems) || importSlipItems.length === 0) {
            importSlipContainer.innerHTML = `
                <div class="text-center text-muted mt-3 p-3">
                    <div class="mb-3">Chưa có sản phẩm nào được thêm vào phiếu.</div>
                    <small class="text-muted">Nhấn "Thêm tranh mới" để bắt đầu.</small>
                </div>
            `;
            updateTotalValue();
            return;
        }

        const table = document.createElement('table');
        table.className = 'table align-middle mb-0';
        table.innerHTML = `
            <thead class="table-light">
                <tr>
                    <th>Sản phẩm</th>
                    <th>Thể loại</th>
                    <th class="text-end">Giá nhập</th>
                    <th class="text-end">Giá bán</th>
                    <th width="50"></th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        importSlipItems.forEach((item, index) => {
            const category = allCategories.find(c => c.id == item.categoryId);
            const imageHtml = item.imageUrl ? `<img src="${item.imageUrl}" width="40" height="40" class="me-3 rounded object-fit-cover" alt="${item.name}" onerror="this.style.display='none'">` : '';
            const placeholder = !item.imageUrl ? `<div class="me-3 rounded bg-light d-flex align-items-center justify-content-center" style="width:40px;height:40px;font-size:12px;color:#6c757d;">No</div>` : '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        ${imageHtml}${placeholder}
                        <div>
                            <div class="fw-bold text-truncate" style="max-width:200px;" title="${item.name}">${item.name}</div>
                            <small class="text-muted">${item.material || ''} ${item.size || ''}</small>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-secondary">${category ? category.name : 'Không xác định'}</span></td>
                <td class="text-end fw-bold text-primary">${formatCurrency(item.importPrice)}</td>
                <td class="text-end fw-bold text-success">${formatCurrency(item.sellingPrice)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${index}" type="button" title="Xóa">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        importSlipContainer.innerHTML = '';
        importSlipContainer.appendChild(table);
        updateTotalValue();
    }

    function updateTotalValue() {
        if (!totalImportValueEl) return;
        const total = importSlipItems.reduce((sum, it) => sum + (Number(it.importPrice) || 0), 0);
        totalImportValueEl.textContent = formatCurrency(total);
    }

    // --- THÊM 1 ITEM VÀO PHIẾU ---
    async function handleAddItemToSlip() {
        if (!confirmAddPaintingBtn) return;
        showLoading(confirmAddPaintingBtn, true);

        try {
            const addPaintingForm = getElement('add-painting-form');
            const imageFileInput = getElement('add-image-file');
            const imageUrlInput = getElement('add-image-url');
            const nameInput = getElement('add-name');
            const importPriceInput = getElement('add-import-price');
            const sellingPriceInput = getElement('add-selling-price');
            const descriptionInput = getElement('add-description');
            const materialInput = getElement('add-material');
            const sizeInput = getElement('add-size');
            const categorySelect = getElement('add-category-select');

            if (!addPaintingForm || !nameInput || !importPriceInput || !sellingPriceInput || !categorySelect) {
                throw new Error('Không tìm thấy các trường bắt buộc trong form');
            }

            let imageUrl = imageUrlInput ? imageUrlInput.value.trim() : '';

            // Nếu có file upload thì ưu tiên upload
            if (imageFileInput && imageFileInput.files && imageFileInput.files.length > 0) {
                try {
                    imageUrl = await uploadFile(imageFileInput.files[0]);
                    showNotification('Upload ảnh thành công!', 'success');
                } catch (err) {
                    showNotification(`Lỗi tải ảnh: ${err.message}`, 'error');
                    return;
                }
            }

            const importPrice = parseFloat(importPriceInput.value) || 0;
            const sellingPrice = parseFloat(sellingPriceInput.value) || 0;

            const newItem = {
                name: nameInput.value.trim(),
                importPrice,
                sellingPrice,
                description: descriptionInput ? descriptionInput.value.trim() : '',
                material: materialInput ? materialInput.value.trim() : '',
                size: sizeInput ? sizeInput.value.trim() : '',
                imageUrl,
                categoryId: categorySelect.value
            };

            // validate
            const errors = [];
            if (!newItem.name) errors.push('Tên tranh không được để trống');
            if (!newItem.categoryId) errors.push('Vui lòng chọn thể loại');
            if (importPrice <= 0) errors.push('Giá nhập phải lớn hơn 0');
            if (sellingPrice <= 0) errors.push('Giá bán phải lớn hơn 0');
            if (sellingPrice <= importPrice) errors.push('Giá bán phải cao hơn giá nhập');

            if (errors.length > 0) {
                showNotification(errors.join('<br>'), 'error');
                return;
            }

            importSlipItems.push(newItem);
            renderImportSlip();

            if (addNewPaintingModal) addNewPaintingModal.hide();
            if (addPaintingForm) addPaintingForm.reset();

            showNotification('Đã thêm sản phẩm vào phiếu nhập!', 'success');
        } catch (err) {
            console.error('Error adding item:', err);
            showNotification(`Lỗi thêm sản phẩm: ${err.message}`, 'error');
        } finally {
            showLoading(confirmAddPaintingBtn, false);
        }
    }

    // --- XEM TRƯỚC & XÁC NHẬN ---
    function handleReviewImport() {
        if (!importSlipItems || importSlipItems.length === 0) {
            showNotification('Phiếu nhập trống, vui lòng thêm sản phẩm.', 'warning');
            return false;
        }
        if (!artistSelect) {
            showNotification('Không tìm thấy dropdown nhà cung cấp.', 'error');
            return false;
        }
        const artistId = artistSelect.value;
        if (!artistId) {
            showNotification('Vui lòng chọn nhà cung cấp (họa sĩ).', 'warning');
            return false;
        }
        const artist = allArtists.find(a => a.id == artistId);
        if (!artist) {
            showNotification('Nhà cung cấp được chọn không hợp lệ.', 'error');
            return false;
        }

        const total = importSlipItems.reduce((s, it) => s + (Number(it.importPrice) || 0), 0);
        const itemsHtml = importSlipItems.map(p => `
            <tr>
                <td>${escapeHtml(p.name)}</td>
                <td class="text-end">${formatCurrency(p.importPrice)}</td>
            </tr>`).join('');

        const summaryDiv = getElement('final-confirm-summary');
        if (summaryDiv) {
            const importDate = importDateInput ? importDateInput.value : new Date().toISOString().split('T')[0];
            const formattedDate = new Date(importDate).toLocaleDateString('vi-VN');

            summaryDiv.innerHTML = `
                <div class="card border-0 bg-light">
                    <div class="card-body">
                        <div class="row mb-3"><div class="col-sm-4"><strong>Nhà cung cấp:</strong></div><div class="col-sm-8">${escapeHtml(artist.name)}</div></div>
                        <div class="row mb-3"><div class="col-sm-4"><strong>Ngày nhập:</strong></div><div class="col-sm-8">${formattedDate}</div></div>
                        <div class="row"><div class="col-sm-4"><strong>Số sản phẩm:</strong></div><div class="col-sm-8">${importSlipItems.length} sản phẩm</div></div>
                    </div>
                </div>
                <div class="table-responsive mt-3">
                    <table class="table table-sm">
                        <thead class="table-light"><tr><th>Sản phẩm</th><th class="text-end">Giá nhập</th></tr></thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>
                </div>
                <hr class="my-3">
                <div class="text-end"><h4 class="mb-0">Tổng cộng: <span class="text-primary">${formatCurrency(total)}</span></h4></div>
            `;
        }
        return true;
    }

    // escape HTML để tránh XSS trong render innerHTML
    function escapeHtml(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>"'`=\/]/g, function (s) {
            return ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
            })[s];
        });
    }

    // --- TẠO PHIẾU NHẬP - SAU KHI POST THÀNH CÔNG LOAD LẠI DANH SÁCH ---
    async function handleFinalConfirm() {
        if (!finalConfirmAndPrintBtn || !artistSelect) return;
        showLoading(finalConfirmAndPrintBtn, true);

        try {
            const requestData = {
                artistId: artistSelect.value,
                newPaintings: importSlipItems,
                importDate: importDateInput ? importDateInput.value : undefined
            };

            const created = await fetchApi('/import-slips', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });

            showNotification('Tạo phiếu nhập thành công!', 'success');
            if (finalConfirmModal) finalConfirmModal.hide();

            // Reset phiếu nhập hiện tại
            importSlipItems = [];
            renderImportSlip();

            // Load lại danh sách phiếu nhập từ server và render
            await loadImportSlips();

        } catch (err) {
            console.error('Error creating import slip:', err);
            showNotification(`Lỗi tạo phiếu nhập: ${err.message}`, 'error');
        } finally {
            showLoading(finalConfirmAndPrintBtn, false);
        }
    }

    // --- LOAD DANH SÁCH PHIẾU NHẬP (từ server) ---
    async function loadImportSlips() {
        try {
            const slips = await fetchApi('/import-slips');
            if (!slips) return; // lỗi đã được thông báo ở fetchApi
            renderImportSlipList(slips);
            showNotification('Danh sách phiếu nhập được cập nhật', 'success');
        } catch (err) {
            console.error('Lỗi load import slips:', err);
            showNotification(`Không thể tải danh sách phiếu nhập: ${err.message}`, 'error');
        }
    }

    // --- RENDER DANH SÁCH PHIẾU NHẬP (danh sách sau khi tạo) ---
    function renderImportSlipList(slips) {
        // Nếu không có container, chỉ log (không gây lỗi)
        if (!importSlipsListContainer) {
            console.log('import-slips-list-container không tồn tại. Dữ liệu phiếu nhập:', slips);
            return;
        }

        if (!Array.isArray(slips) || slips.length === 0) {
            importSlipsListContainer.innerHTML = '<div class="text-muted">Chưa có phiếu nhập nào.</div>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'table table-sm';
        table.innerHTML = `
            <thead class="table-light">
                <tr>
                    <th>Mã</th>
                    <th>Nhà cung cấp</th>
                    <th>Ngày</th>
                    <th class="text-end">Tổng tiền</th>
                    <th>Trạng thái</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        slips.forEach(s => {
            const tr = document.createElement('tr');
            const supplierName = s.artistName || (s.artist && s.artist.name) || 'N/A';
            const date = s.importDate ? new Date(s.importDate).toLocaleDateString('vi-VN') : (s.createdAt ? new Date(s.createdAt).toLocaleDateString('vi-VN') : '');
            const total = s.totalAmount || s.total || (Array.isArray(s.newPaintings) ? s.newPaintings.reduce((a,b)=>a+(Number(b.importPrice)||0),0) : 0);

            tr.innerHTML = `
                <td>#${s.id}</td>
                <td>${escapeHtml(supplierName)}</td>
                <td>${date}</td>
                <td class="text-end fw-bold">${formatCurrency(total)}</td>
                <td>${s.status ? '<span class="badge bg-success">Hoàn tất</span>' : '<span class="badge bg-secondary">Mới</span>'}</td>
            `;
            tbody.appendChild(tr);
        });

        importSlipsListContainer.innerHTML = '';
        importSlipsListContainer.appendChild(table);
    }

    // --- LOẠI BỎ ITEM TỪ PHIẾU (delegation) và các event binding ---
    function attachEventListeners() {
        // thêm tranh vào phiếu
        if (confirmAddPaintingBtn) confirmAddPaintingBtn.addEventListener('click', handleAddItemToSlip);

        // review -> show modal
        if (reviewImportBtn) {
            reviewImportBtn.addEventListener('click', () => {
                if (handleReviewImport() && finalConfirmModal) finalConfirmModal.show();
            });
        }

        // final confirm
        if (finalConfirmAndPrintBtn) finalConfirmAndPrintBtn.addEventListener('click', handleFinalConfirm);

        // remove item (event delegation)
        if (importSlipContainer) {
            importSlipContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.remove-item-btn');
                if (!btn) return;
                const idx = parseInt(btn.dataset.index);
                if (Number.isFinite(idx) && idx >= 0 && idx < importSlipItems.length) {
                    importSlipItems.splice(idx, 1);
                    renderImportSlip();
                    showNotification('Đã xóa sản phẩm khỏi phiếu nhập', 'success');
                }
            });
        }
    }

    // --- LOAD CÁC DỮ LIỆU KHỞI TẠO (họa sĩ, danh mục) ---
    async function loadInitialData() {
        try {
            const [artists, categories] = await Promise.all([
                fetchApi('/artists').catch(e => { console.error(e); return []; }),
                fetchApi('/categories').catch(e => { console.error(e); return []; })
            ]);

            allArtists = Array.isArray(artists) ? artists : [];
            allCategories = Array.isArray(categories) ? categories : [];

            // populate artistSelect
            if (artistSelect) {
                const active = allArtists.filter(a => a.status);
                if (active.length) {
                    artistSelect.innerHTML = `<option value="" disabled selected>Chọn nhà cung cấp...</option>` +
                        active.map(a => `<option value="${a.id}">${escapeHtml(a.name)}</option>`).join('');
                } else {
                    artistSelect.innerHTML = `<option value="" disabled selected>Không có nhà cung cấp hoạt động</option>`;
                }
            }

            // populate category select
            const addCategorySelect = getElement('add-category-select');
            if (addCategorySelect) {
                const activeCats = allCategories.filter(c => c.status);
                if (activeCats.length) {
                    addCategorySelect.innerHTML = `<option value="" disabled selected>Chọn thể loại...</option>` +
                        activeCats.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
                } else {
                    addCategorySelect.innerHTML = `<option value="" disabled selected>Không có thể loại</option>`;
                }
            }

        } catch (err) {
            console.error('Lỗi load initial data:', err);
            showNotification('Lỗi tải dữ liệu ban đầu', 'error');
        }
    }

    // --- INIT PAGE ---
    async function initializePage() {
        initializeModals();
        attachEventListeners();

        // set default import date
        if (importDateInput) importDateInput.valueAsDate = new Date();

        // load initial data + load import slips list
        await loadInitialData();
        await loadImportSlips();
        renderImportSlip(); // initial empty view
        showNotification('Trang đã được tải', 'success');
    }

    // start
    initializePage();

    // cleanup on unload (placeholder)
    window.addEventListener('beforeunload', function () {});
});
