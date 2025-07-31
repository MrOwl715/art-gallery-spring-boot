package com.example.art_gal.repository;

import com.example.art_gal.entity.ImportSlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImportSlipRepository extends JpaRepository<ImportSlip, Long> {
}