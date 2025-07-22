package com.example.art_gal.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderDetailDTO {
    private Long id;

    @NotNull
    private Long paintingId;

    @Min(1)
    private int quantity;
    
    // Các trường này dùng cho response
    private String paintingName; 
    private BigDecimal price;
}