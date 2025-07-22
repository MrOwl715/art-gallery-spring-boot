package com.example.art_gal.dto;

import com.example.art_gal.entity.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserStatusDTO {
    @NotNull
    private UserStatus status;
}