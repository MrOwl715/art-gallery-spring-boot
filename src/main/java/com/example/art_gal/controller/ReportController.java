package com.example.art_gal.controller;

import com.example.art_gal.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.Date;

@RestController
@PreAuthorize("hasRole('MANAGER')")
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping(value = "/download", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<InputStreamResource> downloadReport(
            @RequestParam("type") String type,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws IOException {
        
        ByteArrayInputStream in = null;
        String filename = "";
        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss");
        String currentDateTime = dateFormatter.format(new Date());

        if ("inventory_report".equalsIgnoreCase(type)) {
            in = reportService.generateInventoryReport();
            filename = "BaoCao_TonKho_" + currentDateTime + ".xlsx";
        } else if ("revenue_overview".equalsIgnoreCase(type)) {
            in = reportService.generateRevenueOverviewReport();
            filename = "BaoCao_TongQuanDoanhThu_" + currentDateTime + ".xlsx";
        } 
        // --- LOGIC MỚI ---
        else if ("revenue_by_time".equalsIgnoreCase(type)) {
            if (startDate == null || endDate == null) {
                return ResponseEntity.badRequest().body(null); // Yêu cầu phải có ngày
            }
            in = reportService.generateRevenueByTimeReport(startDate, endDate);
            filename = "BaoCao_DoanhThu_" + startDate + "_den_" + endDate + ".xlsx";
        } 
        else {
            return ResponseEntity.badRequest().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

}