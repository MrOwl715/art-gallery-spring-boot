package com.example.art_gal.service;

import com.example.art_gal.dto.UpdateUserDTO;
import com.example.art_gal.dto.UserDTO;
import com.example.art_gal.entity.User;
import com.example.art_gal.entity.UserStatus;
import com.example.art_gal.exception.ResourceNotFoundException;
import com.example.art_gal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserDTO getCurrentUser() {
        // Lấy username của người dùng đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Tìm user trong CSDL
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Chuyển đổi sang DTO để trả về
        return convertToDTO(user);
    }

    @PreAuthorize("hasRole('MANAGER')") // Chỉ MANAGER mới có quyền gọi hàm này
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('MANAGER')") // Chỉ MANAGER mới có quyền gọi hàm này
    public UserDTO updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        user.setStatus(status);
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public UserDTO updateCurrentUser(UpdateUserDTO updateUserDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Kiểm tra xem email mới có bị trùng với người dùng khác không
        Optional<User> userByNewEmail = userRepository.findByEmail(updateUserDTO.getEmail());
        if (userByNewEmail.isPresent() && !userByNewEmail.get().getId().equals(currentUser.getId())) {
            throw new DataIntegrityViolationException("Email đã được sử dụng bởi một tài khoản khác.");
        }

        currentUser.setFullName(updateUserDTO.getFullName());
        currentUser.setEmail(updateUserDTO.getEmail());
        currentUser.setPhone(updateUserDTO.getPhone());

        User updatedUser = userRepository.save(currentUser);
        return convertToDTO(updatedUser);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        return dto;
    }
}