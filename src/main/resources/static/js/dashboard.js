document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    // --- BIẾN VÀ LẤY PHẦN TỬ DOM ---
    let salesChart, proportionChart; // Thêm biến cho biểu đồ mới
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const mainContainer = document.querySelector('.main-container');
    const salesChartFilter = document.getElementById('sales-chart-filter');
    const proportionChartFilter = document.getElementById('proportion-chart-filter');
    const reportTypeSelect = document.getElementById('report-type');
    const dateRangeWrapper = document.getElementById('date-range-wrapper');
    const downloadReportBtn = document.getElementById('download-report-btn');


    // --- HÀM GỌI API CHUNG ---
    async function fetchApi(endpoint, options = {}) {
        if (!token) { window.location.href = '/dang-nhap.html'; return; }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers },
        });
        if (response.status === 401 || response.status === 403) { 
            window.location.href = '/dang-nhap.html'; 
            throw new Error('Unauthorized');
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Có lỗi xảy ra khi gọi API');
        }
        if (response.status === 204) return null;
        return response.json();
    }
    
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // --- CÁC HÀM RENDER ---
    function renderKPIs(kpiData) {
        if (!kpiData) return;
        document.getElementById('kpi-total-orders').textContent = (kpiData.totalExportOrders || 0).toLocaleString('vi-VN');
        document.getElementById('kpi-total-revenue').textContent = formatCurrency(kpiData.totalRevenue || 0);
        document.getElementById('kpi-inventory').textContent = (kpiData.totalInventory || 0).toLocaleString('vi-VN');
        document.getElementById('kpi-profit').textContent = formatCurrency(kpiData.totalProfit || 0);
    }

    function createCharts() {
        // Biểu đồ Doanh thu
        const salesCtx = document.getElementById('salesChart').getContext('2d');
        salesChart = new Chart(salesCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{ label: 'Doanh thu', data: [], backgroundColor: 'rgba(249, 123, 34, 0.7)', borderRadius: 5 }]
            },
            options: { 
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, 
                scales: { y: { beginAtZero: true, ticks: { callback: (value) => new Intl.NumberFormat('vi-VN').format(value) + '₫' } }, x: { grid: { display: false } } } 
            }
        });

        // --- BỔ SUNG: TẠO BIỂU ĐỒ TỶ LỆ BÁN CHẠY ---
        const proportionCtx = document.getElementById('proportionChart').getContext('2d');
        proportionChart = new Chart(proportionCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{ 
                    data: [], 
                    borderWidth: 0, 
                    backgroundColor: ['#fd7e14', '#20c997', '#0dcaf0', '#6c757d', '#ffc107', '#dc3545'] 
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { position: 'bottom', labels: { padding: 15 } } } 
            }
        });
    }

    function updateSalesChart(chartData) {
        if (!chartData || !salesChart) return;
        salesChart.data.labels = chartData.labels;
        salesChart.data.datasets[0].data = chartData.data;
        salesChart.update();
    }

    // --- BỔ SUNG: HÀM CẬP NHẬT BIỂU ĐỒ TỶ LỆ ---
    function updateProportionChart(chartData) {
        if (!chartData || !proportionChart) return;
        proportionChart.data.labels = chartData.labels;
        proportionChart.data.datasets[0].data = chartData.data;
        proportionChart.update();
    }
    
    // --- HÀM XỬ LÝ SỰ KIỆN ---
    async function handleSalesChartFilter(period) {
        try {
            const chartData = await fetchApi(`/dashboard/charts/${period}-revenue`);
            updateSalesChart(chartData);
        } catch(error) {
            if (error.message !== 'Unauthorized') {
                console.error(`Lỗi tải dữ liệu biểu đồ cho kỳ ${period}:`, error);
                alert(`Không thể tải dữ liệu biểu đồ cho kỳ ${period}.`);
            }
        }
    }

    // --- KHỞI CHẠY LẦN ĐẦU ---
    async function initialize() {
        if(sidebarToggleBtn && mainContainer) {
            sidebarToggleBtn.addEventListener('click', () => mainContainer.classList.toggle('sidebar-collapsed'));
        }

        try {
            // Tải song song tất cả các API ban đầu
            const [stats, weeklyRevenue, proportionData] = await Promise.all([
                fetchApi('/dashboard/stats'),
                fetchApi('/dashboard/charts/weekly-revenue'),
                fetchApi('/dashboard/charts/proportion-by-category') // API mới
            ]);
            
            renderKPIs(stats);
            createCharts(); // Tạo cả 2 biểu đồ
            updateSalesChart(weeklyRevenue);
            updateProportionChart(proportionData); // Cập nhật biểu đồ mới

        } catch(error) {
            if (error.message !== 'Unauthorized') {
                console.error("Lỗi tải dữ liệu dashboard:", error);
                alert("Không thể tải dữ liệu thống kê cho trang Tổng quan.");
            }
        }
    }
    
    // GẮN SỰ KIỆN CHO CÁC NÚT LỌC BIỂU ĐỒ
    if (salesChartFilter) {
        salesChartFilter.addEventListener('click', function(e) {
            const targetButton = e.target.closest('button');
            if (targetButton && !targetButton.classList.contains('active')) {
                this.querySelector('.active').classList.remove('active');
                targetButton.classList.add('active');
                const period = targetButton.dataset.period;
                
                let apiPeriod = period;
                if (period === 'day') apiPeriod = 'daily';
                if (period === 'week') apiPeriod = 'weekly';
                if (period === 'month') apiPeriod = 'monthly';
                if (period === 'year') apiPeriod = 'yearly';

                handleSalesChartFilter(apiPeriod);
            }
        });
    }
    
    // (Phần xử lý sự kiện cho bộ lọc của biểu đồ tỷ lệ sẽ được thêm sau nếu cần)

    initialize();
});