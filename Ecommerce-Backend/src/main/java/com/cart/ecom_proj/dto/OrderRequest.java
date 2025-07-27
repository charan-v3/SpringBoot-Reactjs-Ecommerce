package com.cart.ecom_proj.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    
    private String shippingAddress;
    private String phoneNumber;
    private String notes;
    private List<OrderItemRequest> items;

    // Guest customer information
    private String guestCustomerName;
    private String guestCustomerEmail;

    // Payment related fields
    private String paymentId;
    private String paymentStatus;
    private String paymentMethod;
    
    @Data
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
        private BigDecimal unitPrice;
    }
    
    // Getters and Setters
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
    
    public List<OrderItemRequest> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
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
}
