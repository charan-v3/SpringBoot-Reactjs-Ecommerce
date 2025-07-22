package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.AuthResponse;
import com.cart.ecom_proj.dto.LoginRequest;
import com.cart.ecom_proj.dto.SignupRequest;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.service.UserService;
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
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
        try {
            User user = userService.createUser(signupRequest);
            return ResponseEntity.ok(new AuthResponse("User registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            // Find user by username
            Optional<User> userOptional = userService.findByUsername(loginRequest.getUsername());
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(new AuthResponse("User not found"));
            }
            
            User user = userOptional.get();
            
            // Check password
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body(new AuthResponse("Invalid credentials"));
            }
            
            // Generate JWT token
            String jwt = jwtUtil.generateToken(user.getUsername(), user.getRole().toString());
            
            return ResponseEntity.ok(new AuthResponse(jwt, user.getUsername(), user.getEmail(), user.getRole().toString()));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse("Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/admin/signup")
    public ResponseEntity<?> registerAdmin(@RequestBody SignupRequest signupRequest) {
        try {
            signupRequest.setRole(User.Role.ADMIN);
            User user = userService.createUser(signupRequest);
            return ResponseEntity.ok(new AuthResponse("Admin registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    @PostMapping("/customer/signup")
    public ResponseEntity<?> registerCustomer(@RequestBody SignupRequest signupRequest) {
        try {
            signupRequest.setRole(User.Role.CUSTOMER);
            User user = userService.createUser(signupRequest);
            return ResponseEntity.ok(new AuthResponse("Customer registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
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
