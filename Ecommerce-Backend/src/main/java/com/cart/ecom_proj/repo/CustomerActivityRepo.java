package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.Customer;
import com.cart.ecom_proj.model.CustomerActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerActivityRepo extends JpaRepository<CustomerActivity, Long> {
    
    List<CustomerActivity> findByCustomerOrderByActivityTimeDesc(Customer customer);
    
    List<CustomerActivity> findByCustomerIdOrderByActivityTimeDesc(Long customerId);
    
    @Query("SELECT COUNT(ca) FROM CustomerActivity ca WHERE ca.customer.id = :customerId AND ca.activityType = :activityType")
    Long countCustomerActivitiesByType(@Param("customerId") Long customerId, @Param("activityType") CustomerActivity.ActivityType activityType);
    
    @Query("SELECT ca FROM CustomerActivity ca WHERE ca.customer.id = :customerId AND ca.activityType = :activityType ORDER BY ca.activityTime DESC")
    List<CustomerActivity> findByCustomerIdAndActivityType(@Param("customerId") Long customerId, @Param("activityType") CustomerActivity.ActivityType activityType);
}
