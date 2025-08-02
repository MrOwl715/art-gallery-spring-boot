package com.example.art_gal.repository;

import com.example.art_gal.entity.ExportOrderDetail;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ExportOrderDetailRepository extends JpaRepository<ExportOrderDetail, Long> {
    @Query("SELECT p.category.name, SUM(d.quantity) FROM ExportOrderDetail d JOIN d.painting p JOIN d.exportOrder e WHERE e.status = 'COMPLETED' GROUP BY p.category.name ORDER BY SUM(d.quantity) DESC")
    List<Object[]> findSalesCountByCategory();
}