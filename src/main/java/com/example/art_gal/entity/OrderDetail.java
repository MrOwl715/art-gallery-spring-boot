package com.example.art_gal.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "order_details")
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nhiều chi tiết thuộc về một đơn hàng
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    // Một chi tiết ứng với một sản phẩm tranh
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "painting_id")
    private Painting painting;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private BigDecimal price; // Giá của sản phẩm tại thời điểm mua
}