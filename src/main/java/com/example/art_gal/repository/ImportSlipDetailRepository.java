package com.example.art_gal.repository;

import com.example.art_gal.entity.ImportSlipDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImportSlipDetailRepository extends JpaRepository<ImportSlipDetail, Long> {
}