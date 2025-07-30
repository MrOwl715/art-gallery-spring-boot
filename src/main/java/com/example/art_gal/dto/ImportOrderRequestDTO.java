package com.example.art_gal.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ImportOrderRequestDTO {
    @NotNull
    private Long artistId; // Nhà cung cấp

    @NotEmpty
    @Valid
    private List<NewPaintingDTO> newPaintings;
}