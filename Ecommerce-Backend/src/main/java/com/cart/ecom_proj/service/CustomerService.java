package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.CustomerAnalyticsDto;
import com.cart.ecom_proj.dto.SignupRequest;
import com.cart.ecom_proj.model.Customer;
import com.cart.ecom_proj.model.CustomerActivity;
import com.cart.ecom_proj.repo.CustomerRepo;
import com.cart.ecom_proj.repo.CustomerActivityRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepo customerRepo;

    @Autowired
    private CustomerActivityRepo customerActivityRepo;

    @Autowired
    private VisitTrackingService visitTrackingService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Customer createCustomer(SignupRequest signupRequest) {
        if (customerRepo.existsByUsername(signupRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (customerRepo.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        Customer customer = new Customer();
        customer.setUsername(signupRequest.getUsername());
        customer.setEmail(signupRequest.getEmail());
        customer.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        customer.setFirstName(signupRequest.getFirstName());
        customer.setLastName(signupRequest.getLastName());
        customer.setPhoneNumber(signupRequest.getPhoneNumber());
        customer.setAddress(signupRequest.getAddress());
        customer.setEnabled(true);
        customer.setCreatedAt(LocalDateTime.now());
        customer.setEmailNotifications(true);
        customer.setSmsNotifications(false);

        return customerRepo.save(customer);
    }

    public Optional<Customer> findByUsername(String username) {
        return customerRepo.findByUsername(username);
    }

    public Optional<Customer> findByEmail(String email) {
        return customerRepo.findByEmail(email);
    }

    public Optional<Customer> findByUsernameOrEmail(String username, String email) {
        return customerRepo.findByUsernameOrEmail(username, email);
    }

    public boolean existsByUsername(String username) {
        return customerRepo.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return customerRepo.existsByEmail(email);
    }

    public Customer updateCustomer(Customer customer) {
        customer.setUpdatedAt(LocalDateTime.now());
        return customerRepo.save(customer);
    }

    public void deleteCustomer(Long id) {
        customerRepo.deleteById(id);
    }

    public Optional<Customer> findById(Long id) {
        return customerRepo.findById(id);
    }

    public List<Customer> getAllCustomers() {
        return customerRepo.findAll();
    }

    public boolean authenticateCustomer(String usernameOrEmail, String password) {
        Optional<Customer> customerOpt = customerRepo.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            return passwordEncoder.matches(password, customer.getPassword()) && customer.isEnabled();
        }
        return false;
    }

    @Transactional
    public void trackCustomerVisit(Long customerId, String sessionId, String ipAddress, String userAgent, String pageUrl, String referrer) {
        Optional<Customer> customerOpt = customerRepo.findById(customerId);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();

            // Check if we should track this visit (avoid duplicate counting in same session)
            boolean shouldTrack = visitTrackingService.shouldTrackVisit(sessionId, customerId);

            if (shouldTrack) {
                // Update customer visit count and last visit time
                customer.setVisitCount(customer.getVisitCount() + 1);
                customer.setLastVisitAt(LocalDateTime.now());
                customer.setUpdatedAt(LocalDateTime.now());
                customerRepo.save(customer);
            }

            // Always create activity record for detailed tracking
            CustomerActivity activity = new CustomerActivity();
            activity.setCustomer(customer);
            activity.setActivityType(CustomerActivity.ActivityType.PRODUCT_VIEW);
            activity.setActivityTime(LocalDateTime.now());
            activity.setSessionId(sessionId);
            activity.setIpAddress(ipAddress);
            activity.setUserAgent(userAgent);
            activity.setPageUrl(pageUrl);
            activity.setReferrer(referrer);

            customerActivityRepo.save(activity);
        }
    }

    @Transactional
    public void trackCustomerPurchase(Long customerId, String orderNumber, String sessionId) {
        Optional<Customer> customerOpt = customerRepo.findById(customerId);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            
            // Update customer purchase count and last purchase time
            customer.setPurchaseCount(customer.getPurchaseCount() + 1);
            customer.setLastPurchaseAt(LocalDateTime.now());
            customer.setUpdatedAt(LocalDateTime.now());
            customerRepo.save(customer);
            
            // Create purchase activity record
            CustomerActivity activity = new CustomerActivity();
            activity.setCustomer(customer);
            activity.setActivityType(CustomerActivity.ActivityType.ORDER_PLACED);
            activity.setActivityTime(LocalDateTime.now());
            activity.setSessionId(sessionId);
            activity.setAdditionalData(orderNumber);
            
            customerActivityRepo.save(activity);
        }
    }

    @Transactional
    public void trackActivity(Long customerId, CustomerActivity.ActivityType activityType, String sessionId, String additionalData) {
        Optional<Customer> customerOpt = customerRepo.findById(customerId);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            
            CustomerActivity activity = new CustomerActivity();
            activity.setCustomer(customer);
            activity.setActivityType(activityType);
            activity.setActivityTime(LocalDateTime.now());
            activity.setSessionId(sessionId);
            activity.setAdditionalData(additionalData);
            
            customerActivityRepo.save(activity);
        }
    }

    public List<CustomerActivity> getCustomerActivities(Long customerId) {
        Optional<Customer> customerOpt = customerRepo.findById(customerId);
        if (customerOpt.isPresent()) {
            return customerActivityRepo.findByCustomerOrderByActivityTimeDesc(customerOpt.get());
        }
        return List.of();
    }

    public Map<String, Object> getCustomerAnalytics(Long customerId) {
        Optional<Customer> customerOpt = customerRepo.findById(customerId);
        if (!customerOpt.isPresent()) {
            return Map.of();
        }
        
        Customer customer = customerOpt.get();
        Map<String, Object> analytics = new HashMap<>();
        
        analytics.put("customerId", customer.getId());
        analytics.put("username", customer.getUsername());
        analytics.put("visitCount", customer.getVisitCount());
        analytics.put("purchaseCount", customer.getPurchaseCount());
        analytics.put("lastVisitAt", customer.getLastVisitAt());
        analytics.put("lastPurchaseAt", customer.getLastPurchaseAt());
        analytics.put("memberSince", customer.getCreatedAt());
        
        // Get activity counts by type
        Map<String, Long> activityCounts = new HashMap<>();
        for (CustomerActivity.ActivityType type : CustomerActivity.ActivityType.values()) {
            Long count = customerActivityRepo.countCustomerActivitiesByType(customerId, type);
            activityCounts.put(type.name(), count);
        }
        analytics.put("activityCounts", activityCounts);
        
        return analytics;
    }

    public Map<String, Object> getAllCustomersAnalytics() {
        try {
            List<Customer> customers = customerRepo.findAll();
            Map<String, Object> analytics = new HashMap<>();

            long totalCustomers = customers.size();
            long totalVisits = customers.stream().mapToLong(Customer::getVisitCount).sum();
            long totalPurchases = customers.stream().mapToLong(Customer::getPurchaseCount).sum();

            analytics.put("totalCustomers", totalCustomers);
            analytics.put("totalVisits", totalVisits);
            analytics.put("totalPurchases", totalPurchases);
            analytics.put("averageVisitsPerCustomer", totalCustomers > 0 ? (double) totalVisits / totalCustomers : 0);
            analytics.put("averagePurchasesPerCustomer", totalCustomers > 0 ? (double) totalPurchases / totalCustomers : 0);

            // Top customers by visits - using safe DTO
            List<CustomerAnalyticsDto> topVisitors = customers.stream()
                    .sorted((c1, c2) -> Long.compare(c2.getVisitCount(), c1.getVisitCount()))
                    .limit(10)
                    .map(CustomerAnalyticsDto::new)
                    .toList();
            analytics.put("topVisitors", topVisitors);

            // Top customers by purchases - using safe DTO
            List<CustomerAnalyticsDto> topBuyers = customers.stream()
                    .sorted((c1, c2) -> Long.compare(c2.getPurchaseCount(), c1.getPurchaseCount()))
                    .limit(10)
                    .map(CustomerAnalyticsDto::new)
                    .toList();
            analytics.put("topBuyers", topBuyers);

            return analytics;
        } catch (Exception e) {
            System.err.println("Error in customer analytics: " + e.getMessage());
            e.printStackTrace();

            // Return safe default values
            Map<String, Object> analytics = new HashMap<>();
            analytics.put("totalCustomers", 0L);
            analytics.put("totalVisits", 0L);
            analytics.put("totalPurchases", 0L);
            analytics.put("averageVisitsPerCustomer", 0.0);
            analytics.put("averagePurchasesPerCustomer", 0.0);
            analytics.put("topVisitors", List.of());
            analytics.put("topBuyers", List.of());
            return analytics;
        }
    }
}
