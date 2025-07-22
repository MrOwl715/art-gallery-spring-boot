package com.example.art_gal.controller;

import com.example.art_gal.dto.UpdateUserStatusDTO;
import com.example.art_gal.dto.UserDTO;
import com.example.art_gal.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserDTO> updateUserStatus(@PathVariable Long id, @Valid @RequestBody UpdateUserStatusDTO statusDTO) {
        UserDTO updatedUser = userService.updateUserStatus(id, statusDTO.getStatus());
        return ResponseEntity.ok(updatedUser);
    }
}