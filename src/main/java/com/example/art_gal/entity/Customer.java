package com.example.art_gal.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String phone;

    private String address;

    @Column(unique = true)
    private String email; // Thêm mới

    // true = hiển thị, false = ẩn
    @Column(nullable = false)
    private boolean status; // Thêm mới
}