package com.example.art_gal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentMethodDTO {
    private Long id;

    @NotBlank
    private String method;

    private String description;
    private String accountNumber;
    private boolean status;

     private String qrCodeImageUrl;
}