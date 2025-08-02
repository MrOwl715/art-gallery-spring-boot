document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // --- CẤU HÌNH API & BIẾN TOÀN CỤC ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    let allPaintings = [];
    let allCategories = [];
    let allCustomers = [];
    let allPaymentMethods = [];
    let cart = [];
    const TAX_RATE = 0;
    let currentTotal = 0;

    // --- LẤY CÁC PHẦN TỬ DOM ---
    const productGrid = document.getElementById('product-grid');
    const genreFilters = document.getElementById('genre-filters');
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalAmountEl = document.getElementById('subtotal-amount');
    const taxAmountEl = document.getElementById('tax-amount');
    const totalAmountEl = document.getElementById('total-amount');
    const customerSelect = document.getElementById('customer-select');
    const paymentMethodOptions = document.getElementById('payment-method-options');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    const addCustomerModal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    const saveCustomerBtn = document.getElementById('save-customer-btn');

    // --- DOM CHO SIDEBAR VÀ THANH TOÁN TIỀN MẶT ---
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const cashReceivedInput = document.getElementById('cash-received');
    const cashChangeEl = document.getElementById('cash-change');
    const cashPaymentFields = document.getElementById('cash-payment-fields');
    const qrPaymentFields = document.getElementById('qr-payment-fields');
    const qrCodeImage = document.getElementById('qr-code-image');

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

    // --- CÁC HÀM TIỆN ÍCH ---
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // --- CÁC HÀM RENDER ---
    function renderPaintings(paintingsToRender) {
        productGrid.innerHTML = '';
        if (paintingsToRender.length === 0) {
            productGrid.innerHTML = '<p class="col-12 text-muted text-center mt-5">Không tìm thấy sản phẩm nào.</p>';
            return;
        }
        paintingsToRender.forEach(product => {
            const card = document.createElement('div');
            card.className = 'col-12 col-sm-6 col-lg-4 col-xl-3';
            card.innerHTML = `
                <div class="card h-100 product-card" data-id="${product.id}">
                    <img src="${product.imageUrl || 'https://placehold.co/400x300'}" class="card-img-top" alt="${product.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted small">SL: ${product.quantity}</p>
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <span class="price">${formatCurrency(product.sellingPrice)}</span>
                            
                        </div>
                        <button class="btn btn-primary btn-sm add-to-cart-btn btn-icon" data-id="${product.id}" title="Thêm vào giỏ hàng" ${product.quantity === 0 ? 'disabled' : ''}>
                                <i class="bi bi-cart-plus"></i>
                            </button>
                    </div>
                </div>`;
            productGrid.appendChild(card);
        });
    }

    function renderCategoryFilters(categories) {
        genreFilters.innerHTML = '<li class="nav-item"><a class="nav-link active" href="#" data-category-id="all">Tất cả</a></li>';
        categories.forEach(category => {
            if(category.status) {
                 genreFilters.innerHTML += `<li class="nav-item"><a class="nav-link" href="#" data-category-id="${category.id}">${category.name}</a></li>`;
            }
        });
    }
    
    function renderCustomerDropdown(customers) {
        customerSelect.innerHTML = '<option value="" selected>Khách lẻ</option>';
        customers.forEach(customer => {
            if (customer.status) {
                 customerSelect.innerHTML += `<option value="${customer.id}">${customer.name} - ${customer.phone || ''}</option>`;
            }
        });
    }
    
    function renderPaymentMethods(methods) {
        paymentMethodOptions.innerHTML = '';
        methods.forEach((method, index) => {
             if (method.status) {
                let iconHtml = '<i class="bi bi-credit-card fs-2"></i>';
                if (method.method.toLowerCase().includes('tiền mặt')) {
                    iconHtml = '<i class="bi bi-cash-coin fs-2"></i>';
                } else if (method.qrCodeImageUrl) {
                    iconHtml = `<img src="${method.qrCodeImageUrl}" height="32" alt="${method.method}">`;
                }

                paymentMethodOptions.innerHTML += `
                    <div class="col">
                        <div class="payment-method-card p-2 border rounded ${index === 0 ? 'active' : ''}" data-id="${method.id}">
                            ${iconHtml}
                            <div class="small mt-1">${method.method}</div>
                        </div>
                    </div>`;
             }
        });
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="text-center text-muted mt-5"><i class="bi bi-basket2 fs-1"></i><p>Chưa có sản phẩm</p></div>`;
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item d-flex align-items-center py-2 border-bottom';
                itemElement.innerHTML = `
                    <div class="flex-grow-1 me-2">
                        <div class="fw-bold small">${item.name}</div>
                        <div class="text-muted small">${formatCurrency(item.sellingPrice)} x ${item.quantity}</div>
                    </div>
                    <strong class="me-3">${formatCurrency(item.sellingPrice * item.quantity)}</strong>
                    <button class="btn btn-sm btn-outline-danger remove-from-cart-btn" data-id="${item.id}">&times;</button>`;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        updateTotals();
    }

    // --- CÁC HÀM XỬ LÝ LOGIC ---
    const updateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
        const tax = subtotal * TAX_RATE;
        currentTotal = subtotal + tax;
        subtotalAmountEl.textContent = formatCurrency(subtotal);
        taxAmountEl.textContent = formatCurrency(tax);
        totalAmountEl.textContent = formatCurrency(currentTotal);
        document.getElementById('modal-payment-total').textContent = formatCurrency(currentTotal);
    };

    function calculateChange() {
        const cashReceived = parseFloat(cashReceivedInput.value);
        if (isNaN(cashReceived) || cashReceived < currentTotal) {
            cashChangeEl.textContent = formatCurrency(0);
            return;
        }
        const change = cashReceived - currentTotal;
        cashChangeEl.textContent = formatCurrency(change);
    }

    function handlePaymentMethodChange(selectedCard) {
        if (!selectedCard) return;

        const currentActive = paymentMethodOptions.querySelector('.active');
        if (currentActive) currentActive.classList.remove('active');
        selectedCard.classList.add('active');

        const methodId = selectedCard.dataset.id;
        const method = allPaymentMethods.find(m => m.id == methodId);

        if (method && method.method.toLowerCase().includes('tiền mặt')) {
            cashPaymentFields.classList.remove('d-none');
            qrPaymentFields.classList.add('d-none');
            cashReceivedInput.value = '';
            cashChangeEl.textContent = formatCurrency(0);
        } else {
            cashPaymentFields.classList.add('d-none');
            qrPaymentFields.classList.remove('d-none');
            qrCodeImage.src = method ? (method.qrCodeImageUrl || '') : '';
        }
    }

    function handleAddToCart(productId) {
        const productInStock = allPaintings.find(p => p.id == productId);
        if (!productInStock || productInStock.quantity <= 0) {
            alert('Sản phẩm đã hết hàng.');
            return;
        }
        const itemInCart = cart.find(item => item.id == productId);
        if (itemInCart) {
            if (itemInCart.quantity < productInStock.quantity) {
                itemInCart.quantity++;
            } else {
                alert('Đã đạt số lượng tồn kho tối đa cho sản phẩm này.');
            }
        } else {
            cart.push({ ...productInStock, quantity: 1 });
        }
        renderCart();
    }
    
    const handleRemoveFromCart = (productId) => {
        cart = cart.filter(item => item.id != productId);
        renderCart();
    };

    async function handleSaveNewCustomer() {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        if (!name) {
            alert('Vui lòng nhập họ tên khách hàng.');
            return;
        }
        
        try {
            const newCustomerData = { name: name, phone: phone, status: true };
            const newCustomer = await fetchApi('/customers', {
                method: 'POST',
                body: JSON.stringify(newCustomerData)
            });

            allCustomers = await fetchApi('/customers');
            renderCustomerDropdown(allCustomers);
            customerSelect.value = newCustomer.id;

            addCustomerModal.hide();
            document.getElementById('add-customer-form').reset();
            alert(`Đã thêm khách hàng "${name}" thành công.`);
        } catch (error) {
            alert(`Lỗi khi thêm khách hàng: ${error.message}`);
        }
    }
    
    async function handleConfirmPayment() {
        if (cart.length === 0) { alert('Giỏ hàng trống!'); return; }
        const selectedCustomer = customerSelect.value;
        if (!selectedCustomer) { alert('Vui lòng chọn khách hàng.'); return; }
        const selectedPaymentMethodCard = paymentMethodOptions.querySelector('.active');
        if (!selectedPaymentMethodCard) { alert('Vui lòng chọn phương thức thanh toán.'); return; }
        
        const methodId = selectedPaymentMethodCard.dataset.id;
        const method = allPaymentMethods.find(m => m.id == methodId);

        if (method && method.method.toLowerCase().includes('tiền mặt')) {
            const cashReceived = parseFloat(cashReceivedInput.value);
            if (isNaN(cashReceived) || cashReceived < currentTotal) {
                alert('Số tiền khách đưa không đủ hoặc không hợp lệ.');
                return;
            }
        }

        const orderData = {
            customerId: selectedCustomer,
            paymentMethodId: methodId,
            orderDetails: cart.map(item => ({ paintingId: item.id, quantity: item.quantity }))
        };
        
        try {
            const createdOrder = await fetchApi('/export-orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });

            alert('Tạo đơn hàng thành công!');
            
            const subtotal = createdOrder.totalAmount / (1 + TAX_RATE);
            const tax = createdOrder.totalAmount - subtotal;
            const dataForPrint = {
                id: createdOrder.id,
                date: new Date(createdOrder.orderDate).toLocaleString('vi-VN'),
                items: createdOrder.orderDetails.map(detail => ({
                    name: detail.paintingName,
                    quantity: detail.quantity,
                    price: detail.price
                })),
                subtotal: subtotal,
                tax: tax,
                total: createdOrder.totalAmount
            };

            localStorage.setItem('currentOrderForPrint', JSON.stringify(dataForPrint));
            window.open('hoa-don.html', '_blank', 'width=350,height=600');

            paymentModal.hide();
            cart = [];
            renderCart();
            loadInitialData();

        } catch (error) {
            alert(`Lỗi tạo đơn hàng: ${error.message}`);
        }
    }
    
    // --- KHỞI CHẠY & GẮN SỰ KIỆN ---
    async function loadInitialData() {
        try {
            [allPaintings, allCategories, allCustomers, allPaymentMethods] = await Promise.all([
                fetchApi('/paintings'),
                fetchApi('/categories'),
                fetchApi('/customers'),
                fetchApi('/payment-methods')
            ]);
            
            renderPaintings(allPaintings.filter(p => p.status === 'FOR_SALE' && p.quantity > 0));
            renderCategoryFilters(allCategories);
            renderCustomerDropdown(allCustomers);
            renderPaymentMethods(allPaymentMethods);

            handlePaymentMethodChange(paymentMethodOptions.querySelector('.payment-method-card'));

        } catch (error) {
            console.error("Lỗi tải dữ liệu ban đầu:", error);
            alert("Không thể tải dữ liệu cần thiết cho trang bán hàng.");
        }
    }

    // Gắn sự kiện
    productGrid.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (addToCartBtn) handleAddToCart(addToCartBtn.dataset.id);
    });
    cartItemsContainer.addEventListener('click', (e) => {
        const removeFromCartBtn = e.target.closest('.remove-from-cart-btn');
        if (removeFromCartBtn) handleRemoveFromCart(removeFromCartBtn.dataset.id);
    });
    genreFilters.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.closest('.nav-link');
        if (target) {
            genreFilters.querySelector('.active').classList.remove('active');
            target.classList.add('active');
            const categoryId = target.dataset.categoryId;
            const filteredPaintings = categoryId === 'all' 
                ? allPaintings.filter(p => p.status === 'FOR_SALE' && p.quantity > 0)
                : allPaintings.filter(p => p.categoryId == categoryId && p.status === 'FOR_SALE' && p.quantity > 0);
            renderPaintings(filteredPaintings);
        }
    });

    paymentMethodOptions.addEventListener('click', (e) => {
        const selectedCard = e.target.closest('.payment-method-card');
        handlePaymentMethodChange(selectedCard);
    });

    cashReceivedInput.addEventListener('input', calculateChange);
    confirmPaymentBtn.addEventListener('click', handleConfirmPayment);
    saveCustomerBtn.addEventListener('click', handleSaveNewCustomer);
    
    // --- PHẦN CODE BỊ THIẾU ĐƯỢC THÊM LẠI ---
    if (sidebarToggleBtn && mainContainer) {
        sidebarToggleBtn.addEventListener('click', () => {
            mainContainer.classList.toggle('sidebar-collapsed');
        });
    }
    
    // --- KHỞI CHẠY ---
    loadInitialData();
});