package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.OrderRequest;
import com.cart.ecom_proj.dto.OrderResponse;
import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.OrderItem;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.model.Customer;
import com.cart.ecom_proj.repo.OrderRepo;
import com.cart.ecom_proj.repo.OrderItemRepo;
import com.cart.ecom_proj.repo.ProductRepo;
import com.cart.ecom_proj.repo.CustomerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private OrderItemRepo orderItemRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CustomerRepo customerRepo;

    @Transactional
    public OrderResponse createOrder(Long customerId, OrderRequest orderRequest) {
        // Find customer (optional for guest orders)
        Customer customer = null;
        if (customerId != null) {
            customer = customerRepo.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
        }

        // Create order
        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(orderRequest.getShippingAddress());
        order.setPhoneNumber(orderRequest.getPhoneNumber());
        order.setNotes(orderRequest.getNotes());

        // Set guest customer information if not authenticated
        if (customer == null) {
            order.setGuestCustomerName(orderRequest.getGuestCustomerName());
            order.setGuestCustomerEmail(orderRequest.getGuestCustomerEmail());
        }

        // Set payment information
        order.setPaymentId(orderRequest.getPaymentId());
        order.setPaymentStatus(orderRequest.getPaymentStatus());
        order.setPaymentMethod(orderRequest.getPaymentMethod());

        // Calculate total and create order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderRequest.OrderItemRequest itemRequest : orderRequest.getItems()) {
            Product product = productRepo.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

            // Check stock availability
            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(itemRequest.getUnitPrice());
            orderItem.setTotalPrice(itemRequest.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
            
            // Store product details for historical reference
            orderItem.setProductName(product.getName());
            orderItem.setProductBrand(product.getBrand());
            orderItem.setProductDescription(product.getDescription());

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(orderItem.getTotalPrice());

            // Update product stock
            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepo.save(product);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        // Save order
        Order savedOrder = orderRepo.save(order);

        return new OrderResponse(savedOrder);
    }

    public List<OrderResponse> getCustomerOrders(Long customerId) {
        List<Order> orders = orderRepo.findOrdersByCustomerId(customerId);
        return orders.stream()
                .map(OrderResponse::new)
                .toList();
    }

    public Optional<OrderResponse> getOrderById(Long customerId, Long orderId) {
        Optional<Order> order = orderRepo.findByCustomerIdAndOrderId(customerId, orderId);
        return order.map(OrderResponse::new);
    }

    public Optional<OrderResponse> getOrderByOrderNumber(String orderNumber) {
        Optional<Order> order = orderRepo.findByOrderNumber(orderNumber);
        return order.map(OrderResponse::new);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);
        
        // Set delivery date if status is DELIVERED
        if (status == Order.OrderStatus.DELIVERED) {
            order.setDeliveryDate(LocalDateTime.now());
        }

        Order savedOrder = orderRepo.save(order);
        return new OrderResponse(savedOrder);
    }

    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepo.findAllOrdersByOrderDateDesc();
        return orders.stream()
                .map(OrderResponse::new)
                .toList();
    }

    // Analytics methods
    public Map<String, Object> getOrderAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        try {
            System.out.println("Starting order analytics calculation...");

            Long totalOrders = orderRepo.countTotalOrders();
            System.out.println("Total orders: " + totalOrders);

            Long pendingOrders = orderRepo.countOrdersByStatus(Order.OrderStatus.PENDING);
            Long confirmedOrders = orderRepo.countOrdersByStatus(Order.OrderStatus.CONFIRMED);
            Long processingOrders = orderRepo.countOrdersByStatus(Order.OrderStatus.PROCESSING);
            Long shippedOrders = orderRepo.countOrdersByStatus(Order.OrderStatus.SHIPPED);
            Long outForDeliveryOrders = orderRepo.countOrdersByStatus(Order.OrderStatus.OUT_FOR_DELIVERY);
            Long deliveredOrders = orderRepo.countOrdersByStatus(Order.OrderStatus.DELIVERED);
            Long cancelledOrders = orderRepo.countOrdersByStatus(Order.OrderStatus.CANCELLED);

            System.out.println("Order counts - Pending: " + pendingOrders + ", Delivered: " + deliveredOrders);

            BigDecimal totalRevenue = orderRepo.getTotalRevenue();
            BigDecimal averageOrderValue = orderRepo.getAverageOrderValue();

            System.out.println("Revenue: " + totalRevenue + ", Average: " + averageOrderValue);

            analytics.put("totalOrders", totalOrders != null ? totalOrders : 0L);
            analytics.put("pendingOrders", pendingOrders != null ? pendingOrders : 0L);
            analytics.put("confirmedOrders", confirmedOrders != null ? confirmedOrders : 0L);
            analytics.put("processingOrders", processingOrders != null ? processingOrders : 0L);
            analytics.put("shippedOrders", shippedOrders != null ? shippedOrders : 0L);
            analytics.put("outForDeliveryOrders", outForDeliveryOrders != null ? outForDeliveryOrders : 0L);
            analytics.put("deliveredOrders", deliveredOrders != null ? deliveredOrders : 0L);
            analytics.put("completedOrders", deliveredOrders != null ? deliveredOrders : 0L); // For backward compatibility
            analytics.put("cancelledOrders", cancelledOrders != null ? cancelledOrders : 0L);
            analytics.put("totalRevenue", totalRevenue != null ? totalRevenue.doubleValue() : 0.0);
            analytics.put("averageOrderValue", averageOrderValue != null ? averageOrderValue.doubleValue() : 0.0);

            System.out.println("Order analytics completed successfully");

        } catch (Exception e) {
            System.err.println("Error in order analytics: " + e.getMessage());
            e.printStackTrace();
            // Return default values on error
            analytics.put("totalOrders", 0L);
            analytics.put("pendingOrders", 0L);
            analytics.put("confirmedOrders", 0L);
            analytics.put("processingOrders", 0L);
            analytics.put("shippedOrders", 0L);
            analytics.put("deliveredOrders", 0L);
            analytics.put("completedOrders", 0L);
            analytics.put("cancelledOrders", 0L);
            analytics.put("totalRevenue", 0.0);
            analytics.put("averageOrderValue", 0.0);
        }

        return analytics;
    }

    // Enhanced security for order tracking
    public Optional<OrderResponse> trackOrderSecure(String orderNumber, Long customerId) {
        Optional<Order> order;
        if (customerId != null) {
            // For authenticated users, check both order number and customer ID
            order = orderRepo.findByOrderNumberAndCustomerId(orderNumber, customerId);
        } else {
            // For guest users, only allow tracking by order number for guest orders
            order = orderRepo.findByOrderNumber(orderNumber);
            // Additional security: only return guest orders for unauthenticated requests
            if (order.isPresent() && order.get().getCustomer() != null) {
                return Optional.empty(); // Don't allow guest users to track registered user orders
            }
        }
        return order.map(OrderResponse::new);
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "ORD" + timestamp + String.format("%03d", (int) (Math.random() * 1000));
    }
}
