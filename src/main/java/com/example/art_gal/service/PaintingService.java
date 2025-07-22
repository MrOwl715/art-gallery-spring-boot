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

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaintingService {

    @Autowired
    private PaintingRepository paintingRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // Tạo tranh mới
    public PaintingDTO createPainting(PaintingDTO paintingDTO) {
        Artist artist = artistRepository.findById(paintingDTO.getArtistId())
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found with id: " + paintingDTO.getArtistId()));

        Category category = categoryRepository.findById(paintingDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + paintingDTO.getCategoryId()));

        Painting painting = convertToEntity(paintingDTO, artist, category);
        Painting savedPainting = paintingRepository.save(painting);
        return convertToDTO(savedPainting);
    }

    // Cập nhật tranh
    public PaintingDTO updatePainting(Long id, PaintingDTO paintingDTO) {
        Painting paintingToUpdate = findPaintingById(id);

        Artist artist = artistRepository.findById(paintingDTO.getArtistId())
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found with id: " + paintingDTO.getArtistId()));

        Category category = categoryRepository.findById(paintingDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + paintingDTO.getCategoryId()));

        paintingToUpdate.setName(paintingDTO.getName());
        paintingToUpdate.setDescription(paintingDTO.getDescription());
        paintingToUpdate.setPrice(paintingDTO.getPrice());
        paintingToUpdate.setImageUrl(paintingDTO.getImageUrl());
        paintingToUpdate.setQuantity(paintingDTO.getQuantity());
        paintingToUpdate.setMaterial(paintingDTO.getMaterial());
        paintingToUpdate.setSize(paintingDTO.getSize());
        paintingToUpdate.setStatus(paintingDTO.isStatus());
        paintingToUpdate.setArtist(artist);
        paintingToUpdate.setCategory(category);

        Painting updatedPainting = paintingRepository.save(paintingToUpdate);
        return convertToDTO(updatedPainting);
    }

    // Lấy tất cả tranh
    public List<PaintingDTO> getAllPaintings() {
        return paintingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy tranh theo ID
    public PaintingDTO getPaintingById(Long id) {
        Painting painting = findPaintingById(id);
        return convertToDTO(painting);
    }

    // Xóa tranh
    public void deletePainting(Long id) {
        Painting painting = findPaintingById(id);
        paintingRepository.delete(painting);
    }

    // --- Các phương thức private hỗ trợ ---

    private Painting findPaintingById(Long id) {
        return paintingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Painting not found with id: " + id));
    }

    // Chuyển từ Entity sang DTO
    private PaintingDTO convertToDTO(Painting painting) {
        PaintingDTO dto = new PaintingDTO();
        dto.setId(painting.getId());
        dto.setName(painting.getName());
        dto.setDescription(painting.getDescription());
        dto.setPrice(painting.getPrice());
        dto.setImageUrl(painting.getImageUrl());
        dto.setQuantity(painting.getQuantity());
        dto.setMaterial(painting.getMaterial());
        dto.setSize(painting.getSize());
        dto.setStatus(painting.isStatus());
        dto.setArtistId(painting.getArtist().getId());
        dto.setCategoryId(painting.getCategory().getId());
        return dto;
    }

    // Chuyển từ DTO sang Entity
    private Painting convertToEntity(PaintingDTO dto, Artist artist, Category category) {
        Painting painting = new Painting();
        painting.setName(dto.getName());
        painting.setDescription(dto.getDescription());
        painting.setPrice(dto.getPrice());
        painting.setImageUrl(dto.getImageUrl());
        painting.setQuantity(dto.getQuantity());
        painting.setMaterial(dto.getMaterial());
        painting.setSize(dto.getSize());
        painting.setStatus(dto.isStatus());
        painting.setArtist(artist);
        painting.setCategory(category);
        return painting;
    }
}