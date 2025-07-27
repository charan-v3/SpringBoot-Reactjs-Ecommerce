package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.Cart;
import com.cart.ecom_proj.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepo extends JpaRepository<Cart, Long> {
    
    Optional<Cart> findByCustomer(Customer customer);
    
    Optional<Cart> findByCustomerId(Long customerId);
    
    boolean existsByCustomer(Customer customer);
    
    boolean existsByCustomerId(Long customerId);
}
