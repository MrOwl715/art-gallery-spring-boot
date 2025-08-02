package com.example.art_gal.dto;

import com.example.art_gal.entity.Role;
import com.example.art_gal.entity.UserStatus;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;
}