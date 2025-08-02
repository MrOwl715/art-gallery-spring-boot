package com.example.art_gal.service;

import com.example.art_gal.dto.CategoryDTO;
import com.example.art_gal.repository.PaintingRepository;
import com.example.art_gal.entity.Painting;
import com.example.art_gal.entity.PaintingStatus;
import org.springframework.transaction.annotation.Transactional;
import com.example.art_gal.entity.Category;
import com.example.art_gal.exception.ResourceNotFoundException;
import com.example.art_gal.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PaintingRepository paintingRepository;

    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Category category = convertToEntity(categoryDTO);
        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public CategoryDTO getCategoryById(Long id) {
        Category category = findCategoryById(id);
        return convertToDTO(category);
    }
    
    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = findCategoryById(id);

        // --- BẮT ĐẦU LOGIC CẬP NHẬT TRẠNG THÁI TRANH THEO YÊU CẦU MỚI ---

        // Trường hợp 1: Ẩn danh mục (từ true -> false)
        if (category.isStatus() && !categoryDTO.isStatus()) {
            List<Painting> paintingsToUpdate = paintingRepository.findByCategoryId(id);
            for (Painting painting : paintingsToUpdate) {
                // Chỉ đổi status của tranh "Đang bán" sang "Dừng bán".
                // Tranh "Đã bán" (SOLD) sẽ được giữ nguyên.
                if (painting.getStatus() == PaintingStatus.FOR_SALE) {
                    painting.setStatus(PaintingStatus.NOT_FOR_SALE);
                }
            }
            paintingRepository.saveAll(paintingsToUpdate);
        }
        // Trường hợp 2: Hiển thị lại danh mục (từ false -> true)
        else if (!category.isStatus() && categoryDTO.isStatus()) {
            List<Painting> paintingsToUpdate = paintingRepository.findByCategoryId(id);
            for (Painting painting : paintingsToUpdate) {
                // Chỉ đổi status của tranh "Dừng bán" sang "Đang bán".
                // Tranh "Đã bán" (SOLD) sẽ được giữ nguyên.
                if (painting.getStatus() == PaintingStatus.NOT_FOR_SALE) {
                    painting.setStatus(PaintingStatus.FOR_SALE);
                }
            }
            paintingRepository.saveAll(paintingsToUpdate);
        }
        
        // --- KẾT THÚC LOGIC CẬP NHẬT ---

        // Cập nhật thông tin của chính danh mục đó
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setStatus(categoryDTO.isStatus());
        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }
    
    public void deleteCategory(Long id) {
        Category category = findCategoryById(id);
        if (paintingRepository.countByCategoryId(id) > 0) {
            throw new IllegalStateException("Không thể xóa danh mục đang có chứa tranh.");
        }
        categoryRepository.delete(category);
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }
    
    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setStatus(category.isStatus());
        dto.setPaintingCount((int) paintingRepository.countByCategoryId(category.getId()));
        return dto;
    }

    private Category convertToEntity(CategoryDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setStatus(dto.isStatus());
        return category;
    }
}