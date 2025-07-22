package com.example.art_gal.service;

import com.example.art_gal.dto.OrderDTO;
import com.example.art_gal.dto.OrderDetailDTO;
import com.example.art_gal.dto.UpdateOrderStatusDTO;
import com.example.art_gal.entity.*;
import com.example.art_gal.exception.ResourceNotFoundException;
import com.example.art_gal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private PaintingRepository paintingRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private ArtistRepository artistRepository;
    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Transactional // Đảm bảo toàn bộ phương thức là một giao dịch
    public OrderDTO createOrder(OrderDTO orderDTO) {
        Order order = new Order();

        // 1. Xác thực các ID đầu vào
        PaymentMethod paymentMethod = paymentMethodRepository.findById(orderDTO.getPaymentMethodId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment Method not found"));
        order.setPaymentMethod(paymentMethod);

        // 2. Xử lý theo loại đơn hàng
        if (orderDTO.getType() == OrderType.EXPORT) { // Đơn bán
            Customer customer = customerRepository.findById(orderDTO.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
            order.setCustomer(customer);
        } else { // Đơn nhập
            Artist artist = artistRepository.findById(orderDTO.getArtistId())
                    .orElseThrow(() -> new ResourceNotFoundException("Artist not found"));
            order.setArtist(artist);
        }

        order.setType(orderDTO.getType());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.COMPLETED); // Mặc định là hoàn thành

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderDetail> orderDetailEntities = new ArrayList<>();

        // 3. Xử lý từng sản phẩm trong đơn hàng
        for (OrderDetailDTO detailDTO : orderDTO.getOrderDetails()) {
            Painting painting = paintingRepository.findById(detailDTO.getPaintingId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Painting not found with id: " + detailDTO.getPaintingId()));

            // 4. Kiểm tra và cập nhật tồn kho
            if (orderDTO.getType() == OrderType.EXPORT) {
                if (painting.getQuantity() < detailDTO.getQuantity()) {
                    throw new IllegalStateException("Not enough stock for painting: " + painting.getName());
                }
                painting.setQuantity(painting.getQuantity() - detailDTO.getQuantity());
            } else {
                painting.setQuantity(painting.getQuantity() + detailDTO.getQuantity());
            }
            paintingRepository.save(painting);

            // 5. Tính tổng tiền và tạo OrderDetail
            BigDecimal lineTotal = painting.getPrice().multiply(BigDecimal.valueOf(detailDTO.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);

            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(order);
            orderDetail.setPainting(painting);
            orderDetail.setQuantity(detailDTO.getQuantity());
            orderDetail.setPrice(painting.getPrice()); // Lưu giá tại thời điểm mua
            orderDetailEntities.add(orderDetail);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderDetails(orderDetailEntities);

        // 6. Lưu đơn hàng vào CSDL
        Order savedOrder = orderRepository.save(order);

        // 7. Chuyển đổi lại sang DTO để trả về
        return convertToDTO(savedOrder);
    }

    // ... (Các hàm get, update status, ... sẽ được thêm sau)
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, UpdateOrderStatusDTO statusDTO) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        OrderStatus newStatus = statusDTO.getStatus();

        // Không xử lý nếu trạng thái không thay đổi
        if (order.getStatus() == newStatus) {
            return convertToDTO(order);
        }

        // Logic khôi phục tồn kho khi đơn hàng bán bị hủy
        if (order.getType() == OrderType.EXPORT && newStatus == OrderStatus.CANCELLED) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Painting painting = detail.getPainting();
                painting.setQuantity(painting.getQuantity() + detail.getQuantity());
                paintingRepository.save(painting);
            }
        }
        // --- LOGIC MỚI ---
        // Logic trừ tồn kho khi đơn hàng nhập bị hủy
        else if (order.getType() == OrderType.IMPORT && newStatus == OrderStatus.CANCELLED) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Painting painting = detail.getPainting();
                int newQuantity = painting.getQuantity() - detail.getQuantity();

                if (newQuantity < 0) {
                    // Xử lý trường hợp không đủ hàng để hủy đơn nhập (có thể do đã bán đi)
                    throw new IllegalStateException("Không thể hủy đơn nhập: Số lượng tồn kho của tranh '"
                            + painting.getName() + "' không đủ để trừ lại.");
                }
                painting.setQuantity(newQuantity);
                paintingRepository.save(painting);
            }
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO orderDTO = new OrderDTO();

        // Map các trường cơ bản
        orderDTO.setId(order.getId());
        orderDTO.setType(order.getType());
        orderDTO.setStatus(order.getStatus());
        orderDTO.setOrderDate(order.getOrderDate());
        orderDTO.setTotalAmount(order.getTotalAmount());
        orderDTO.setPaymentMethodId(order.getPaymentMethod().getId());

        // Map customer hoặc artist ID tùy theo loại đơn hàng
        if (order.getCustomer() != null) {
            orderDTO.setCustomerId(order.getCustomer().getId());
        }
        if (order.getArtist() != null) {
            orderDTO.setArtistId(order.getArtist().getId());
        }

        // Map danh sách chi tiết đơn hàng từ List<OrderDetail> sang
        // List<OrderDetailDTO>
        List<OrderDetailDTO> detailDTOs = order.getOrderDetails().stream().map(detailEntity -> {
            OrderDetailDTO detailDTO = new OrderDetailDTO();
            detailDTO.setId(detailEntity.getId());
            detailDTO.setPaintingId(detailEntity.getPainting().getId());
            detailDTO.setPaintingName(detailEntity.getPainting().getName()); // Thêm tên tranh cho dễ hiển thị
            detailDTO.setQuantity(detailEntity.getQuantity());
            detailDTO.setPrice(detailEntity.getPrice());
            return detailDTO;
        }).collect(Collectors.toList());

        orderDTO.setOrderDetails(detailDTOs);

        return orderDTO;
    }

}