package com.example.art_gal.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "payment_methods")
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên phương thức: "Tiền mặt", "Chuyển khoản", "Momo"
    @Column(nullable = false)
    private String method;

    // Mô tả thêm
    private String description;

    // Số tài khoản, số ví điện tử...
    @Column(name = "account_number")
    private String accountNumber;

    // true = đang hoạt động, false = đã ẩn/không dùng
    @Column(nullable = false)
    private boolean status;

    @Column(name = "qr_code_image_url")
    private String qrCodeImageUrl;
}