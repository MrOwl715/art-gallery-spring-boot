package com.example.art_gal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ArtistDTO {
    private Long id;

    @NotBlank(message = "Tên không được để trống")
    private String name;

    private String biography;

    private String phone;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String address;

    private boolean status;
}