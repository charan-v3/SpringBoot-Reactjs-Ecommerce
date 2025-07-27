package com.cart.ecom_proj.dto;

import com.cart.ecom_proj.model.Customer;

public class CustomerAnalyticsDto {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private int visitCount;
    private int purchaseCount;
    
    public CustomerAnalyticsDto() {}
    
    public CustomerAnalyticsDto(Customer customer) {
        this.id = customer.getId();
        this.username = customer.getUsername();
        this.email = customer.getEmail();
        this.firstName = customer.getFirstName();
        this.lastName = customer.getLastName();
        this.visitCount = customer.getVisitCount();
        this.purchaseCount = customer.getPurchaseCount();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public int getVisitCount() {
        return visitCount;
    }
    
    public void setVisitCount(int visitCount) {
        this.visitCount = visitCount;
    }
    
    public int getPurchaseCount() {
        return purchaseCount;
    }
    
    public void setPurchaseCount(int purchaseCount) {
        this.purchaseCount = purchaseCount;
    }
}
