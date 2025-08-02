package com.example.art_gal.service;

import com.example.art_gal.dto.ExportOrderDTO;
import com.example.art_gal.dto.ExportOrderDetailDTO;
import com.example.art_gal.entity.*;
import com.example.art_gal.exception.ResourceNotFoundException;
import com.example.art_gal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExportOrderService {

    @Autowired private ExportOrderRepository exportOrderRepository;
    @Autowired private PaintingRepository paintingRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private PaymentMethodRepository paymentMethodRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ActivityLogService activityLogService;

    @Transactional
    public ExportOrderDTO createExportOrder(ExportOrderDTO orderDTO) {
        Customer customer = customerRepository.findById(orderDTO.getCustomerId())
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        PaymentMethod paymentMethod = paymentMethodRepository.findById(orderDTO.getPaymentMethodId())
            .orElseThrow(() -> new ResourceNotFoundException("Payment Method not found"));
        User currentUser = getCurrentUser();

        ExportOrder order = new ExportOrder();
        order.setCustomer(customer);
        order.setPaymentMethod(paymentMethod);
        order.setCreatedBy(currentUser);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.COMPLETED);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<ExportOrderDetail> detailEntities = new ArrayList<>();

        for (ExportOrderDetailDTO detailDTO : orderDTO.getOrderDetails()) {
            Painting painting = paintingRepository.findById(detailDTO.getPaintingId())
                .orElseThrow(() -> new ResourceNotFoundException("Painting not found: " + detailDTO.getPaintingId()));

            if (painting.getQuantity() < detailDTO.getQuantity()) {
                throw new IllegalStateException("Not enough stock for painting: " + painting.getName());
            }
            int newQuantity = painting.getQuantity() - detailDTO.getQuantity();
            painting.setQuantity(newQuantity);

            // Nếu bán hết, chuyển trạng thái thành Đã bán
            if (newQuantity == 0) {
                painting.setStatus(PaintingStatus.SOLD);
            }

            BigDecimal sellingPrice = painting.getSellingPrice();
            totalAmount = totalAmount.add(sellingPrice.multiply(BigDecimal.valueOf(detailDTO.getQuantity())));

            ExportOrderDetail detail = new ExportOrderDetail();
            detail.setExportOrder(order);
            detail.setPainting(painting);
            detail.setQuantity(detailDTO.getQuantity());
            detail.setPrice(sellingPrice);
            detailEntities.add(detail);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderDetails(detailEntities);

        ExportOrder savedOrder = exportOrderRepository.save(order);
        
        activityLogService.logActivity("TẠO ĐƠN HÀNG BÁN", "Đã tạo đơn hàng #" + savedOrder.getId() + " cho khách hàng " + customer.getName());

        return convertToDTO(savedOrder);
    }

    public List<ExportOrderDTO> getAllExportOrders() {
        return exportOrderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    public ExportOrderDTO convertToDTO(ExportOrder order) {
        ExportOrderDTO dto = new ExportOrderDTO();
        dto.setId(order.getId());
        if (order.getCustomer() != null) {
            dto.setCustomerId(order.getCustomer().getId());
            dto.setCustomerName(order.getCustomer().getName());
        }
        if (order.getPaymentMethod() != null) {
            dto.setPaymentMethodId(order.getPaymentMethod().getId());
        }
        if (order.getCreatedBy() != null) {
            dto.setCreatedByUsername(order.getCreatedBy().getUsername());
        }
        dto.setStatus(order.getStatus());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());

        if (order.getOrderDetails() != null) {
            List<ExportOrderDetailDTO> detailDTOs = order.getOrderDetails().stream().map(detail -> {
                ExportOrderDetailDTO d = new ExportOrderDetailDTO();
                d.setId(detail.getId());
                d.setPaintingId(detail.getPainting().getId());
                d.setPaintingName(detail.getPainting().getName());
                d.setQuantity(detail.getQuantity());
                d.setPrice(detail.getPrice());
                return d;
            }).collect(Collectors.toList());
            dto.setOrderDetails(detailDTOs);
        }

        return dto;
    }
}