package com.example.art_gal.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class NewPaintingDTO {
    @NotBlank(message = "Tên tranh không được để trống")
    private String name;
    private String description;
    @NotNull(message = "Giá nhập không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá nhập phải lớn hơn 0")
    private BigDecimal importPrice;
    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá bán phải lớn hơn 0")
    private BigDecimal sellingPrice;
    private String imageUrl;
    private String material;
    private String size;
    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;
}