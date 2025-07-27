package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {

    List<Order> findByCustomerOrderByOrderDateDesc(Customer customer);

    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId ORDER BY o.orderDate DESC")
    List<Order> findOrdersByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId AND o.id = :orderId")
    Optional<Order> findByCustomerIdAndOrderId(@Param("customerId") Long customerId, @Param("orderId") Long orderId);

    List<Order> findByStatusOrderByOrderDateDesc(Order.OrderStatus status);

    // Analytics queries
    @Query("SELECT COUNT(o) FROM Order o")
    Long countTotalOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countOrdersByStatus(@Param("status") Order.OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN ('DELIVERED', 'SHIPPED', 'OUT_FOR_DELIVERY')")
    BigDecimal getTotalRevenue();

    @Query("SELECT COALESCE(AVG(o.totalAmount), 0) FROM Order o")
    BigDecimal getAverageOrderValue();

    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findAllOrdersByOrderDateDesc();

    // Security: Ensure guest orders can only be tracked by order number, not by ID
    @Query("SELECT o FROM Order o WHERE o.orderNumber = :orderNumber AND (o.customer IS NULL OR o.customer.id = :customerId)")
    Optional<Order> findByOrderNumberAndCustomerId(@Param("orderNumber") String orderNumber, @Param("customerId") Long customerId);
}
