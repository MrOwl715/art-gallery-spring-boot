package com.example.art_gal.controller;

import com.example.art_gal.dto.ChartDataDTO;
import com.example.art_gal.dto.DashboardStatsDTO;
import com.example.art_gal.service.DashboardService;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PreAuthorize("hasRole('MANAGER')")
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStatsDTO getStats() {
        return dashboardService.getDashboardStats();
    }

    @GetMapping("/charts/weekly-revenue")
    public ChartDataDTO<BigDecimal> getWeeklyRevenue() {
        return dashboardService.getWeeklyRevenueChart();
    }
    @GetMapping("/charts/daily-revenue")
    public ChartDataDTO<BigDecimal> getDailyRevenue() {
        return dashboardService.getDailyRevenueChart();
    }

    @GetMapping("/charts/monthly-revenue")
    public ChartDataDTO<BigDecimal> getMonthlyRevenue() {
        return dashboardService.getMonthlyRevenueChart();
    }

    @GetMapping("/charts/yearly-revenue")
    public ChartDataDTO<BigDecimal> getYearlyRevenue() {
        return dashboardService.getYearlyRevenueChart();
    }

     @GetMapping("/charts/proportion-by-category")
    public ChartDataDTO<Long> getProportionByCategory() {
        return dashboardService.getProportionChartByCategory();
    }
}