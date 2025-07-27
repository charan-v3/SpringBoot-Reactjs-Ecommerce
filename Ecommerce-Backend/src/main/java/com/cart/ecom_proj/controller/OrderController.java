package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.OrderRequest;
import com.cart.ecom_proj.dto.OrderResponse;
import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.repo.OrderRepo;
import com.cart.ecom_proj.service.OrderService;
import com.cart.ecom_proj.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestHeader(value = "Authorization", required = false) String token,
                                       @RequestBody OrderRequest orderRequest) {
        try {
            Long customerId = null;

            // Check if user is authenticated
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                customerId = jwtUtil.extractUserId(jwt);
            }

            OrderResponse order = orderService.createOrder(customerId, orderRequest);
            return new ResponseEntity<>(order, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to create order"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<?> getCustomerOrders(@RequestHeader("Authorization") String token) {
        try {
            System.out.println("Customer orders request received");
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long userId = jwtUtil.extractUserId(jwt);

            System.out.println("Extracted role: " + role + ", userId: " + userId);

            // Only customers can access this endpoint
            if (!"CUSTOMER".equals(role)) {
                System.out.println("Access denied for role: " + role + " - This endpoint is for customers only");
                return new ResponseEntity<>(Map.of("error", "Access denied. This endpoint is for customers only."), HttpStatus.FORBIDDEN);
            }

            System.out.println("Customer access granted, fetching orders for customer ID: " + userId);
            List<OrderResponse> orders = orderService.getCustomerOrders(userId);
            System.out.println("Found " + orders.size() + " orders for customer");
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error in getCustomerOrders: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(Map.of("error", "Failed to fetch orders: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@RequestHeader("Authorization") String token,
                                        @PathVariable Long orderId) {
        try {
            System.out.println("Customer order detail request for order ID: " + orderId);
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long userId = jwtUtil.extractUserId(jwt);

            System.out.println("Extracted role: " + role + ", userId: " + userId);

            // Only customers can access this endpoint
            if (!"CUSTOMER".equals(role)) {
                System.out.println("Access denied for role: " + role + " - This endpoint is for customers only");
                return new ResponseEntity<>(Map.of("error", "Access denied. This endpoint is for customers only."), HttpStatus.FORBIDDEN);
            }

            System.out.println("Customer access granted, fetching order " + orderId + " for customer ID: " + userId);
            Optional<OrderResponse> order = orderService.getOrderById(userId, orderId);
            if (order.isPresent()) {
                System.out.println("Order found and returned");
                return new ResponseEntity<>(order.get(), HttpStatus.OK);
            } else {
                System.out.println("Order not found or access denied");
                return new ResponseEntity<>(Map.of("error", "Order not found or access denied"), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("Error in getOrderById: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(Map.of("error", "Failed to fetch order: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<?> trackOrder(@RequestHeader(value = "Authorization", required = false) String token,
                                      @PathVariable String orderNumber) {
        try {
            Long customerId = null;

            // Check if user is authenticated
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                customerId = jwtUtil.extractUserId(jwt);
            }

            Optional<OrderResponse> order = orderService.trackOrderSecure(orderNumber, customerId);
            if (order.isPresent()) {
                return new ResponseEntity<>(order.get(), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(Map.of("error", "Order not found or access denied"), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to track order"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Admin endpoints
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllOrders(@RequestHeader("Authorization") String token) {
        try {
            System.out.println("Admin all orders request received");
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long userId = jwtUtil.extractUserId(jwt);

            System.out.println("Extracted role: " + role + ", userId: " + userId);

            if (!"ADMIN".equals(role)) {
                System.out.println("Access denied for role: " + role + " - Admin role required");
                return new ResponseEntity<>(Map.of("error", "Access denied. Admin role required."), HttpStatus.FORBIDDEN);
            }

            System.out.println("Admin access granted, fetching all orders");
            List<OrderResponse> orders = orderService.getAllOrders();
            System.out.println("Found " + orders.size() + " total orders");
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error in getAllOrders (admin): " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(Map.of("error", "Failed to fetch orders: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/admin/order/{orderId}")
    public ResponseEntity<?> getOrderByIdAdmin(@RequestHeader("Authorization") String token,
                                             @PathVariable Long orderId) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);

            if (!"ADMIN".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Optional<Order> order = orderRepo.findById(orderId);
            if (order.isPresent()) {
                return new ResponseEntity<>(new OrderResponse(order.get()), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(Map.of("error", "Order not found"), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to fetch order"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@RequestHeader("Authorization") String token,
                                             @PathVariable Long orderId,
                                             @RequestBody Map<String, String> statusUpdate) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);

            if (!"ADMIN".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            String statusStr = statusUpdate.get("status");
            Order.OrderStatus status = Order.OrderStatus.valueOf(statusStr.toUpperCase());
            
            OrderResponse order = orderService.updateOrderStatus(orderId, status);
            return new ResponseEntity<>(order, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(Map.of("error", "Invalid status"), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to update order status"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
