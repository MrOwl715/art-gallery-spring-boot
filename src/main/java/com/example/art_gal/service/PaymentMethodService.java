package com.example.art_gal.service;

import com.example.art_gal.dto.PaymentMethodDTO;
import com.example.art_gal.entity.PaymentMethod;
import com.example.art_gal.exception.ResourceNotFoundException;
import com.example.art_gal.repository.PaymentMethodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentMethodService {

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    public PaymentMethodDTO createPaymentMethod(PaymentMethodDTO dto) {
        PaymentMethod entity = convertToEntity(dto);
        PaymentMethod savedEntity = paymentMethodRepository.save(entity);
        return convertToDTO(savedEntity);
    }

    public List<PaymentMethodDTO> getAllPaymentMethods() {
        return paymentMethodRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PaymentMethodDTO getPaymentMethodById(Long id) {
        PaymentMethod entity = findPaymentMethodById(id);
        return convertToDTO(entity);
    }

    public PaymentMethodDTO updatePaymentMethod(Long id, PaymentMethodDTO dto) {
        PaymentMethod entity = findPaymentMethodById(id);
        entity.setMethod(dto.getMethod());
        entity.setDescription(dto.getDescription());
        entity.setAccountNumber(dto.getAccountNumber());
        entity.setQrCodeImageUrl(dto.getQrCodeImageUrl());
        entity.setStatus(dto.isStatus());
        PaymentMethod updatedEntity = paymentMethodRepository.save(entity);
        return convertToDTO(updatedEntity);
    }

    public void deletePaymentMethod(Long id) {
        PaymentMethod entity = findPaymentMethodById(id);
        paymentMethodRepository.delete(entity);
    }

    private PaymentMethod findPaymentMethodById(Long id) {
        return paymentMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentMethod not found with id: " + id));
    }

    private PaymentMethodDTO convertToDTO(PaymentMethod entity) {
        PaymentMethodDTO dto = new PaymentMethodDTO();
        dto.setId(entity.getId());
        dto.setMethod(entity.getMethod());
        dto.setDescription(entity.getDescription());
        dto.setAccountNumber(entity.getAccountNumber());
        dto.setQrCodeImageUrl(entity.getQrCodeImageUrl());
        dto.setStatus(entity.isStatus());
        return dto;
    }

    private PaymentMethod convertToEntity(PaymentMethodDTO dto) {
        PaymentMethod entity = new PaymentMethod();
        entity.setMethod(dto.getMethod());
        entity.setDescription(dto.getDescription());
        entity.setAccountNumber(dto.getAccountNumber());
        entity.setQrCodeImageUrl(dto.getQrCodeImageUrl());
        entity.setStatus(dto.isStatus());
        return entity;
    }
}