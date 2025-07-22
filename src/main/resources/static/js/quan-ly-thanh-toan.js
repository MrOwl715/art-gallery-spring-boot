document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // --- Lấy các phần tử DOM ---
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const configPaymentModalEl = document.getElementById('configPaymentModal');
    const configPaymentModal = new bootstrap.Modal(configPaymentModalEl);

    // --- Cấu trúc form động ---
    const formTemplates = {
        'QR Ngân hàng': `
            <div class="mb-3">
                <label class="form-label">Tên chủ tài khoản</label>
                <input type="text" id="bank-account-name" class="form-control" value="TRAN MINH ADMIN">
            </div>
            <div class="mb-3">
                <label class="form-label">Số tài khoản</label>
                <input type="number" id="bank-account-number" class="form-control" value="0987654321">
            </div>
            <div class="mb-3">
                <label class="form-label">Ngân hàng</label>
                <select class="form-select" id="bank-select">
                    <option value="970415" selected>VietinBank</option>
                    <option value="970436">Vietcombank</option>
                    <option value="970407">Techcombank</option>
                    <option value="970422">MB Bank</option>
                </select>
            </div>
            <hr>
            <p class="text-center text-muted small">Xem trước mã QR được tạo tự động</p>
            <div class="text-center">
                <img id="bank-qr-preview" src="" class="img-fluid rounded border" style="max-width: 200px;" alt="QR Preview">
            </div>
        `,
        'Ví Momo': `
            <div class="mb-3">
                <label class="form-label">Số điện thoại/Tên người nhận</label>
                <input type="text" class="form-control" value="TRAN MINH ADMIN">
            </div>
            <p class="text-muted small">Vui lòng tải lên ảnh mã QR nhận tiền từ ứng dụng Momo của bạn.</p>
            <label class="form-label">Ảnh mã QR</label>
            <label class="image-upload-box" for="momo-qr-input">
                <span class="upload-text">Nhấn để tải ảnh lên</span>
                <img src="" class="image-preview" alt="Image preview">
                <input type="file" id="momo-qr-input" class="image-upload-input" accept="image/*">
            </label>
        `,
        'Ví ZaloPay': `
             <div class="mb-3">
                <label class="form-label">Số điện thoại/Tên người nhận</label>
                <input type="text" class="form-control" value="TRAN MINH ADMIN">
            </div>
            <p class="text-muted small">Vui lòng tải lên ảnh mã QR nhận tiền từ ứng dụng ZaloPay của bạn.</p>
            <label class="form-label">Ảnh mã QR</label>
            <label class="image-upload-box" for="zalopay-qr-input">
                <span class="upload-text">Nhấn để tải ảnh lên</span>
                <img src="" class="image-preview" alt="Image preview">
                <input type="file" id="zalopay-qr-input" class="image-upload-input" accept="image/*">
            </label>
        `
    };

    // --- Hàm xử lý ---
    function updateBankQrPreview() {
        const accountName = document.getElementById('bank-account-name').value;
        const accountNumber = document.getElementById('bank-account-number').value;
        const bankId = document.getElementById('bank-select').value;
        const qrPreviewImg = document.getElementById('bank-qr-preview');
        
        if (accountNumber && bankId) {
            qrPreviewImg.src = `https://api.vietqr.io/image/${bankId}-${accountNumber}-print.png?accountName=${encodeURIComponent(accountName)}`;
        } else {
            qrPreviewImg.src = '';
        }
    }

    function setupImageUpload(inputEl) {
        const uploadBox = inputEl.closest('.image-upload-box');
        const imagePreview = uploadBox.querySelector('.image-preview');
        const uploadText = uploadBox.querySelector('.upload-text');
        inputEl.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    if (uploadText) uploadText.style.display = 'none';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Gắn các sự kiện ---
    sidebarToggleBtn.addEventListener('click', () => {
        mainContainer.classList.toggle('sidebar-collapsed');
    });

    // Lắng nghe sự kiện "show.bs.modal" để chuẩn bị nội dung cho modal cấu hình
    configPaymentModalEl.addEventListener('show.bs.modal', function(event) {
        const configBtn = event.relatedTarget;
        const methodName = configBtn.dataset.method;
        
        document.getElementById('config-modal-title').textContent = methodName;
        const modalBody = document.getElementById('config-modal-body');
        modalBody.innerHTML = formTemplates[methodName] || '<p>Không có tùy chọn cấu hình cho phương thức này.</p>';

        if (methodName === 'QR Ngân hàng') {
            updateBankQrPreview(); // Cập nhật QR lần đầu
            // Thêm sự kiện để cập nhật QR khi người dùng thay đổi thông tin
            modalBody.querySelector('#bank-account-name').addEventListener('input', updateBankQrPreview);
            modalBody.querySelector('#bank-account-number').addEventListener('input', updateBankQrPreview);
            modalBody.querySelector('#bank-select').addEventListener('change', updateBankQrPreview);
        } else if (methodName === 'Ví Momo' || methodName === 'Ví ZaloPay') {
            const inputEl = modalBody.querySelector('.image-upload-input');
            if (inputEl) {
                setupImageUpload(inputEl);
            }
        }
    });
});