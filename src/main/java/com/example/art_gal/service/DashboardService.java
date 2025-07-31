package com.example.art_gal.service;

import com.example.art_gal.dto.ChartDataDTO;
import com.example.art_gal.dto.DashboardStatsDTO;
import com.example.art_gal.repository.ExportOrderDetailRepository;
import com.example.art_gal.repository.ExportOrderRepository;
import com.example.art_gal.repository.PaintingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private ExportOrderRepository exportOrderRepository;

    @Autowired
    private ExportOrderDetailRepository exportOrderDetailRepository; // Thêm repo này

    @Autowired
    private PaintingRepository paintingRepository;

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // Tổng đơn hàng
        stats.setTotalExportOrders(exportOrderRepository.count());

        // Tổng doanh thu từ các đơn hàng đã hoàn thành
        BigDecimal totalRevenue = exportOrderRepository.sumTotalRevenue();
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        // Tổng tồn kho
        Long totalInventory = paintingRepository.sumInventoryQuantity();
        stats.setTotalInventory(totalInventory != null ? totalInventory : 0L);

        // Tính lợi nhuận
        BigDecimal totalCost = exportOrderRepository.sumTotalCostOfGoodsSold();
        if (totalRevenue != null && totalCost != null) {
            stats.setTotalProfit(totalRevenue.subtract(totalCost));
        } else {
            stats.setTotalProfit(BigDecimal.ZERO);
        }

        return stats;
    }
    // --- Biểu đồ doanh thu theo NGÀY (24 giờ qua) ---
    public ChartDataDTO<BigDecimal> getDailyRevenueChart() {
    LocalDateTime endDate = LocalDateTime.now();
    LocalDateTime startDate = endDate.minusHours(23);

    // Gọi đúng phương thức lấy dữ liệu theo giờ
    List<Object[]> results = exportOrderRepository.findHourlyRevenueByDateRange(startDate, endDate);
    
    Map<Integer, BigDecimal> revenueMap = new HashMap<>();
    for (Object[] result : results) {
        // Kết quả trả về trực tiếp là GIỜ (Integer) và Doanh thu (BigDecimal)
        revenueMap.put((Integer) result[0], (BigDecimal) result[1]);
    }

    List<String> labels = new ArrayList<>();
    List<BigDecimal> data = new ArrayList<>();
    
    // Tạo nhãn và dữ liệu cho 24 giờ qua
    for (int i = 0; i < 24; i++) {
        LocalDateTime currentHour = startDate.withMinute(0).withSecond(0).plusHours(i);
        labels.add(String.format("%02d:00", currentHour.getHour()));
        data.add(revenueMap.getOrDefault(currentHour.getHour(), BigDecimal.ZERO));
    }
    
    return new ChartDataDTO<>(labels, data);
}

    public ChartDataDTO<BigDecimal> getWeeklyRevenueChart() {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(6); // Lấy dữ liệu 7 ngày gần nhất

        List<Object[]> results = exportOrderRepository.findRevenueByDateRange(startDate, endDate);
        
        List<String> labels = new ArrayList<>();
        List<BigDecimal> data = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");

        // Tạo một map để dễ dàng truy xuất doanh thu theo ngày
        java.util.Map<LocalDate, BigDecimal> revenueMap = new java.util.HashMap<>();
        for (Object[] result : results) {
            java.sql.Date date = (java.sql.Date) result[0];
            BigDecimal revenue = (BigDecimal) result[1];
            revenueMap.put(date.toLocalDate(), revenue);
        }

        // Điền dữ liệu cho 7 ngày, kể cả những ngày không có doanh thu
        for (int i = 0; i < 7; i++) {
            LocalDate currentDay = startDate.toLocalDate().plusDays(i);
            labels.add(currentDay.format(formatter));
            data.add(revenueMap.getOrDefault(currentDay, BigDecimal.ZERO));
        }

        return new ChartDataDTO<>(labels, data);
    }

    // --- Biểu đồ doanh thu theo THÁNG (12 tháng trong năm nay) ---
    public ChartDataDTO<BigDecimal> getMonthlyRevenueChart() {
        int currentYear = LocalDate.now().getYear();
        List<Object[]> results = exportOrderRepository.findMonthlyRevenueByYear(currentYear);
        Map<Integer, BigDecimal> revenueMap = new HashMap<>();
        for (Object[] result : results) {
            revenueMap.put((Integer) result[1], (BigDecimal) result[2]);
        }

        List<String> labels = new ArrayList<>();
        List<BigDecimal> data = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            labels.add("Th " + i);
            data.add(revenueMap.getOrDefault(i, BigDecimal.ZERO));
        }
        return new ChartDataDTO<>(labels, data);
    }
    
    // --- Biểu đồ doanh thu theo NĂM ---
    public ChartDataDTO<BigDecimal> getYearlyRevenueChart() {
        List<Object[]> results = exportOrderRepository.findYearlyRevenue();
        List<String> labels = new ArrayList<>();
        List<BigDecimal> data = new ArrayList<>();
        for (Object[] result : results) {
            labels.add(((Integer) result[0]).toString());
            data.add((BigDecimal) result[1]);
        }
        return new ChartDataDTO<>(labels, data);
    }

    public ChartDataDTO<Long> getProportionChartByCategory() {
        List<Object[]> results = exportOrderDetailRepository.findSalesCountByCategory();
        
        List<String> labels = new ArrayList<>();
        List<Long> data = new ArrayList<>();
        
        for (Object[] result : results) {
            labels.add((String) result[0]);
            data.add((Long) result[1]);
        }
        
        return new ChartDataDTO<>(labels, data);
    }
}