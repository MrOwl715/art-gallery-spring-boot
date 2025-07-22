package com.example.art_gal.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaintingDTO {
    private Long id;

    @NotBlank(message = "Tên tranh không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    private String imageUrl;

    @Min(value = 0, message = "Số lượng phải lớn hơn hoặc bằng 0")
    private int quantity;

    private String material;

    private String size;

    private boolean status;

    @NotNull(message = "ID Họa sĩ không được để trống")
    private Long artistId;

    @NotNull(message = "ID Danh mục không được để trống")
    private Long categoryId;
}