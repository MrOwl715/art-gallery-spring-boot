package com.example.art_gal.service;

import com.example.art_gal.dto.ImportSlipDTO;
import com.example.art_gal.dto.ImportSlipDetailDTO;
import com.example.art_gal.dto.NewPaintingDTO;
import com.example.art_gal.entity.*;
import com.example.art_gal.exception.ResourceNotFoundException;
import com.example.art_gal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ImportSlipService {

    @Autowired private ImportSlipRepository importSlipRepository;
    @Autowired private PaintingRepository paintingRepository;
    @Autowired private ArtistRepository artistRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ActivityLogService activityLogService;

    @Transactional
    public ImportSlipDTO createImportSlip(ImportSlipDTO importSlipDTO) {
        Artist artist = artistRepository.findById(importSlipDTO.getArtistId())
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found"));
        User currentUser = getCurrentUser();

        ImportSlip slip = new ImportSlip();
        slip.setArtist(artist);
        slip.setCreatedBy(currentUser);
        slip.setImportDate(LocalDateTime.now());
        slip.setStatus(OrderStatus.COMPLETED);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<ImportSlipDetail> detailEntities = new ArrayList<>();

        for (NewPaintingDTO paintingDTO : importSlipDTO.getNewPaintings()) {
            if (paintingDTO.getSellingPrice().compareTo(paintingDTO.getImportPrice()) <= 0) {
                throw new IllegalArgumentException("Giá bán phải cao hơn giá nhập cho tranh: " + paintingDTO.getName());
            }

            Category category = categoryRepository.findById(paintingDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

            Painting newPainting = new Painting();
            newPainting.setName(paintingDTO.getName());
            newPainting.setDescription(paintingDTO.getDescription());
            newPainting.setImportPrice(paintingDTO.getImportPrice());
            newPainting.setSellingPrice(paintingDTO.getSellingPrice());
            newPainting.setImageUrl(paintingDTO.getImageUrl());
            newPainting.setMaterial(paintingDTO.getMaterial());
            newPainting.setSize(paintingDTO.getSize());
            newPainting.setStatus(PaintingStatus.FOR_SALE);
            newPainting.setQuantity(1);
            newPainting.setArtist(artist);
            newPainting.setCategory(category);
            
            Painting savedPainting = paintingRepository.save(newPainting);

            ImportSlipDetail detail = new ImportSlipDetail();
            detail.setImportSlip(slip);
            detail.setPainting(savedPainting);
            detail.setQuantity(1);
            detail.setImportPrice(savedPainting.getImportPrice());
            detailEntities.add(detail);
            
            totalAmount = totalAmount.add(savedPainting.getImportPrice());
        }

        slip.setTotalAmount(totalAmount);
        slip.setSlipDetails(detailEntities);

        ImportSlip savedSlip = importSlipRepository.save(slip);
        
        activityLogService.logActivity("TẠO PHIẾU NHẬP", "Đã tạo phiếu nhập #" + savedSlip.getId() + " từ họa sĩ " + artist.getName());
        
        return convertToDTO(savedSlip);
    }

    public List<ImportSlipDTO> getAllImportSlips() {
        return importSlipRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private ImportSlipDTO convertToDTO(ImportSlip slip) {
        ImportSlipDTO dto = new ImportSlipDTO();
        dto.setId(slip.getId());
        if(slip.getArtist() != null) {
            dto.setArtistId(slip.getArtist().getId());
            dto.setArtistName(slip.getArtist().getName());
        }
        if(slip.getCreatedBy() != null) {
            dto.setCreatedByUsername(slip.getCreatedBy().getUsername());
        }
        dto.setImportDate(slip.getImportDate());
        dto.setTotalAmount(slip.getTotalAmount());
        dto.setStatus(slip.getStatus());
        
        if (slip.getSlipDetails() != null) {
            List<ImportSlipDetailDTO> detailDTOs = slip.getSlipDetails().stream().map(detail -> {
                ImportSlipDetailDTO d = new ImportSlipDetailDTO();
                d.setId(detail.getId());
                d.setPaintingId(detail.getPainting().getId());
                d.setPaintingName(detail.getPainting().getName());
                d.setQuantity(detail.getQuantity());
                d.setImportPrice(detail.getImportPrice());
                return d;
            }).collect(Collectors.toList());
            dto.setSlipDetails(detailDTOs);
        }
        
        return dto;
    }
}