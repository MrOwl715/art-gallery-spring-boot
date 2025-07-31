package com.example.art_gal.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path rootLocation = Paths.get("src/main/resources/static/uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    public String store(MultipartFile file, String subfolder) {
        // Làm sạch tên file để tránh lỗi đường dẫn
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        // Tạo tên file duy nhất để tránh bị ghi đè
        String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;

        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }
            
            Path destinationFolder = rootLocation.resolve(subfolder);
            
            // Tạo thư mục con nếu chưa tồn tại
            if (!Files.exists(destinationFolder)) {
                Files.createDirectories(destinationFolder);
            }

            Path destinationFile = destinationFolder.resolve(uniqueFilename);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            
            // --- ĐÂY LÀ DÒNG ĐÃ ĐƯỢC SỬA LẠI ---
            // Trả về đường dẫn web-accessible một cách an toàn
            return "/uploads/" + subfolder + "/" + uniqueFilename;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }
}