package com.example.art_gal.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ImportSlipDetailDTO {
    private Long id;
    private Long paintingId;
    private String paintingName;
    private int quantity;
    private BigDecimal importPrice;
}