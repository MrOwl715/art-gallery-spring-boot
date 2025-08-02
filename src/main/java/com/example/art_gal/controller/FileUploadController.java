package com.example.art_gal.controller;

import com.example.art_gal.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@CrossOrigin("*") 
@RequestMapping("/api/files")
public class FileUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload/qr")
    public ResponseEntity<?> uploadQrCode(@RequestParam("file") MultipartFile file) {
        String filePath = fileStorageService.store(file, "qr-codes");
        return ResponseEntity.ok(Map.of("filePath", filePath));
    }
}