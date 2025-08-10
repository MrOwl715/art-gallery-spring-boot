package com.example.art_gal.controller;

import com.example.art_gal.dto.PaymentMethodDTO;
import com.example.art_gal.service.PaymentMethodService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// @PreAuthorize("hasRole('MANAGER')")
@RequestMapping("/api/payment-methods")
public class PaymentMethodController {

    @Autowired
    private PaymentMethodService paymentMethodService;

    @PostMapping
    public ResponseEntity<PaymentMethodDTO> create(@Valid @RequestBody PaymentMethodDTO dto) {
        return new ResponseEntity<>(paymentMethodService.createPaymentMethod(dto), HttpStatus.CREATED);
    }
    
    @GetMapping
    public List<PaymentMethodDTO> getAll() {
        return paymentMethodService.getAllPaymentMethods();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentMethodDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentMethodService.getPaymentMethodById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentMethodDTO> update(@PathVariable Long id, @Valid @RequestBody PaymentMethodDTO dto) {
        return ResponseEntity.ok(paymentMethodService.updatePaymentMethod(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paymentMethodService.deletePaymentMethod(id);
        return ResponseEntity.noContent().build();
    }
}