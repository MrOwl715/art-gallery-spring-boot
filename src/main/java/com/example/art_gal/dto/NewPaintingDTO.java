package com.example.art_gal.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class NewPaintingDTO {
    private String name;
    private String description;
    private BigDecimal price; // Đây là giá bán
    private String imageUrl;
    private String material;
    private String size;
    private Long categoryId;
    // Lưu ý: không cần artistId ở đây vì artist là nhà cung cấp chung của phiếu nhập
}