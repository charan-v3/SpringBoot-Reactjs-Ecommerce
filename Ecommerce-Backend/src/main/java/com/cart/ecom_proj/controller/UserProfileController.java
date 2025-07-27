package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.ProfileUpdateRequest;
import com.cart.ecom_proj.model.Admin;
import com.cart.ecom_proj.model.Customer;
import com.cart.ecom_proj.service.AdminService;
import com.cart.ecom_proj.service.CustomerService;
import com.cart.ecom_proj.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin
public class UserProfileController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/customer")
    public ResponseEntity<?> getCustomerProfile(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long customerId = jwtUtil.extractUserId(jwt);
            
            if (!"CUSTOMER".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Optional<Customer> customerOpt = customerService.findById(customerId);
            if (customerOpt.isPresent()) {
                Customer customer = customerOpt.get();
                // Remove password from response
                customer.setPassword(null);
                return new ResponseEntity<>(customer, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(Map.of("error", "Customer not found"), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to fetch profile"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAdminProfile(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long adminId = jwtUtil.extractUserId(jwt);
            
            if (!"ADMIN".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Optional<Admin> adminOpt = adminService.findById(adminId);
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                // Remove password from response
                admin.setPassword(null);
                return new ResponseEntity<>(admin, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(Map.of("error", "Admin not found"), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to fetch profile"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/customer")
    public ResponseEntity<?> updateCustomerProfile(@RequestHeader("Authorization") String token,
                                                  @RequestBody ProfileUpdateRequest updateRequest) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long customerId = jwtUtil.extractUserId(jwt);
            
            if (!"CUSTOMER".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Optional<Customer> customerOpt = customerService.findById(customerId);
            if (customerOpt.isPresent()) {
                Customer customer = customerOpt.get();
                
                // Update fields
                if (updateRequest.getFirstName() != null) {
                    customer.setFirstName(updateRequest.getFirstName());
                }
                if (updateRequest.getLastName() != null) {
                    customer.setLastName(updateRequest.getLastName());
                }
                if (updateRequest.getPhoneNumber() != null) {
                    customer.setPhoneNumber(updateRequest.getPhoneNumber());
                }
                if (updateRequest.getAddress() != null) {
                    customer.setAddress(updateRequest.getAddress());
                }
                if (updateRequest.getEmailNotifications() != null) {
                    customer.setEmailNotifications(updateRequest.getEmailNotifications());
                }
                if (updateRequest.getSmsNotifications() != null) {
                    customer.setSmsNotifications(updateRequest.getSmsNotifications());
                }
                
                Customer updatedCustomer = customerService.updateCustomer(customer);
                updatedCustomer.setPassword(null); // Remove password from response
                return new ResponseEntity<>(updatedCustomer, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(Map.of("error", "Customer not found"), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to update profile"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/admin")
    public ResponseEntity<?> updateAdminProfile(@RequestHeader("Authorization") String token,
                                              @RequestBody ProfileUpdateRequest updateRequest) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long adminId = jwtUtil.extractUserId(jwt);
            
            if (!"ADMIN".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Optional<Admin> adminOpt = adminService.findById(adminId);
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                
                // Update fields
                if (updateRequest.getFirstName() != null) {
                    admin.setFirstName(updateRequest.getFirstName());
                }
                if (updateRequest.getLastName() != null) {
                    admin.setLastName(updateRequest.getLastName());
                }
                if (updateRequest.getPhoneNumber() != null) {
                    admin.setPhoneNumber(updateRequest.getPhoneNumber());
                }
                if (updateRequest.getAddress() != null) {
                    admin.setAddress(updateRequest.getAddress());
                }
                if (updateRequest.getDepartment() != null) {
                    admin.setDepartment(updateRequest.getDepartment());
                }
                
                Admin updatedAdmin = adminService.updateAdmin(admin);
                updatedAdmin.setPassword(null); // Remove password from response
                return new ResponseEntity<>(updatedAdmin, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(Map.of("error", "Admin not found"), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to update profile"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String token,
                                          @RequestBody Map<String, String> passwordData) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long userId = jwtUtil.extractUserId(jwt);
            
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return new ResponseEntity<>(Map.of("error", "Current password and new password are required"), HttpStatus.BAD_REQUEST);
            }

            if ("CUSTOMER".equals(role)) {
                Optional<Customer> customerOpt = customerService.findById(userId);
                if (customerOpt.isPresent()) {
                    Customer customer = customerOpt.get();
                    
                    if (!passwordEncoder.matches(currentPassword, customer.getPassword())) {
                        return new ResponseEntity<>(Map.of("error", "Current password is incorrect"), HttpStatus.BAD_REQUEST);
                    }
                    
                    customer.setPassword(passwordEncoder.encode(newPassword));
                    customerService.updateCustomer(customer);
                    return new ResponseEntity<>(Map.of("message", "Password updated successfully"), HttpStatus.OK);
                }
            } else if ("ADMIN".equals(role)) {
                Optional<Admin> adminOpt = adminService.findById(userId);
                if (adminOpt.isPresent()) {
                    Admin admin = adminOpt.get();
                    
                    if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
                        return new ResponseEntity<>(Map.of("error", "Current password is incorrect"), HttpStatus.BAD_REQUEST);
                    }
                    
                    admin.setPassword(passwordEncoder.encode(newPassword));
                    adminService.updateAdmin(admin);
                    return new ResponseEntity<>(Map.of("message", "Password updated successfully"), HttpStatus.OK);
                }
            }
            
            return new ResponseEntity<>(Map.of("error", "User not found"), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to change password"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
