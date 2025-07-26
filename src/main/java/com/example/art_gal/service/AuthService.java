package com.example.art_gal.service;

import com.example.art_gal.dto.ChangePasswordDTO;
import com.example.art_gal.dto.JwtAuthResponse;
import com.example.art_gal.dto.LoginDTO;
import com.example.art_gal.dto.RegisterDTO;
import com.example.art_gal.entity.User;
import com.example.art_gal.entity.UserStatus;
import com.example.art_gal.exception.ResourceNotFoundException;
import com.example.art_gal.repository.UserRepository;
import com.example.art_gal.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String register(RegisterDTO registerDTO) {
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
        user.setStatus(UserStatus.DEACTIVE); // Mặc định là DEACTIVE

        userRepository.save(user);

        return "Đăng ký thành công! Vui lòng chờ quản trị viên kích hoạt tài khoản.";
    }

    public void changePassword(ChangePasswordDTO changePasswordDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1. Kiểm tra xem mật khẩu cũ có đúng không
        if (!passwordEncoder.matches(changePasswordDTO.getCurrentPassword(), currentUser.getPassword())) {
            throw new BadCredentialsException("Mật khẩu hiện tại không chính xác.");
        }

        // 2. Mã hóa và lưu mật khẩu mới
        currentUser.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        userRepository.save(currentUser);
    }

    public JwtAuthResponse login(LoginDTO loginDTO) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginDTO.getUsername(),
                loginDTO.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);
        return new JwtAuthResponse(token, "Bearer"); 
    }
}