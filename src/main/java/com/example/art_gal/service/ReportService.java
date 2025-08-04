package com.example.art_gal.service;

import com.example.art_gal.dto.DashboardStatsDTO;
import com.example.art_gal.entity.ExportOrder;
import com.example.art_gal.entity.Painting;
import com.example.art_gal.repository.ExportOrderRepository;
import com.example.art_gal.repository.PaintingRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private PaintingRepository paintingRepository;

    @Autowired
    private ExportOrderRepository exportOrderRepository;

    public ByteArrayInputStream generateInventoryReport() throws IOException {
        String[] columns = {"ID", "Tên Tranh", "Giá Nhập", "Giá Bán", "Số Lượng Tồn", "Trạng Thái"};
        List<Painting> paintings = paintingRepository.findAll();

        try (
                XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream();
        ) {
            XSSFSheet sheet = workbook.createSheet("BaoCaoTonKho");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            // Header
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Data
            int rowIdx = 1;
            for (Painting painting : paintings) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(painting.getId());
                row.createCell(1).setCellValue(painting.getName());
                row.createCell(2).setCellValue(painting.getImportPrice().doubleValue());
                row.createCell(3).setCellValue(painting.getSellingPrice().doubleValue());
                row.createCell(4).setCellValue(painting.getQuantity());
                row.createCell(5).setCellValue(painting.getStatus().name());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream generateRevenueOverviewReport() throws IOException {
        DashboardStatsDTO stats = dashboardService.getDashboardStats();
        String[] columns = {"Chỉ Số", "Giá Trị"};

        try (
            XSSFWorkbook workbook = new XSSFWorkbook();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
        ) {
            XSSFSheet sheet = workbook.createSheet("TongQuanDoanhThu");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            Row row1 = sheet.createRow(1);
            row1.createCell(0).setCellValue("Tổng Đơn hàng");
            row1.createCell(1).setCellValue(stats.getTotalExportOrders());

            Row row2 = sheet.createRow(2);
            row2.createCell(0).setCellValue("Tổng Doanh thu");
            row2.createCell(1).setCellValue(stats.getTotalRevenue().doubleValue());
            
            Row row3 = sheet.createRow(3);
            row3.createCell(0).setCellValue("Tổng Tồn kho");
            row3.createCell(1).setCellValue(stats.getTotalInventory());

            Row row4 = sheet.createRow(4);
            row4.createCell(0).setCellValue("Lợi nhuận");
            row4.createCell(1).setCellValue(stats.getTotalProfit().doubleValue());

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream generateRevenueByTimeReport(LocalDate startDate, LocalDate endDate) throws IOException {
        String[] columns = {"ID Đơn Hàng", "Ngày Đặt", "Tên Khách Hàng", "Tổng Tiền"};
        List<ExportOrder> orders = exportOrderRepository.findCompletedOrdersByDateRange(startDate, endDate);

        try (
                XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream();
        ) {
            XSSFSheet sheet = workbook.createSheet("DoanhThuTheoThoiGian");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            // Header
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Data
            int rowIdx = 1;
            for (ExportOrder order : orders) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(order.getId());
                row.createCell(1).setCellValue(order.getOrderDate().toString());
                row.createCell(2).setCellValue(order.getCustomer().getName());
                row.createCell(3).setCellValue(order.getTotalAmount().doubleValue());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

}