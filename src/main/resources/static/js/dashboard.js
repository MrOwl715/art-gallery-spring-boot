document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // =======================================
    // CSDL MẪU
    // =======================================
    const kpiData = { 
        totalOrders: 31862, 
        totalRevenue: 1380000000, 
        inventory: 450, 
        profit: 517500000 
    };
    const salesData = {
        day: { labels: ['Sáng', 'Trưa', 'Chiều', 'Tối'], data: [2.5, 3.0, 5.5, 1.55] },
        week: { labels: ['Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'CN'], data: [8.5, 11.2, 9.8, 14.5, 12.0, 15.3, 12.55] },
        month: { labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'], data: [45, 60, 55, 72] },
        year: { labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'], data: [250, 310, 290, 400] },
    };
    const proportionData = {
        category: { 
            labels: ['Sơn dầu', 'Trừu tượng', 'Sơn mài', 'Phong cảnh'], 
            data: [45, 25, 15, 15] 
        },
        material: { 
            labels: ['Sơn dầu', 'Lụa', 'Màu nước', 'Sơn mài'], 
            data: [50, 20, 18, 12] 
        }
    };
    
    // =======================================
    // BIẾN VÀ LẤY PHẦN TỬ DOM
    // =======================================
    let salesChart, proportionChart;
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const salesChartFilter = document.getElementById('sales-chart-filter');
    const proportionChartFilter = document.getElementById('proportion-chart-filter');
    const reportTypeSelect = document.getElementById('report-type');
    const dateRangeWrapper = document.getElementById('date-range-wrapper');
    const downloadReportBtn = document.getElementById('download-report-btn');

    // =======================================
    // CÁC HÀM TIỆN ÍCH
    // =======================================
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // =======================================
    // CÁC HÀM RENDER
    // =======================================
    function renderKPIs() {
        document.getElementById('kpi-total-orders').textContent = kpiData.totalOrders.toLocaleString('vi-VN');
        document.getElementById('kpi-total-revenue').textContent = formatCurrency(kpiData.totalRevenue);
        document.getElementById('kpi-inventory').textContent = kpiData.inventory.toLocaleString('vi-VN');
        document.getElementById('kpi-profit').textContent = formatCurrency(kpiData.profit);
    }

    function createCharts() {
        const salesCtx = document.getElementById('salesChart').getContext('2d');
        salesChart = new Chart(salesCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{ label: 'Doanh thu (triệu VND)', data: [], backgroundColor: 'rgba(249, 123, 34, 0.7)', borderRadius: 5 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (value) => `${value}tr` } }, x: { grid: { display: false } } } }
        });

        const proportionCtx = document.getElementById('proportionChart').getContext('2d');
        proportionChart = new Chart(proportionCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{ data: [], borderWidth: 0, backgroundColor: ['#fd7e14', '#20c997', '#0dcaf0', '#6c757d', '#ffc107'] }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 15 } } } }
        });
    }

    function updateSalesChart(period) {
        const data = salesData[period];
        if (!data || !salesChart) return;
        salesChart.data.labels = data.labels;
        salesChart.data.datasets[0].data = data.data;
        salesChart.update();
    }

    function updateProportionChart(type) {
        const data = proportionData[type];
        if (!data || !proportionChart) return;
        proportionChart.data.labels = data.labels;
        proportionChart.data.datasets[0].data = data.data;
        proportionChart.update();
    }

    // =======================================
    // GẮN CÁC SỰ KIỆN
    // =======================================
    if(sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => mainContainer.classList.toggle('sidebar-collapsed'));
    }

    salesChartFilter.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('active')) {
            this.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            updateSalesChart(e.target.dataset.period);
        }
    });

    proportionChartFilter.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('active')) {
            this.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            updateProportionChart(e.target.dataset.type);
        }
    });
    
    reportTypeSelect.addEventListener('change', function() {
        dateRangeWrapper.classList.toggle('d-none', this.value !== 'revenue_by_time');
    });

    // === CẬP NHẬT LOGIC CHO NÚT XUẤT BÁO CÁO ===
    downloadReportBtn.addEventListener('click', function() {
        const reportType = reportTypeSelect.value;
        let reportData;

        // Mô phỏng việc tạo dữ liệu báo cáo dựa trên lựa chọn của người dùng
        if (reportType === 'revenue_by_time') {
            reportData = {
                title: 'BÁO CÁO DOANH THU THEO THỜI GIAN',
                dateRange: `Từ 01/06/2025 đến 28/06/2025`,
                headers: ['Ngày', 'Số đơn hàng', 'Giảm giá', 'Doanh thu'],
                rows: [
                    ['27/06/2025', '5', '0₫', '8,500,000₫'],
                    ['28/06/2025', '8', '500,000₫', '12,550,000₫']
                ],
                summary: [
                    { label: 'Tổng số đơn hàng:', value: '13' },
                    { label: 'Tổng doanh thu:', value: '21,050,000₫' }
                ]
            };
        } else if (reportType === 'inventory_report') {
            reportData = {
                title: 'BÁO CÁO TỒN KHO',
                dateRange: `Tính đến ngày ${new Date().toLocaleDateString('vi-VN')}`,
                headers: ['Mã SP', 'Tên sản phẩm', 'Thể loại', 'Số lượng tồn'],
                rows: [
                    ['p1', 'Chiều hoàng hôn', 'Phong cảnh', '5'],
                    ['p2', 'Mảnh ghép', 'Trừu tượng', '3'],
                    ['p6', 'Sen hạ', 'Sơn mài', '1']
                ],
                summary: [
                    { label: 'Tổng số loại sản phẩm:', value: '3' },
                    { label: 'Tổng số lượng tồn:', value: '9' }
                ]
            };
        } else { // 'revenue_overview'
             reportData = {
                title: 'BÁO CÁO TỔNG QUAN DOANH THU',
                dateRange: `Tháng 06/2025`,
                headers: ['Khoản mục', 'Giá trị'],
                rows: [
                    ['Tổng doanh thu', '150,000,000₫'],
                    ['Tổng giá vốn', '80,000,000₫'],
                    ['Lợi nhuận gộp', '70,000,000₫']
                ],
                summary: [
                    { label: 'Tỷ suất lợi nhuận:', value: '46.67%' }
                ]
            };
        }

        // Lưu dữ liệu vào localStorage và mở trang in
        localStorage.setItem('reportDataForPrint', JSON.stringify(reportData));
        window.open('bao-cao-in.html', '_blank');
        
        // Đóng modal
        const exportModal = bootstrap.Modal.getInstance(document.getElementById('exportReportModal'));
        exportModal.hide();
    });
    
    // =======================================
    // KHỞI CHẠY LẦN ĐẦU
    // =======================================
    function initialize() {
        renderKPIs();
        createCharts();
        updateSalesChart('week'); // Mặc định hiển thị theo tuần
        updateProportionChart('category'); // Mặc định hiển thị theo thể loại
    }
    
    initialize();
});