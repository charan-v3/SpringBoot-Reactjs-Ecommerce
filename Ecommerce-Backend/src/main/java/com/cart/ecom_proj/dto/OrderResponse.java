package com.cart.ecom_proj.dto;

import com.cart.ecom_proj.model.Order;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private String shippingAddress;
    private String phoneNumber;
    private String notes;
    private List<OrderItemResponse> items;

    // Customer information
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String guestCustomerName;
    private String guestCustomerEmail;

    // Payment information
    private String paymentId;
    private String paymentStatus;
    private String paymentMethod;
    
    @Data
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productBrand;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
    
    // Constructor to convert from Order entity
    public OrderResponse(Order order) {
        this.id = order.getId();
        this.orderNumber = order.getOrderNumber();
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus().toString();
        this.orderDate = order.getOrderDate();
        this.deliveryDate = order.getDeliveryDate();
        this.shippingAddress = order.getShippingAddress();
        this.phoneNumber = order.getPhoneNumber();
        this.notes = order.getNotes();

        // Customer information
        if (order.getCustomer() != null) {
            this.customerId = order.getCustomer().getId();
            this.customerName = order.getCustomer().getUsername();
            this.customerEmail = order.getCustomer().getEmail();
        }
        this.guestCustomerName = order.getGuestCustomerName();
        this.guestCustomerEmail = order.getGuestCustomerEmail();

        // Payment information
        this.paymentId = order.getPaymentId();
        this.paymentStatus = order.getPaymentStatus();
        this.paymentMethod = order.getPaymentMethod();

        if (order.getOrderItems() != null) {
            this.items = order.getOrderItems().stream()
                .map(item -> {
                    OrderItemResponse itemResponse = new OrderItemResponse();
                    itemResponse.setId(item.getId());
                    itemResponse.setProductId(item.getProduct().getId());
                    itemResponse.setProductName(item.getProductName());
                    itemResponse.setProductBrand(item.getProductBrand());
                    itemResponse.setQuantity(item.getQuantity());
                    itemResponse.setUnitPrice(item.getUnitPrice());
                    itemResponse.setTotalPrice(item.getTotalPrice());
                    return itemResponse;
                })
                .toList();
        }
    }
    
    // Default constructor
    public OrderResponse() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getOrderDate() {
        return orderDate;
    }
    
    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }
    
    public LocalDateTime getDeliveryDate() {
        return deliveryDate;
    }
    
    public void setDeliveryDate(LocalDateTime deliveryDate) {
        this.deliveryDate = deliveryDate;
    }
    
    public String getShippingAddress() {
        return shippingAddress;
    }
    
    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public List<OrderItemResponse> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getGuestCustomerName() {
        return guestCustomerName;
    }

    public void setGuestCustomerName(String guestCustomerName) {
        this.guestCustomerName = guestCustomerName;
    }

    public String getGuestCustomerEmail() {
        return guestCustomerEmail;
    }

    public void setGuestCustomerEmail(String guestCustomerEmail) {
        this.guestCustomerEmail = guestCustomerEmail;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
