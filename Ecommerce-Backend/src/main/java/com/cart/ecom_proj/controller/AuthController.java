package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.AuthResponse;
import com.cart.ecom_proj.dto.LoginRequest;
import com.cart.ecom_proj.dto.SignupRequest;
import com.cart.ecom_proj.model.Admin;
import com.cart.ecom_proj.model.Customer;
import com.cart.ecom_proj.service.AdminService;
import com.cart.ecom_proj.service.CustomerService;
import com.cart.ecom_proj.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AdminService adminService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/customer/signup")
    public ResponseEntity<?> registerCustomer(@RequestBody SignupRequest signupRequest) {
        try {
            Customer customer = customerService.createCustomer(signupRequest);
            return ResponseEntity.ok(new AuthResponse("Customer registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    @PostMapping("/admin/signup")
    public ResponseEntity<?> registerAdmin(@RequestBody SignupRequest signupRequest) {
        try {
            Admin admin = adminService.createAdmin(signupRequest);
            return ResponseEntity.ok(new AuthResponse("Admin registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    @PostMapping("/customer/login")
    public ResponseEntity<?> authenticateCustomer(@RequestBody LoginRequest loginRequest) {
        try {
            // Find customer by username
            Optional<Customer> customerOptional = customerService.findByUsername(loginRequest.getUsername());

            if (customerOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(new AuthResponse("Customer not found"));
            }

            Customer customer = customerOptional.get();

            // Check password
            if (!passwordEncoder.matches(loginRequest.getPassword(), customer.getPassword())) {
                return ResponseEntity.badRequest().body(new AuthResponse("Invalid credentials"));
            }

            // Generate JWT token
            String jwt = jwtUtil.generateToken(customer.getUsername(), "CUSTOMER", customer.getId());

            return ResponseEntity.ok(new AuthResponse(jwt, customer.getUsername(), customer.getEmail(), "CUSTOMER"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse("Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> authenticateAdmin(@RequestBody LoginRequest loginRequest) {
        try {
            // Find admin by username
            Optional<Admin> adminOptional = adminService.findByUsername(loginRequest.getUsername());

            if (adminOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(new AuthResponse("Admin not found"));
            }

            Admin admin = adminOptional.get();

            // Check password
            if (!passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword())) {
                return ResponseEntity.badRequest().body(new AuthResponse("Invalid credentials"));
            }

            // Check if admin is verified
            if (!admin.isVerified()) {
                return ResponseEntity.badRequest().body(new AuthResponse("Your admin account is pending verification. Please wait for approval from an existing admin."));
            }

            // Update last login
            adminService.updateLastLogin(admin.getId());

            // Generate JWT token
            String jwt = jwtUtil.generateToken(admin.getUsername(), "ADMIN", admin.getId());

            return ResponseEntity.ok(new AuthResponse(jwt, admin.getUsername(), admin.getEmail(), "ADMIN"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse("Authentication failed: " + e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                return ResponseEntity.ok(new AuthResponse("Token is valid"));
            } else {
                return ResponseEntity.badRequest().body(new AuthResponse("Invalid token"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse("Token validation failed"));
        }
    }
}
