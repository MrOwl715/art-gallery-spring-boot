package com.example.art_gal.security;

import io.jsonwebtoken.*; // Thêm import
import io.jsonwebtoken.security.Keys; // Thêm import này
import org.slf4j.Logger; // Thêm import
import org.slf4j.LoggerFactory; // Thêm import
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets; // Thêm import này
import java.security.Key; // Thêm import này

import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    // Đây là chìa khóa bí mật, trong thực tế nên để trong file
    // application.properties
    private final String JWT_SECRET = "jhas+csfdlYXvrbhn8P24zI6Sj7Ma/f72+5FeDlZY1i/WgFWQcNXDChCsYMfO2NktJfJht02GuMmgTyKbcJCVw==";

    // Thời gian hết hạn của token (ms), ở đây là 7 ngày
    private final long JWT_EXPIRATION = 604800000L;

    // Lấy username từ JWT
    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key()).build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    // Xác thực token
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty.");
        }
        return false;
    }

    // Tạo token từ thông tin người dùng
    public String generateToken(Authentication authentication) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION);

        String roles = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.joining(","));

        return Jwts.builder()
                .setSubject(authentication.getName())
                .claim("roles", roles) //
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key()) // <-- SỬ DỤNG PHƯƠNG THỨC MỚI
                .compact();
    }

    // --- PHƯƠNG THỨC MỚI ĐỂ TẠO KEY ---
    private Key key() {
        return Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));
    }

    // (Các phương thức để giải mã và xác thực token sẽ được thêm sau)
}