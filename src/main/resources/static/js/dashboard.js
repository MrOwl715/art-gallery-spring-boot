document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // --- CẤU HÌNH API ---
    const API_BASE_URL = '/api';
    const token = localStorage.getItem('accessToken');

    // --- BIẾN VÀ LẤY PHẦN TỬ DOM ---
    let salesChart, proportionChart;

    const salesChartFilter = document.getElementById('sales-chart-filter');
    const reportTypeSelect = document.getElementById('report-type');
    const downloadReportBtn = document.getElementById('download-report-btn');
    const activityLogList = document.getElementById('activity-log-list');

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
    
    // --- HÀM MỚI: RENDER ACTIVITY LOG ---
    function renderActivityLogs(logs) {
        activityLogList.innerHTML = ''; // Xóa nội dung cũ
        if (!logs || logs.length === 0) {
            activityLogList.innerHTML = '<div class="list-group-item text-muted text-center small p-3">Không có hoạt động nào gần đây.</div>';
            return;
        }

        // Chỉ hiển thị 5 hoạt động gần nhất
        logs.slice(0, 5).forEach(log => {
            const logItem = document.createElement('a');
            logItem.href = "#";
            logItem.className = 'list-group-item list-group-item-action';
            
            const timeAgo = moment(log.createdAt).fromNow(); // Sử dụng moment.js để hiển thị "cách đây..."

            logItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1 small">${log.action}</h6>
                    <small class="text-muted">${timeAgo}</small>
                </div>
                <p class="mb-1 small text-muted">${log.details}</p>
                <small class="text-muted">Bởi: ${log.actor}</small>
            `;
            activityLogList.appendChild(logItem);
        });
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

        // Biểu đồ Tỷ lệ bán chạy
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

    // --- HÀM XỬ LÝ TẢI BÁO CÁO ---
    async function handleDownloadReport() {
        const reportType = reportTypeSelect.value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (!reportType) {
            alert("Vui lòng chọn loại báo cáo.");
            return;
        }

        let url = `${API_BASE_URL}/reports/download?type=${reportType}`;

        // Nếu là báo cáo theo thời gian, thêm tham số ngày
        if (reportType === 'revenue_by_time') {
            if (!startDate || !endDate) {
                alert("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.");
                return;
            }
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Tạo báo cáo thất bại.');
            }

            const blob = await response.blob();
            const contentDisposition = response.headers.get('content-disposition');
            let filename = "report.xlsx";
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                if (filenameMatch && filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }
            
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error('Lỗi khi tải báo cáo:', error);
            alert('Không thể tải báo cáo. Vui lòng thử lại.');
        }
    }

    // --- HÀM XỬ LÝ HIỂN THỊ Ô CHỌN NGÀY ---
    function toggleDateRangePicker() {
        const reportType = reportTypeSelect.value;
        const dateRangeWrapper = document.getElementById('date-range-wrapper');
        if (reportType === 'revenue_by_time') {
            dateRangeWrapper.classList.remove('d-none');
        } else {
            dateRangeWrapper.classList.add('d-none');
        }
    }

    // --- KHỞI CHẠY LẦN ĐẦU ---
    async function initialize() {
        try {
            const [stats, weeklyRevenue, proportionData, activityLogs] = await Promise.all([
                fetchApi('/dashboard/stats'),
                fetchApi('/dashboard/charts/weekly-revenue'),
                fetchApi('/dashboard/charts/proportion-by-category'),
                fetchApi('/activity-logs') // Tải activity logs
            ]);
            
            renderKPIs(stats);
            createCharts();
            updateSalesChart(weeklyRevenue);
            updateProportionChart(proportionData);
            renderActivityLogs(activityLogs); // Render activity logs

        } catch(error) {
            if (error.message !== 'Unauthorized') {
                console.error("Lỗi tải dữ liệu dashboard:", error);
                alert("Không thể tải dữ liệu thống kê cho trang Tổng quan.");
            }
        }
    }
    
    // --- GẮN CÁC SỰ KIỆN ---
    if (salesChartFilter) {
        salesChartFilter.addEventListener('click', function(e) {
            const targetButton = e.target.closest('button');
            if (targetButton && !targetButton.classList.contains('active')) {
                this.querySelector('.active').classList.remove('active');
                targetButton.classList.add('active');
                const period = targetButton.dataset.period;
                const apiPeriod = { day: 'daily', week: 'weekly', month: 'monthly', year: 'yearly' }[period];
                if(apiPeriod) {
                    handleSalesChartFilter(apiPeriod);
                }
            }
        });
    }

    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', handleDownloadReport);
    }
    
    if (reportTypeSelect) {
        reportTypeSelect.addEventListener('change', toggleDateRangePicker);
    }
    
    initialize();
});

// Thêm thư viện moment.js để format thời gian
// Bạn cần thêm dòng này vào cuối file index.html, trước thẻ </body>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/locale/vi.js"></script>
// <script>moment.locale('vi');</script>