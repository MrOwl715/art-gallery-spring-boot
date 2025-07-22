document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // =======================================
    // CSDL MẪU & BIẾN TOÀN CỤC
    // =======================================
    const products = [
        { id: 'p1', name: 'Chiều hoàng hôn', artist: 'Văn Cao', price: 12000000, category: 'Phong cảnh', year: 1988, size: '80x60cm', material: 'Sơn dầu', image: 'https://images.unsplash.com/photo-1569783721365-4a634b3563a6?q=80&w=870', description: 'Bức tranh sơn dầu khắc họa cảnh hoàng hôn rực rỡ trên biển, mang lại cảm giác bình yên và sâu lắng.' },
        { id: 'p2', name: 'Mảnh ghép', artist: 'Bùi Xuân Phái', price: 25500000, category: 'Trừu tượng', year: 1972, size: '120x90cm', material: 'Sơn dầu', image: 'https://images.unsplash.com/photo-1531816434923-a07a75309328?q=80&w=774', description: 'Sự kết hợp táo bạo của các mảng màu, thể hiện sự phức tạp và đa chiều của cảm xúc con người.' },
        { id: 'p3', name: 'Phố cổ về đêm', artist: 'Bùi Xuân Phái', price: 450000000, category: 'Phong cảnh', year: 1980, size: '70x50cm', material: 'Sơn dầu', image: 'https://images.unsplash.com/photo-1599409353922-22c6a1eaf3e5?q=80&w=870', description: 'Góc phố Hà Nội quen thuộc hiện lên với những gam màu trầm buồn, đặc trưng trong phong cách của họa sĩ.' },
        { id: 'p4', name: 'Dòng chảy', artist: 'Lê Phổ', price: 180000000, category: 'Trừu tượng', year: 1995, size: '100x100cm', material: 'Màu nước', image: 'https://images.unsplash.com/photo-1502908813589-54315f6c9a35?q=80&w=870', description: 'Bức tranh là sự chuyển động không ngừng của màu sắc, như dòng chảy của thời gian và suy tưởng.' },
        { id: 'p5', name: 'Tĩnh vật bên cửa sổ', artist: 'Nguyễn Gia Trí', price: 32000000, category: 'Sơn dầu', year: 1965, size: '90x70cm', material: 'Sơn dầu', image: 'https://images.unsplash.com/photo-1574993022519-3c35f05d539e?q=80&w=774', description: 'Ánh sáng và bóng tối đan xen trên những vật thể đơn sơ, tạo nên một vẻ đẹp tĩnh lặng và đầy chiêm nghiệm.' },
        { id: 'p6', name: 'Sen hạ', artist: 'Mai Trung Thứ', price: 88000000, category: 'Sơn mài', year: 1978, size: '60x80cm', material: 'Sơn mài', image: 'https://images.unsplash.com/photo-1596634125381-196155456673?q=80&w=774', description: 'Vẻ đẹp thanh khiết của đóa sen trong hồ, được thể hiện qua kỹ thuật sơn mài truyền thống đặc sắc.' },
    ];
    let cart = [];
    const TAX_RATE = 0.08;

    // =======================================
    // LẤY CÁC PHẦN TỬ DOM
    // =======================================
    const mainContainer = document.querySelector('.main-container');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const productGrid = document.getElementById('product-grid');
    const genreFilters = document.getElementById('genre-filters');
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalAmountEl = document.getElementById('subtotal-amount');
    const taxAmountEl = document.getElementById('tax-amount');
    const totalAmountEl = document.getElementById('total-amount');
    const bsToast = new bootstrap.Toast(document.getElementById('liveToast'));
    const productDetailModalEl = document.getElementById('productDetailModal');
    const productDetailModal = new bootstrap.Modal(productDetailModalEl);
    const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
    const addCustomerModal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    const priceRangeSlider = document.getElementById('filter-price-range');
    const priceRangeValue = document.getElementById('price-range-value');
    const paymentBtn = document.getElementById('payment-btn');
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    const modalPaymentTotalEl = document.getElementById('modal-payment-total');
    const paymentMethodOptions = document.getElementById('payment-method-options');
    const cashPaymentFields = document.getElementById('cash-payment-fields');
    const qrPaymentFields = document.getElementById('qr-payment-fields');
    const cashReceivedInput = document.getElementById('cash-received');
    const cashChangeEl = document.getElementById('cash-change');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    const qrCodeImage = document.getElementById('qr-code-image');

    // =======================================
    // CÁC HÀM TIỆN ÍCH (HELPERS)
    // =======================================
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    function showToast(title, message, isSuccess = true) {
        const toastHeader = document.getElementById('toast-header');
        const toastIcon = document.getElementById('toast-icon');
        toastHeader.className = `toast-header ${isSuccess ? 'bg-success' : 'bg-danger'} text-white`;
        toastIcon.className = `bi ${isSuccess ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`;
        document.getElementById('toast-title').textContent = title;
        document.getElementById('toast-body').textContent = message;
        bsToast.show();
    }

    // =======================================
    // CÁC HÀM RENDER
    // =======================================
    function renderProducts(productsToRender) {
        productGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p class="col-12 text-muted text-center mt-5">Không tìm thấy sản phẩm nào phù hợp.</p>';
            return;
        }
        productsToRender.forEach(product => {
            const card = document.createElement('div');
            card.className = 'col-12 col-sm-6 col-lg-4 col-xl-3';
            // Cấu trúc HTML đã được cập nhật theo yêu cầu của bạn
            card.innerHTML = `
                <div class="card h-100 product-card" data-id="${product.id}">
                    <img src="${product.image}" 
                         class="card-img-top" 
                         alt="${product.name}" 
                         data-bs-toggle="modal" 
                         data-bs-target="#productDetailModal"
                         style="cursor: pointer;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted small">Họa sĩ: ${product.artist}</p>
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <span class="price">${formatCurrency(product.price)}</span>
                            <button class="btn btn-primary btn-sm add-to-cart-btn btn-icon" data-id="${product.id}" title="Thêm vào giỏ hàng">
                                <i class="bi bi-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
            productGrid.appendChild(card);
        });
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="text-center text-muted mt-5"><i class="bi bi-basket2 fs-1"></i><p>Chưa có sản phẩm nào</p></div>`;
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item d-flex align-items-center py-2 border-bottom';
                itemElement.innerHTML = `<div class="flex-grow-1 me-2"><div class="fw-bold small">${item.name}</div><div class="text-muted small">${formatCurrency(item.price)}</div></div><button class="btn btn-sm btn-outline-danger remove-from-cart-btn" data-id="${item.id}">&times;</button>`;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        updateTotals();
    }

    // =======================================
    // CÁC HÀM XỬ LÝ LOGIC
    // =======================================
    const updateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;
        subtotalAmountEl.textContent = formatCurrency(subtotal);
        taxAmountEl.textContent = formatCurrency(tax);
        totalAmountEl.textContent = formatCurrency(total);
        return total;
    };

    function handleAddToCart(productId) {
        if (cart.some(item => item.id === productId)) {
            showToast('Sản phẩm đã tồn tại', 'Sản phẩm này đã có trong giỏ hàng.', false);
            return;
        }
        const product = products.find(p => p.id === productId);
        if (product) {
            cart.push({ ...product, quantity: 1 });
            renderCart();
            showToast('Thành công', `Đã thêm "${product.name}" vào giỏ hàng.`);
        }
    }
    
    const handleRemoveFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        renderCart();
    };

    function showProductDetails(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        document.getElementById('modal-product-name').textContent = product.name;
        document.getElementById('modal-product-artist').textContent = product.artist;
        document.getElementById('modal-product-price').textContent = formatCurrency(product.price);
        document.getElementById('modal-product-year').textContent = product.year;
        document.getElementById('modal-product-size').textContent = product.size;
        document.getElementById('modal-product-category').textContent = product.category;
        document.getElementById('modal-product-material').textContent = product.material;
        document.getElementById('modal-product-image').src = product.image;
        document.getElementById('modal-product-description').textContent = product.description;
        document.getElementById('modal-add-to-cart-btn').dataset.id = product.id;
    }

    function populateFilterOptions() {
        const artists = [...new Set(products.map(p => p.artist))];
        const materials = [...new Set(products.map(p => p.material))];
        const genres = [...new Set(products.map(p => p.category))];
        const artistDatalist = document.getElementById('artist-datalist');
        const materialSelect = document.getElementById('filter-material');
        const genreSelect = document.getElementById('filter-genre');
        artistDatalist.innerHTML = '';
        materialSelect.innerHTML = '<option value="">Tất cả chất liệu</option>';
        genreSelect.innerHTML = '<option value="">Tất cả thể loại</option>';
        artists.forEach(artist => artistDatalist.innerHTML += `<option value="${artist}">`);
        materials.forEach(material => materialSelect.innerHTML += `<option value="${material}">${material}</option>`);
        genres.forEach(genre => genreSelect.innerHTML += `<option value="${genre}">${genre}</option>`);
    }

    function applyAdvancedFilters() {
        const priceMax = parseFloat(priceRangeSlider.value);
        const artist = document.getElementById('filter-artist-input').value;
        const material = document.getElementById('filter-material').value;
        const genre = document.getElementById('filter-genre').value;
        const filteredProducts = products.filter(p => {
            const priceCondition = p.price <= priceMax;
            const artistCondition = artist ? p.artist.toLowerCase().includes(artist.toLowerCase()) : true;
            const materialCondition = material ? p.material === material : true;
            const genreCondition = genre ? p.category === genre : true;
            return priceCondition && artistCondition && materialCondition && genreCondition;
        });
        renderProducts(filteredProducts);
        filterModal.hide();
    }
    
    function saveNewCustomer() {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        if (!name || !phone) {
            alert('Vui lòng nhập đầy đủ Họ tên và Số điện thoại.'); return;
        }
        const customerSelect = document.getElementById('customer-select');
        const newOption = document.createElement('option');
        newOption.value = Date.now();
        newOption.textContent = `${name} - ${phone}`;
        newOption.selected = true;
        customerSelect.appendChild(newOption);
        addCustomerModal.hide();
        document.getElementById('add-customer-form').reset();
        showToast('Thành công', `Đã thêm khách hàng "${name}".`);
    }
    
    function resetPOS() {
        cart = [];
        renderCart();
        document.getElementById('customer-select').value = "0";
    }

    function finishAndPrint() {
        const total = updateTotals();
        const orderId = 'HD' + Date.now().toString().slice(-6);
        const orderDataForPrint = { id: orderId, date: new Date().toLocaleString('vi-VN'), items: cart, subtotal: cart.reduce((sum, item) => sum + item.price, 0), tax: cart.reduce((sum, item) => sum + item.price, 0) * TAX_RATE, total: total };
        localStorage.setItem('currentOrderForPrint', JSON.stringify(orderDataForPrint));
        window.open('hoa-don.html', '_blank');
        paymentModal.hide();
        showToast('Thành công', `Đã tạo đơn hàng #${orderId}.`);
        resetPOS();
    }

    // =======================================
    // GẮN CÁC SỰ KIỆN (EVENT LISTENERS)
    // =======================================
    sidebarToggleBtn.addEventListener('click', () => mainContainer.classList.toggle('sidebar-collapsed'));

    genreFilters.addEventListener('click', (event) => {
        event.preventDefault();
        const target = event.target.closest('.nav-link');
        if (target) {
            genreFilters.querySelector('.active').classList.remove('active');
            target.classList.add('active');
            const genre = target.dataset.genre;
            const filteredProducts = genre === 'Tất cả' ? products : products.filter(p => p.category === genre);
            renderProducts(filteredProducts);
        }
    });

    // === SỬA LỖI CLICK DỨT ĐIỂM TẠI ĐÂY ===
    productGrid.addEventListener('click', (event) => {
        const addButton = event.target.closest('.add-to-cart-btn');
        if (addButton) {
            // Ngăn sự kiện click lan ra các phần tử cha (như card-body)
            event.stopPropagation(); 
            handleAddToCart(addButton.dataset.id);
        }
    });
    
    // Logic mở và điền dữ liệu cho modal chi tiết được chuyển sang đây
    productDetailModalEl.addEventListener('show.bs.modal', function (event) {
        const triggerElement = event.relatedTarget; // Element đã kích hoạt modal (cái ảnh)
        const productId = triggerElement.closest('.product-card').dataset.id;
        showProductDetails(productId);
    });

    cartItemsContainer.addEventListener('click', (event) => {
        const removeButton = event.target.closest('.remove-from-cart-btn');
        if (removeButton) { handleRemoveFromCart(removeButton.dataset.id); }
    });

    document.getElementById('modal-add-to-cart-btn').addEventListener('click', function() { handleAddToCart(this.dataset.id); productDetailModal.hide(); });
    priceRangeSlider.addEventListener('input', function() { priceRangeValue.textContent = formatCurrency(this.value); });
    document.getElementById('apply-filters-btn').addEventListener('click', applyAdvancedFilters);
    document.getElementById('reset-filters-btn').addEventListener('click', () => { document.getElementById('filter-form').reset(); priceRangeSlider.value = priceRangeSlider.max; priceRangeValue.textContent = formatCurrency(priceRangeSlider.max); renderProducts(products); filterModal.hide(); });
    document.getElementById('save-customer-btn').addEventListener('click', saveNewCustomer);

    // Sự kiện cho thanh toán
    paymentBtn.addEventListener('click', () => {
        if (cart.length === 0) { showToast('Giỏ hàng trống', 'Vui lòng thêm sản phẩm trước.', false); return; }
        const total = updateTotals();
        modalPaymentTotalEl.textContent = formatCurrency(total);
        
        paymentMethodOptions.querySelector('.active').classList.remove('active');
        paymentMethodOptions.querySelector('[data-method="cash"]').classList.add('active');
        cashPaymentFields.classList.remove('d-none');
        qrPaymentFields.classList.add('d-none');
        cashReceivedInput.value = '';
        cashChangeEl.textContent = formatCurrency(0);
        
        paymentModal.show();
    });
    
    paymentMethodOptions.addEventListener('click', function(e) {
        const selectedMethodCard = e.target.closest('.payment-method-card');
        if (!selectedMethodCard || selectedMethodCard.classList.contains('active')) return;

        this.querySelector('.active').classList.remove('active');
        selectedMethodCard.classList.add('active');

        const method = selectedMethodCard.dataset.method;
        const total = updateTotals();
        const orderId = 'HD' + Date.now().toString().slice(-6);

        if (method === 'cash') {
            cashPaymentFields.classList.remove('d-none');
            qrPaymentFields.classList.add('d-none');
        } else {
            cashPaymentFields.classList.add('d-none');
            qrPaymentFields.classList.remove('d-none');
            let qrApiUrl = '';
            if (method === 'qr_bank') { qrApiUrl = `https://api.vietqr.io/image/970436-0987654321-y3IqN2.jpg?accountName=TRAN%20MINH%20ADMIN&amount=${Math.round(total)}&addInfo=Thanh toan ${orderId}`; }
            else if (method === 'qr_momo') { qrApiUrl = 'https://i.imgur.com/g27v2Kj.png'; } 
            else if (method === 'qr_zalopay') { qrApiUrl = 'https://i.imgur.com/y2p3i5E.png'; }
            qrCodeImage.src = qrApiUrl;
        }
    });

    cashReceivedInput.addEventListener('input', function() {
        const total = updateTotals();
        const received = parseFloat(this.value) || 0;
        const change = received - total;
        cashChangeEl.textContent = formatCurrency(change > 0 ? change : 0);
    });

    confirmPaymentBtn.addEventListener('click', finishAndPrint);

    // =======================================
    // KHỞI CHẠY LẦN ĐẦU
    // =======================================
    function initialize() {
        priceRangeSlider.value = priceRangeSlider.max;
        priceRangeValue.textContent = formatCurrency(priceRangeSlider.max);
        populateFilterOptions();
        renderProducts(products);
        renderCart();
    }

    initialize();
});