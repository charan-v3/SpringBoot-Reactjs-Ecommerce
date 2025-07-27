package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.service.CustomerService;
import com.cart.ecom_proj.service.OrderService;
import com.cart.ecom_proj.service.ProductService;
import com.cart.ecom_proj.service.AdminService;
import com.cart.ecom_proj.model.Customer;
import com.cart.ecom_proj.util.JwtUtil;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin
public class AnalyticsController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> getAdminDashboard(@RequestHeader("Authorization") String token) {
        try {
            System.out.println("Admin dashboard request received");
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            System.out.println("Extracted role: " + role);

            if (!"ADMIN".equals(role)) {
                System.out.println("Access denied for role: " + role);
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Map<String, Object> dashboardData = new HashMap<>();

            try {
                // Get customer analytics
                System.out.println("Fetching customer analytics...");
                Map<String, Object> customerAnalytics = customerService.getAllCustomersAnalytics();
                dashboardData.put("customerAnalytics", customerAnalytics);
                System.out.println("Customer analytics fetched successfully");
            } catch (Exception e) {
                System.err.println("Error fetching customer analytics: " + e.getMessage());
                dashboardData.put("customerAnalytics", Map.of("error", "Failed to fetch customer analytics"));
            }

            try {
                // Get order analytics
                System.out.println("Fetching order analytics...");
                Map<String, Object> orderAnalytics = getOrderAnalytics();
                dashboardData.put("orderAnalytics", orderAnalytics);
                System.out.println("Order analytics fetched successfully");
            } catch (Exception e) {
                System.err.println("Error fetching order analytics: " + e.getMessage());
                dashboardData.put("orderAnalytics", Map.of("error", "Failed to fetch order analytics"));
            }

            try {
                // Get product analytics
                System.out.println("Fetching product analytics...");
                Map<String, Object> productAnalytics = getProductAnalytics();
                dashboardData.put("productAnalytics", productAnalytics);
                System.out.println("Product analytics fetched successfully");
            } catch (Exception e) {
                System.err.println("Error fetching product analytics: " + e.getMessage());
                dashboardData.put("productAnalytics", Map.of("error", "Failed to fetch product analytics"));
            }

            try {
                // Get admin verification stats
                System.out.println("Fetching admin stats...");
                Map<String, Object> adminStats = getAdminStats();
                dashboardData.put("adminStats", adminStats);
                System.out.println("Admin stats fetched successfully");
            } catch (Exception e) {
                System.err.println("Error fetching admin stats: " + e.getMessage());
                dashboardData.put("adminStats", Map.of("error", "Failed to fetch admin stats"));
            }

            System.out.println("Dashboard data prepared successfully");
            return new ResponseEntity<>(dashboardData, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Dashboard error: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(Map.of("error", "Failed to fetch dashboard data: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getCustomerAnalytics(@RequestHeader("Authorization") String token,
                                                 @PathVariable Long customerId) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long requestingUserId = jwtUtil.extractUserId(jwt);
            
            // Allow admin to view any customer's analytics, or customer to view their own
            if (!"ADMIN".equals(role) && !requestingUserId.equals(customerId)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Map<String, Object> analytics = customerService.getCustomerAnalytics(customerId);
            return new ResponseEntity<>(analytics, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to fetch customer analytics"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/customers/filtered")
    public ResponseEntity<?> getFilteredCustomers(@RequestHeader("Authorization") String token,
                                                 @RequestParam(required = false) String sortBy,
                                                 @RequestParam(required = false) String sortOrder,
                                                 @RequestParam(required = false) Integer minVisits,
                                                 @RequestParam(required = false) Integer maxVisits,
                                                 @RequestParam(required = false) Integer minPurchases,
                                                 @RequestParam(required = false) Integer maxPurchases,
                                                 @RequestParam(required = false) String searchTerm) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);

            if (!"ADMIN".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            List<Customer> customers = customerService.getAllCustomers();

            // Apply filters
            if (minVisits != null) {
                customers = customers.stream()
                    .filter(c -> c.getVisitCount() >= minVisits)
                    .toList();
            }
            if (maxVisits != null) {
                customers = customers.stream()
                    .filter(c -> c.getVisitCount() <= maxVisits)
                    .toList();
            }
            if (minPurchases != null) {
                customers = customers.stream()
                    .filter(c -> c.getPurchaseCount() >= minPurchases)
                    .toList();
            }
            if (maxPurchases != null) {
                customers = customers.stream()
                    .filter(c -> c.getPurchaseCount() <= maxPurchases)
                    .toList();
            }
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                String search = searchTerm.toLowerCase();
                customers = customers.stream()
                    .filter(c -> c.getUsername().toLowerCase().contains(search) ||
                               c.getEmail().toLowerCase().contains(search) ||
                               (c.getFirstName() != null && c.getFirstName().toLowerCase().contains(search)) ||
                               (c.getLastName() != null && c.getLastName().toLowerCase().contains(search)))
                    .toList();
            }

            // Apply sorting
            if (sortBy != null) {
                boolean ascending = !"desc".equalsIgnoreCase(sortOrder);
                customers = customers.stream()
                    .sorted((c1, c2) -> {
                        int result = 0;
                        switch (sortBy.toLowerCase()) {
                            case "username":
                                result = c1.getUsername().compareToIgnoreCase(c2.getUsername());
                                break;
                            case "email":
                                result = c1.getEmail().compareToIgnoreCase(c2.getEmail());
                                break;
                            case "visitcount":
                                result = Integer.compare(Math.toIntExact(c1.getVisitCount()), Math.toIntExact(c2.getVisitCount()));
                                break;
                            case "purchasecount":
                                result = Integer.compare(Math.toIntExact(c1.getPurchaseCount()), Math.toIntExact(c2.getPurchaseCount()));
                                break;
                            case "createdat":
                                result = c1.getCreatedAt().compareTo(c2.getCreatedAt());
                                break;
                            default:
                                result = c1.getUsername().compareToIgnoreCase(c2.getUsername());
                        }
                        return ascending ? result : -result;
                    })
                    .toList();
            }

            // Remove sensitive information
            customers.forEach(customer -> customer.setPassword(null));

            return new ResponseEntity<>(customers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to fetch filtered customers"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            long totalAdmins = adminService.getVerifiedAdmins().size();
            long pendingAdmins = adminService.getUnverifiedAdminCount();

            stats.put("totalAdmins", totalAdmins);
            stats.put("pendingAdmins", pendingAdmins);
            stats.put("totalAdminRequests", totalAdmins + pendingAdmins);

        } catch (Exception e) {
            // Handle error
        }

        return stats;
    }

    private Map<String, Object> getOrderAnalytics() {
        try {
            return orderService.getOrderAnalytics();
        } catch (Exception e) {
            // Return default values on error
            Map<String, Object> analytics = new HashMap<>();
            analytics.put("totalOrders", 0);
            analytics.put("pendingOrders", 0);
            analytics.put("completedOrders", 0);
            analytics.put("totalRevenue", 0.0);
            analytics.put("averageOrderValue", 0.0);
            return analytics;
        }
    }

    private Map<String, Object> getProductAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        try {
            analytics.put("totalProducts", productService.getAllProducts().size());
            analytics.put("lowStockProducts", 0); // Would need additional method
            analytics.put("outOfStockProducts", 0); // Would need additional method
            analytics.put("topSellingProducts", Map.of()); // Would need additional method
            
        } catch (Exception e) {
            // Handle error
        }
        
        return analytics;
    }
}
