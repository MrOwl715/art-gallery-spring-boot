package com.example.art_gal.repository;

import com.example.art_gal.entity.Painting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaintingRepository extends JpaRepository<Painting, Long> {
    long countByCategoryId(Long categoryId);
    List<Painting> findByCategoryId(Long categoryId);
    
     @Query("SELECT SUM(p.quantity) FROM Painting p")
    Long sumInventoryQuantity();
}