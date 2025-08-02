package com.example.art_gal.controller;

import com.example.art_gal.dto.ExportOrderDTO;
import com.example.art_gal.service.ExportOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/export-orders")
public class ExportOrderController {

    @Autowired
    private ExportOrderService exportOrderService;

    @PostMapping
    public ResponseEntity<ExportOrderDTO> createExportOrder(@Valid @RequestBody ExportOrderDTO orderDTO) {
        return new ResponseEntity<>(exportOrderService.createExportOrder(orderDTO), HttpStatus.CREATED);
    }

    @GetMapping
    public List<ExportOrderDTO> getAllExportOrders() {
        return exportOrderService.getAllExportOrders();
    }
}