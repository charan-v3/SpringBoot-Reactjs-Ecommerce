package com.cart.ecom_proj;

import com.cart.ecom_proj.model.Customer;
import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.repo.CustomerRepo;
import com.cart.ecom_proj.repo.OrderRepo;
import com.cart.ecom_proj.service.OrderService;
import com.cart.ecom_proj.dto.OrderResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class OrderSecurityTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private CustomerRepo customerRepo;

    private Customer customer1;
    private Customer customer2;
    private Order order1;
    private Order order2;
    private Order guestOrder;

    @BeforeEach
    void setUp() {
        // Create test customers
        customer1 = new Customer();
        customer1.setUsername("customer1");
        customer1.setEmail("customer1@test.com");
        customer1.setPassword("password");
        customer1 = customerRepo.save(customer1);

        customer2 = new Customer();
        customer2.setUsername("customer2");
        customer2.setEmail("customer2@test.com");
        customer2.setPassword("password");
        customer2 = customerRepo.save(customer2);

        // Create test orders
        order1 = new Order();
        order1.setCustomer(customer1);
        order1.setOrderNumber("ORD001");
        order1.setTotalAmount(new BigDecimal("100.00"));
        order1.setStatus(Order.OrderStatus.PENDING);
        order1.setOrderDate(LocalDateTime.now());
        order1.setShippingAddress("Address 1");
        order1 = orderRepo.save(order1);

        order2 = new Order();
        order2.setCustomer(customer2);
        order2.setOrderNumber("ORD002");
        order2.setTotalAmount(new BigDecimal("200.00"));
        order2.setStatus(Order.OrderStatus.CONFIRMED);
        order2.setOrderDate(LocalDateTime.now());
        order2.setShippingAddress("Address 2");
        order2 = orderRepo.save(order2);

        // Create guest order
        guestOrder = new Order();
        guestOrder.setCustomer(null);
        guestOrder.setOrderNumber("ORD003");
        guestOrder.setTotalAmount(new BigDecimal("50.00"));
        guestOrder.setStatus(Order.OrderStatus.PENDING);
        guestOrder.setOrderDate(LocalDateTime.now());
        guestOrder.setShippingAddress("Guest Address");
        guestOrder.setGuestCustomerName("Guest User");
        guestOrder.setGuestCustomerEmail("guest@test.com");
        guestOrder = orderRepo.save(guestOrder);
    }

    @Test
    void testCustomerCanOnlyAccessOwnOrders() {
        // Customer 1 should only see their own orders
        List<OrderResponse> customer1Orders = orderService.getCustomerOrders(customer1.getId());
        assertEquals(1, customer1Orders.size());
        assertEquals("ORD001", customer1Orders.get(0).getOrderNumber());

        // Customer 2 should only see their own orders
        List<OrderResponse> customer2Orders = orderService.getCustomerOrders(customer2.getId());
        assertEquals(1, customer2Orders.size());
        assertEquals("ORD002", customer2Orders.get(0).getOrderNumber());
    }

    @Test
    void testCustomerCannotAccessOtherCustomerOrders() {
        // Customer 1 should not be able to access Customer 2's order
        Optional<OrderResponse> result = orderService.getOrderById(customer1.getId(), order2.getId());
        assertFalse(result.isPresent());

        // Customer 2 should not be able to access Customer 1's order
        result = orderService.getOrderById(customer2.getId(), order1.getId());
        assertFalse(result.isPresent());
    }

    @Test
    void testCustomerCanAccessOwnOrderById() {
        // Customer 1 should be able to access their own order
        Optional<OrderResponse> result = orderService.getOrderById(customer1.getId(), order1.getId());
        assertTrue(result.isPresent());
        assertEquals("ORD001", result.get().getOrderNumber());

        // Customer 2 should be able to access their own order
        result = orderService.getOrderById(customer2.getId(), order2.getId());
        assertTrue(result.isPresent());
        assertEquals("ORD002", result.get().getOrderNumber());
    }

    @Test
    void testSecureOrderTracking() {
        // Authenticated customer should be able to track their own order
        Optional<OrderResponse> result = orderService.trackOrderSecure("ORD001", customer1.getId());
        assertTrue(result.isPresent());
        assertEquals("ORD001", result.get().getOrderNumber());

        // Authenticated customer should not be able to track other customer's order
        result = orderService.trackOrderSecure("ORD002", customer1.getId());
        assertFalse(result.isPresent());

        // Guest user should be able to track guest orders
        result = orderService.trackOrderSecure("ORD003", null);
        assertTrue(result.isPresent());
        assertEquals("ORD003", result.get().getOrderNumber());

        // Guest user should not be able to track registered customer orders
        result = orderService.trackOrderSecure("ORD001", null);
        assertFalse(result.isPresent());
    }

    @Test
    void testOrderAnalytics() {
        // Test that order analytics return correct data
        var analytics = orderService.getOrderAnalytics();
        
        assertNotNull(analytics);
        assertTrue(analytics.containsKey("totalOrders"));
        assertTrue(analytics.containsKey("pendingOrders"));
        assertTrue(analytics.containsKey("completedOrders"));
        assertTrue(analytics.containsKey("totalRevenue"));
        assertTrue(analytics.containsKey("averageOrderValue"));
        
        // Should have at least 3 orders (2 customer + 1 guest)
        assertTrue((Long) analytics.get("totalOrders") >= 3);
        assertTrue((Long) analytics.get("pendingOrders") >= 2); // order1 and guestOrder are pending
    }

    @Test
    void testRepositorySecurityQueries() {
        // Test that repository queries respect customer boundaries
        List<Order> customer1Orders = orderRepo.findOrdersByCustomerId(customer1.getId());
        assertEquals(1, customer1Orders.size());
        assertEquals("ORD001", customer1Orders.get(0).getOrderNumber());

        Optional<Order> result = orderRepo.findByCustomerIdAndOrderId(customer1.getId(), order1.getId());
        assertTrue(result.isPresent());

        // Should not find order2 for customer1
        result = orderRepo.findByCustomerIdAndOrderId(customer1.getId(), order2.getId());
        assertFalse(result.isPresent());
    }

    @Test
    void testGuestOrderSecurity() {
        // Guest orders should not be accessible by customer ID queries
        List<Order> customer1Orders = orderRepo.findOrdersByCustomerId(customer1.getId());
        assertEquals(1, customer1Orders.size());
        assertNotEquals("ORD003", customer1Orders.get(0).getOrderNumber());

        // Guest order should be findable by order number only
        Optional<Order> guestOrderResult = orderRepo.findByOrderNumber("ORD003");
        assertTrue(guestOrderResult.isPresent());
        assertNull(guestOrderResult.get().getCustomer());
    }
}
