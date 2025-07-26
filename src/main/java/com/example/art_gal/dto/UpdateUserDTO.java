package com.example.art_gal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserDTO {
    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    private String phone;
}