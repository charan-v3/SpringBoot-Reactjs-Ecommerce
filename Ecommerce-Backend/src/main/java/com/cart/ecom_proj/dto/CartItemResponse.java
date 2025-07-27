package com.cart.ecom_proj.dto;

import com.cart.ecom_proj.model.CartItem;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CartItemResponse {
    
    private Long id;
    private Long productId;
    private String productName;
    private String productBrand;
    private Double productPrice;
    private String productImageName;
    private Integer quantity;
    private Double subtotal;
    private LocalDateTime addedAt;
    private LocalDateTime updatedAt;
    
    public CartItemResponse(CartItem cartItem) {
        this.id = cartItem.getId();
        this.productId = cartItem.getProduct().getId();
        this.productName = cartItem.getProduct().getName();
        this.productBrand = cartItem.getProduct().getBrand();
        this.productPrice = cartItem.getProduct().getPrice().doubleValue();
        this.productImageName = cartItem.getProduct().getImageName();
        this.quantity = cartItem.getQuantity();
        this.subtotal = cartItem.getSubtotal();
        this.addedAt = cartItem.getAddedAt();
        this.updatedAt = cartItem.getUpdatedAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getProductId() {
        return productId;
    }
    
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    public String getProductBrand() {
        return productBrand;
    }
    
    public void setProductBrand(String productBrand) {
        this.productBrand = productBrand;
    }
    
    public Double getProductPrice() {
        return productPrice;
    }
    
    public void setProductPrice(Double productPrice) {
        this.productPrice = productPrice;
    }
    
    public String getProductImageName() {
        return productImageName;
    }
    
    public void setProductImageName(String productImageName) {
        this.productImageName = productImageName;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public Double getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }
    
    public LocalDateTime getAddedAt() {
        return addedAt;
    }
    
    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
