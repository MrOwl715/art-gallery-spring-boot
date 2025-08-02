package com.example.art_gal.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ImportSlipDetailDTO {
    private Long id;
    private Long paintingId;
    private String paintingName;
    private int quantity;
    private BigDecimal importPrice;
}