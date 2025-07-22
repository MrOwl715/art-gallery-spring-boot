package com.example.art_gal.dto;

import com.example.art_gal.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusDTO {
    @NotNull(message = "Trạng thái không được để trống")
    private OrderStatus status;
}