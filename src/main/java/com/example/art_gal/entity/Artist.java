package com.example.art_gal.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "artists")
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String biography;

    @Column
    private String phone; // Thêm mới

    @Column
    private String email; // Thêm mới

    private String address; // Thêm mới

    // true = hiển thị, false = ẩn
    @Column(nullable = false)
    private boolean status; // Thêm mới

    @OneToMany(mappedBy = "artist", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Painting> paintings;
}