document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const paymentMethodsContainer = document.querySelector('.row.g-4');
    // Khởi tạo modal một cách an toàn hơn
    const addModalEl = document.getElementById('addPaymentModal');
    const configModalEl = document.getElementById('configPaymentModal');
    const addPaymentModal = addModalEl ? new bootstrap.Modal(addModalEl) : null;
    const configPaymentModal = configModalEl ? new bootstrap.Modal(configModalEl) : null;
    
    const saveAddBtn = document.querySelector('#addPaymentModal .btn-primary');
    const saveConfigBtn = document.querySelector('#configPaymentModal .btn-primary');
    
    let currentEditingMethodId = null;

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
    
    function renderPaymentMethods(methods) {
        paymentMethodsContainer.innerHTML = '';
        if (!methods || methods.length === 0) {
            paymentMethodsContainer.innerHTML = '<p class="text-muted">Chưa có phương thức thanh toán nào được cấu hình.</p>';
            return;
        }
        methods.forEach(method => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-xl-4 col-xxl-3';
            col.innerHTML = `
                <div class="card h-100">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between">
                            <div>
                                <i class="bi bi-credit-card fs-2 text-primary"></i>
                                <h5 class="card-title mt-2">${method.method}</h5>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input status-switch" type="checkbox" role="switch" data-id="${method.id}" ${method.status ? 'checked' : ''}>
                            </div>
                        </div>
                        <p class="card-text small text-muted flex-grow-1">${method.description || 'Chưa có mô tả'}</p>
                        <p class="card-text small"><strong>Thông tin:</strong> ${method.accountNumber || 'N/A'}</p>
                        <button class="btn btn-outline-secondary btn-sm mt-2 config-btn" data-id="${method.id}">Cấu hình</button>
                    </div>
                </div>`;
            paymentMethodsContainer.appendChild(col);
        });
    }

    async function handleAddMethod(event) {
        event.preventDefault();
        const methodData = {
            method: document.getElementById('add-method-name').value,
            description: document.getElementById('add-method-desc').value,
            accountNumber: document.getElementById('add-method-account').value,
            status: true
        };
        try {
            await fetchApi('/payment-methods', { method: 'POST', body: JSON.stringify(methodData) });
            if (addPaymentModal) addPaymentModal.hide();
            document.getElementById('add-payment-form').reset();
            loadPaymentMethods();
        } catch (error) {
            alert(`Thêm thất bại: ${error.message}`);
        }
    }

    async function handleStatusToggle(methodId, newStatus) {
        try {
            const method = await fetchApi(`/payment-methods/${methodId}`);
            method.status = newStatus;
            await fetchApi(`/payment-methods/${methodId}`, { method: 'PUT', body: JSON.stringify(method) });
        } catch (error) {
            alert(`Cập nhật trạng thái thất bại: ${error.message}`);
            document.querySelector(`.status-switch[data-id="${methodId}"]`).checked = !newStatus;
        }
    }

    async function handleConfigClick(methodId) {
        currentEditingMethodId = methodId;
        try {
            const method = await fetchApi(`/payment-methods/${methodId}`);
            document.getElementById('config-modal-title').textContent = method.method;
            const modalBody = document.getElementById('config-modal-body');
            modalBody.innerHTML = `
                <div class="mb-3"><label class="form-label">Tên phương thức</label><input type="text" id="config-method-name" class="form-control" value="${method.method}"></div>
                <div class="mb-3"><label class="form-label">Mô tả</label><textarea id="config-method-desc" class="form-control" rows="3">${method.description || ''}</textarea></div>
                <div class="mb-3"><label class="form-label">Số tài khoản/Thông tin liên quan</label><input type="text" id="config-method-account" class="form-control" value="${method.accountNumber || ''}"></div>
            `;
            if (configPaymentModal) configPaymentModal.show();
        } catch (error) {
            alert(`Lỗi: ${error.message}`);
        }
    }
    
    async function handleSaveConfig() {
        if (!currentEditingMethodId) return;
        const methodData = {
            id: currentEditingMethodId,
            method: document.getElementById('config-method-name').value,
            description: document.getElementById('config-method-desc').value,
            accountNumber: document.getElementById('config-method-account').value,
            status: document.querySelector(`.status-switch[data-id="${currentEditingMethodId}"]`).checked
        };
        try {
            await fetchApi(`/payment-methods/${currentEditingMethodId}`, { method: 'PUT', body: JSON.stringify(methodData) });
            if (configPaymentModal) configPaymentModal.hide();
            loadPaymentMethods();
        } catch (error) {
            alert(`Lưu cấu hình thất bại: ${error.message}`);
        }
    }

    async function loadPaymentMethods() {
        try {
            const methods = await fetchApi('/payment-methods');
            renderPaymentMethods(methods);
        } catch(error) {
            console.error(error);
            paymentMethodsContainer.innerHTML = '<p class="text-danger">Không thể tải dữ liệu phương thức thanh toán.</p>';
        }
    }

    if (saveAddBtn) saveAddBtn.addEventListener('click', handleAddMethod);
    if (saveConfigBtn) saveConfigBtn.addEventListener('click', handleSaveConfig);

    paymentMethodsContainer.addEventListener('click', function(event) {
        const statusSwitch = event.target.closest('.status-switch');
        if (statusSwitch) handleStatusToggle(statusSwitch.dataset.id, statusSwitch.checked);
        
        const configBtn = event.target.closest('.config-btn');
        if (configBtn) handleConfigClick(configBtn.dataset.id);
    });
    
    loadPaymentMethods();
});