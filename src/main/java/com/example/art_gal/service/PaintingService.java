package com.example.art_gal.service;

import com.example.art_gal.dto.PaintingDTO;
import com.example.art_gal.entity.Artist;
import com.example.art_gal.entity.Category;
import com.example.art_gal.entity.Painting;
import com.example.art_gal.exception.ResourceNotFoundException;
import com.example.art_gal.repository.ArtistRepository;
import com.example.art_gal.repository.CategoryRepository;
import com.example.art_gal.repository.PaintingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaintingService {

    @Autowired private PaintingRepository paintingRepository;
    @Autowired private ArtistRepository artistRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ActivityLogService activityLogService;

    public List<PaintingDTO> getAllPaintings() {
        return paintingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PaintingDTO getPaintingById(Long id) {
        Painting painting = findPaintingById(id);
        return convertToDTO(painting);
    }

    @Transactional
    public PaintingDTO updatePainting(Long id, PaintingDTO paintingDTO) {
        // Yêu cầu: Check giá bán phải cao hơn giá nhập
        if (paintingDTO.getSellingPrice().compareTo(paintingDTO.getImportPrice()) <= 0) {
            throw new IllegalArgumentException("Giá bán phải cao hơn giá nhập.");
        }

        Painting paintingToUpdate = findPaintingById(id);

        Artist artist = artistRepository.findById(paintingDTO.getArtistId())
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found with id: " + paintingDTO.getArtistId()));
        Category category = categoryRepository.findById(paintingDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + paintingDTO.getCategoryId()));

        paintingToUpdate.setName(paintingDTO.getName());
        paintingToUpdate.setDescription(paintingDTO.getDescription());
        paintingToUpdate.setImportPrice(paintingDTO.getImportPrice()); // Cập nhật
        paintingToUpdate.setSellingPrice(paintingDTO.getSellingPrice()); // Cập nhật
        paintingToUpdate.setImageUrl(paintingDTO.getImageUrl());
        paintingToUpdate.setMaterial(paintingDTO.getMaterial());
        paintingToUpdate.setSize(paintingDTO.getSize());
        paintingToUpdate.setStatus(paintingDTO.getStatus());
        paintingToUpdate.setArtist(artist);
        paintingToUpdate.setCategory(category);

        Painting updatedPainting = paintingRepository.save(paintingToUpdate);
        
        activityLogService.logActivity("CẬP NHẬT TRANH", "Đã cập nhật thông tin cho tranh #" + updatedPainting.getId() + " - " + updatedPainting.getName());
        
        return convertToDTO(updatedPainting);
    }
    
    // Chức năng tạo tranh riêng lẻ đã được chuyển sang ImportSlipService
    // Chức năng xóa tranh có thể được thêm vào sau nếu cần

    private Painting findPaintingById(Long id) {
        return paintingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Painting not found with id: " + id));
    }

    private PaintingDTO convertToDTO(Painting painting) {
        PaintingDTO dto = new PaintingDTO();
        dto.setId(painting.getId());
        dto.setName(painting.getName());
        dto.setDescription(painting.getDescription());
        dto.setImportPrice(painting.getImportPrice()); // Cập nhật
        dto.setSellingPrice(painting.getSellingPrice()); // Cập nhật
        dto.setImageUrl(painting.getImageUrl());
        dto.setQuantity(painting.getQuantity());
        dto.setMaterial(painting.getMaterial());
        dto.setSize(painting.getSize());
        dto.setStatus(painting.getStatus());
        if (painting.getArtist() != null) {
            dto.setArtistId(painting.getArtist().getId());
        }
        if (painting.getCategory() != null) {
            dto.setCategoryId(painting.getCategory().getId());
        }
        return dto;
    }
}