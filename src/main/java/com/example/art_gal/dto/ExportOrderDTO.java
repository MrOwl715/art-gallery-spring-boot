package com.example.art_gal.dto;

import com.example.art_gal.entity.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ExportOrderDTO {
    // Dùng cho request
    @NotNull(message = "ID Khách hàng không được để trống")
    private Long customerId;
    
    @NotNull(message = "ID Phương thức thanh toán không được để trống")
    private Long paymentMethodId;
    
    @NotEmpty(message = "Chi tiết đơn hàng không được để trống")
    @Valid
    private List<ExportOrderDetailDTO> orderDetails;

    // Dùng cho response
    private Long id;
    private String customerName;
    private String createdByUsername;
    private OrderStatus status;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
}