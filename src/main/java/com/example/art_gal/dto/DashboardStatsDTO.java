package com.example.art_gal.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DashboardStatsDTO {
    private long totalExportOrders;
    private BigDecimal totalRevenue;
    private long totalInventory;
    private BigDecimal totalProfit;
}