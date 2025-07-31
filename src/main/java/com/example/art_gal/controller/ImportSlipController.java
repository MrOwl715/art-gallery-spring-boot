package com.example.art_gal.controller;

import com.example.art_gal.dto.ImportSlipDTO;
import com.example.art_gal.service.ImportSlipService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/import-slips")
public class ImportSlipController {

    @Autowired
    private ImportSlipService importSlipService;

    @PostMapping
    public ResponseEntity<ImportSlipDTO> createImportSlip(@Valid @RequestBody ImportSlipDTO importSlipDTO) {
        return new ResponseEntity<>(importSlipService.createImportSlip(importSlipDTO), HttpStatus.CREATED);
    }

    @GetMapping
    public List<ImportSlipDTO> getAllImportSlips() {
        return importSlipService.getAllImportSlips();
    }
}