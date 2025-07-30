package com.example.art_gal.repository;

import com.example.art_gal.entity.Order;
import com.example.art_gal.entity.OrderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByType(OrderType type);
}