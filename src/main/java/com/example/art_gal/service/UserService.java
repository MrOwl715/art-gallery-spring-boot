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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.art_gal.dto.RegisterDTO; 

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; 

    @Autowired
    private ActivityLogService activityLogService;

    @PreAuthorize("hasRole('MANAGER')")
    public UserDTO createUser(RegisterDTO registerDTO) {
        if (userRepository.findByUsername(registerDTO.getUsername()).isPresent()) {
            throw new DataIntegrityViolationException("Username đã tồn tại!");
        }
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
             throw new DataIntegrityViolationException("Email đã tồn tại!");
        }

        User user = new User();
        user.setFullName(registerDTO.getFullName());
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPhone(registerDTO.getPhone());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setRole(registerDTO.getRole());
        user.setStatus(UserStatus.DEACTIVE); // Mặc định là chưa kích hoạt

        User savedUser = userRepository.save(user);
        
        activityLogService.logActivity("TẠO TÀI KHOẢN", "Đã tạo tài khoản mới: " + savedUser.getUsername());

        return convertToDTO(savedUser);
    }

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

    @PreAuthorize("hasRole('MANAGER')")
    public UserDTO updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        user.setStatus(status);
        User updatedUser = userRepository.save(user);

        activityLogService.logActivity("CẬP NHẬT TRẠNG THÁI USER", "Đã đổi trạng thái tài khoản " + updatedUser.getUsername() + " thành " + status.name());

        return convertToDTO(updatedUser);
    }

    public UserDTO updateCurrentUser(UpdateUserDTO updateUserDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<User> userByNewEmail = userRepository.findByEmail(updateUserDTO.getEmail());
        if (userByNewEmail.isPresent() && !userByNewEmail.get().getId().equals(currentUser.getId())) {
            throw new DataIntegrityViolationException("Email đã được sử dụng bởi một tài khoản khác.");
        }

        currentUser.setFullName(updateUserDTO.getFullName());
        currentUser.setEmail(updateUserDTO.getEmail());
        currentUser.setPhone(updateUserDTO.getPhone());

        User updatedUser = userRepository.save(currentUser);
        activityLogService.logActivity("CẬP NHẬT THÔNG TIN", "Đã tự cập nhật thông tin cá nhân.");
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