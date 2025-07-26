package com.example.art_gal.controller;

import com.example.art_gal.dto.UpdateUserDTO;
import com.example.art_gal.dto.UpdateUserStatusDTO;
import com.example.art_gal.dto.UserDTO;
import com.example.art_gal.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.art_gal.dto.RegisterDTO;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentUser(@Valid @RequestBody UpdateUserDTO updateUserDTO) {
        return ResponseEntity.ok(userService.updateCurrentUser(updateUserDTO));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody RegisterDTO registerDTO) {
        UserDTO newUser = userService.createUser(registerDTO);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }
    
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