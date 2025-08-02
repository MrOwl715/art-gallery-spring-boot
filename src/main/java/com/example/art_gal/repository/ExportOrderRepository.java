package com.example.art_gal.repository;

import com.example.art_gal.entity.ExportOrder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ExportOrderRepository extends JpaRepository<ExportOrder, Long> {
    @Query("SELECT SUM(e.totalAmount) FROM ExportOrder e WHERE e.status = 'COMPLETED'")
    BigDecimal sumTotalRevenue();

    @Query("SELECT SUM(d.quantity * p.importPrice) FROM ExportOrder e JOIN e.orderDetails d JOIN d.painting p WHERE e.status = 'COMPLETED'")
    BigDecimal sumTotalCostOfGoodsSold();

    @Query("SELECT FUNCTION('DATE', e.orderDate), SUM(e.totalAmount) FROM ExportOrder e WHERE e.orderDate BETWEEN :startDate AND :endDate AND e.status = 'COMPLETED' GROUP BY FUNCTION('DATE', e.orderDate) ORDER BY FUNCTION('DATE', e.orderDate)")
    List<Object[]> findRevenueByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT FUNCTION('YEAR', e.orderDate), FUNCTION('MONTH', e.orderDate), SUM(e.totalAmount) FROM ExportOrder e WHERE FUNCTION('YEAR', e.orderDate) = :year AND e.status = 'COMPLETED' GROUP BY FUNCTION('YEAR', e.orderDate), FUNCTION('MONTH', e.orderDate) ORDER BY FUNCTION('MONTH', e.orderDate)")
    List<Object[]> findMonthlyRevenueByYear(int year);

    @Query("SELECT FUNCTION('YEAR', e.orderDate), SUM(e.totalAmount) FROM ExportOrder e WHERE e.status = 'COMPLETED' GROUP BY FUNCTION('YEAR', e.orderDate) ORDER BY FUNCTION('YEAR', e.orderDate)")
    List<Object[]> findYearlyRevenue();

    @Query("SELECT FUNCTION('HOUR', e.orderDate), SUM(e.totalAmount) FROM ExportOrder e WHERE e.orderDate BETWEEN :startDate AND :endDate AND e.status = 'COMPLETED' GROUP BY FUNCTION('HOUR', e.orderDate) ORDER BY FUNCTION('HOUR', e.orderDate)")
    List<Object[]> findHourlyRevenueByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    List<ExportOrder> findByCustomerId(Long customerId);
    
    @Query("SELECT e FROM ExportOrder e WHERE e.status = 'COMPLETED' AND FUNCTION('DATE', e.orderDate) BETWEEN :startDate AND :endDate ORDER BY e.orderDate ASC")
    List<ExportOrder> findCompletedOrdersByDateRange(LocalDate startDate, LocalDate endDate);

}