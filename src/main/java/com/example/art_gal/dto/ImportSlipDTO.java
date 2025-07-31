package com.example.art_gal.dto;

import com.example.art_gal.entity.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ImportSlipDTO {
    // Dùng cho request
    @NotNull
    private Long artistId;
    @NotEmpty
    @Valid
    private List<NewPaintingDTO> newPaintings;

    // Dùng cho response
    private Long id;
    private String artistName;
    private String createdByUsername;
    private LocalDateTime importDate;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private List<ImportSlipDetailDTO> slipDetails;
}