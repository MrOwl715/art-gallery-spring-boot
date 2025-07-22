package com.example.art_gal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerDTO {
    private Long id;

    @NotBlank(message = "Tên khách hàng không được để trống")
    private String name;

    private String phone;
    private String address;

    @Email(message = "Email không hợp lệ")
    private String email;

    private boolean status;
}