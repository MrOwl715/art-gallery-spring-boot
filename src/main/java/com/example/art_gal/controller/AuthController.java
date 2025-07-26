package com.example.art_gal.controller;

import com.example.art_gal.dto.ChangePasswordDTO;
import com.example.art_gal.dto.JwtAuthResponse;
import com.example.art_gal.dto.LoginDTO;
import com.example.art_gal.dto.RegisterDTO;
import com.example.art_gal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterDTO registerDTO) {
        String response = authService.register(registerDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
        @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody LoginDTO loginDTO) {
        JwtAuthResponse response = authService.login(loginDTO);
        return ResponseEntity.ok(response);
    }

     @PatchMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordDTO changePasswordDTO) {
        authService.changePassword(changePasswordDTO);
        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }
}