package com.example.art_gal.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ExportOrderDetailDTO {
    private Long id;
    
    @NotNull(message = "ID Tranh không được để trống")
    private Long paintingId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private int quantity;
    
    // Các trường dùng cho response
    private String paintingName; 
    private BigDecimal price;
}