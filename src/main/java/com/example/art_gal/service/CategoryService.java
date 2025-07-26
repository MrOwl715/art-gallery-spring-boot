package com.example.art_gal.service;

import com.example.art_gal.dto.CategoryDTO;
import com.example.art_gal.repository.PaintingRepository;
import com.example.art_gal.entity.Painting;
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
    
    @Transactional // Đảm bảo tất cả thao tác trong hàm là một giao dịch
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = findCategoryById(id);

        // Logic ẩn tranh hàng loạt
        // Nếu trạng thái cũ là true (hiển thị) và trạng thái mới là false (ẩn)
        if (category.isStatus() && !categoryDTO.isStatus()) {
            List<Painting> paintingsToUpdate = paintingRepository.findByCategoryId(id);
            for (Painting painting : paintingsToUpdate) {
                painting.setStatus(false); // Cập nhật trạng thái của tranh thành false (ẩn)
            }
            paintingRepository.saveAll(paintingsToUpdate); // Lưu tất cả thay đổi
        }

        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setStatus(categoryDTO.isStatus());
        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }
    
    public void deleteCategory(Long id) {
        Category category = findCategoryById(id);
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
        // Lấy số lượng tranh từ repository
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