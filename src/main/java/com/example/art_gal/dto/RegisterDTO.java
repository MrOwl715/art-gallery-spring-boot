package com.example.art_gal.dto;

import com.example.art_gal.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterDTO {
    @NotBlank
    private String fullName;
    @NotBlank
    private String username;
    @NotBlank
    @Email
    private String email;
    private String phone;
    @NotBlank
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;
    @NotNull
    private Role role;
}