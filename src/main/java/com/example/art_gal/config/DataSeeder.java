package com.example.art_gal.config;

import com.example.art_gal.entity.Role;
import com.example.art_gal.entity.User;
import com.example.art_gal.entity.UserStatus;
import com.example.art_gal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("manager").isEmpty()) {
            User manager = new User();
            manager.setFullName("Default Manager");
            manager.setUsername("manager");
            manager.setEmail("manager@artgal.com");
            manager.setPassword(passwordEncoder.encode("admin123"));
            manager.setRole(Role.MANAGER);
            manager.setStatus(UserStatus.ACTIVE); // Kích hoạt sẵn

            userRepository.save(manager);
            System.out.println(">>> Đã tạo tài khoản Manager mặc định!");
        }
    }
}