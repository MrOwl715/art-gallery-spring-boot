package com.example.art_gal.dto;

import com.example.art_gal.entity.OrderStatus;
import com.example.art_gal.entity.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    
    // Dùng cho request
    private Long customerId;
    private Long artistId;

    @NotNull
    private Long paymentMethodId;
    
    @NotNull
    private OrderType type; // IMPORT hoặc EXPORT
    
    // Dùng cho response
    private OrderStatus status;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    
    @NotEmpty
    @Valid // Kích hoạt validation cho các đối tượng trong list
    private List<OrderDetailDTO> orderDetails;
}