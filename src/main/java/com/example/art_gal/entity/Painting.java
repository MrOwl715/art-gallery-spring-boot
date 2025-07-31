package com.example.art_gal.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "paintings")
public class Painting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // --- CÁC THAY ĐỔI ---
    @Column(name = "import_price", nullable = false)
    private BigDecimal importPrice; // Giá nhập

    @Column(name = "selling_price", nullable = false)
    private BigDecimal sellingPrice; // Giá bán

    private String imageUrl;
    private int quantity;
    private String material;
    private String size;

    @Column(nullable = false)
    private boolean status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    private Artist artist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}