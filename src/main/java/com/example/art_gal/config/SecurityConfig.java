package com.example.art_gal.config;

import com.example.art_gal.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // Thêm import

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // --- THÊM BEAN MỚI ---
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // @Bean
    // public SecurityFilterChain securityFilterChain(HttpSecurity http) throws
    // Exception {
    // http
    // // 1. Vô hiệu hóa CSRF (Cross-Site Request Forgery) vì chúng ta dùng API
    // .csrf(csrf -> csrf.disable())

    // // 2. Cấu hình phân quyền cho các request
    // .authorizeHttpRequests(authorize -> authorize
    // // Cho phép tất cả các request đến đường dẫn /api/** mà không cần xác thực
    // .requestMatchers("/api/**").permitAll()
    // // Tất cả các request khác đều cần phải được xác thực
    // .anyRequest().authenticated());

    // return http.build();
    // }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // .requestMatchers("/quan-ly-tai-khoan.html",
                        // "quan-ly-thanh-toan.html").hasRole("MANAGER")
                        .requestMatchers("/api/files/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll() // Cho phép API đăng nhập/đăng ký
                        .requestMatchers(
                            "/css/**", 
                            "/js/**", 
                            "/images/**", 
                            "/uploads/**",
                            "/dang-nhap.html", 
                            "/", "/index.html",
                            "/*.html",
                            "/favicon.ico"
                            )
                        .permitAll()
                        .requestMatchers("/api/activity-logs").authenticated()
                        .requestMatchers("/api/**").authenticated() 
                        .anyRequest().authenticated());
        // Thêm một lớp Filter kiểm tra JWT
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}