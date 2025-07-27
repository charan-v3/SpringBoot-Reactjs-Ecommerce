package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepo extends JpaRepository<Customer, Long> {
    
    Optional<Customer> findByUsername(String username);
    
    Optional<Customer> findByEmail(String email);
    
    Optional<Customer> findByUsernameOrEmail(String username, String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT c FROM Customer c ORDER BY c.purchaseCount DESC")
    List<Customer> findTopCustomersByPurchases();
    
    @Query("SELECT c FROM Customer c ORDER BY c.visitCount DESC")
    List<Customer> findTopCustomersByVisits();
    
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.createdAt >= :startDate")
    long countNewCustomersSince(@Param("startDate") java.time.LocalDateTime startDate);
}
