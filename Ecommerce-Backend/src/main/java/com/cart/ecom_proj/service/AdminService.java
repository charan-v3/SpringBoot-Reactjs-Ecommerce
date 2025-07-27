package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.SignupRequest;
import com.cart.ecom_proj.model.Admin;
import com.cart.ecom_proj.repo.AdminRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepo adminRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Admin createAdmin(SignupRequest signupRequest) {
        try {
            // Validate required fields
            if (signupRequest.getUsername() == null || signupRequest.getUsername().trim().isEmpty()) {
                throw new RuntimeException("Username is required and cannot be empty");
            }

            if (signupRequest.getEmail() == null || signupRequest.getEmail().trim().isEmpty()) {
                throw new RuntimeException("Email is required and cannot be empty");
            }

            if (signupRequest.getPassword() == null || signupRequest.getPassword().length() < 6) {
                throw new RuntimeException("Password is required and must be at least 6 characters long");
            }

            if (signupRequest.getFirstName() == null || signupRequest.getFirstName().trim().isEmpty()) {
                throw new RuntimeException("First name is required and cannot be empty");
            }

            if (signupRequest.getLastName() == null || signupRequest.getLastName().trim().isEmpty()) {
                throw new RuntimeException("Last name is required and cannot be empty");
            }

            if (signupRequest.getUpiId() == null || signupRequest.getUpiId().trim().isEmpty()) {
                throw new RuntimeException("UPI ID is required for payment transfers. Please provide a valid UPI ID (e.g., 9976656631@axl)");
            }

            if (signupRequest.getRequestReason() == null || signupRequest.getRequestReason().trim().isEmpty()) {
                throw new RuntimeException("Request reason is required. Please explain why you want to become an admin");
            }

            if (signupRequest.getExperience() == null || signupRequest.getExperience().trim().isEmpty()) {
                throw new RuntimeException("Experience description is required. Please describe your relevant experience");
            }

            // Validate email format
            if (!signupRequest.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                throw new RuntimeException("Invalid email format. Please provide a valid email address");
            }

            // Validate UPI ID format
            if (!signupRequest.getUpiId().matches("^[0-9]{10}@[a-zA-Z]+$")) {
                throw new RuntimeException("Invalid UPI ID format. Please use format like: 9976656631@axl");
            }

            // Check if username already exists
            if (adminRepo.existsByUsername(signupRequest.getUsername())) {
                throw new RuntimeException("Username '" + signupRequest.getUsername() + "' is already taken. Please choose a different username");
            }

            // Check if email already exists
            if (adminRepo.existsByEmail(signupRequest.getEmail())) {
                throw new RuntimeException("Email '" + signupRequest.getEmail() + "' is already registered. Please use a different email address");
            }

            Admin admin = new Admin();
            admin.setUsername(signupRequest.getUsername().trim());
            admin.setEmail(signupRequest.getEmail().trim().toLowerCase());
            admin.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
            admin.setFirstName(signupRequest.getFirstName().trim());
            admin.setLastName(signupRequest.getLastName().trim());
            admin.setPhoneNumber(signupRequest.getPhoneNumber() != null ? signupRequest.getPhoneNumber().trim() : null);
            admin.setAddress(signupRequest.getAddress() != null ? signupRequest.getAddress().trim() : null);
            admin.setEnabled(true);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setRequestedAt(LocalDateTime.now());
            admin.setDepartment("General");
            admin.setPermissions("ALL");
            admin.setIsVerified(0); // New admins need verification (0 = not verified)
            admin.setUpiId(signupRequest.getUpiId().trim());
            admin.setRequestReason(signupRequest.getRequestReason().trim());
            admin.setExperience(signupRequest.getExperience().trim());

            return adminRepo.save(admin);

        } catch (RuntimeException e) {
            // Re-throw runtime exceptions with original message
            throw e;
        } catch (Exception e) {
            // Handle any other unexpected errors
            throw new RuntimeException("Admin registration failed due to an unexpected error: " + e.getMessage() + ". Please try again or contact support if the problem persists");
        }
    }

    public Optional<Admin> findByUsername(String username) {
        return adminRepo.findByUsername(username);
    }

    public Optional<Admin> findByEmail(String email) {
        return adminRepo.findByEmail(email);
    }

    public Optional<Admin> findByUsernameOrEmail(String username, String email) {
        return adminRepo.findByUsernameOrEmail(username, email);
    }

    public boolean existsByUsername(String username) {
        return adminRepo.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return adminRepo.existsByEmail(email);
    }

    public Admin updateAdmin(Admin admin) {
        admin.setUpdatedAt(LocalDateTime.now());
        return adminRepo.save(admin);
    }

    public void deleteAdmin(Long id) {
        adminRepo.deleteById(id);
    }

    public Optional<Admin> findById(Long id) {
        return adminRepo.findById(id);
    }

    public List<Admin> getAllAdmins() {
        return adminRepo.findAll();
    }

    public void updateLastLogin(Long adminId) {
        Optional<Admin> adminOpt = adminRepo.findById(adminId);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            admin.setLastLoginAt(LocalDateTime.now());
            admin.setLoginCount(admin.getLoginCount() + 1);
            admin.setUpdatedAt(LocalDateTime.now());
            adminRepo.save(admin);
        }
    }

    public boolean authenticateAdmin(String usernameOrEmail, String password) {
        Optional<Admin> adminOpt = adminRepo.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return passwordEncoder.matches(password, admin.getPassword()) && admin.isEnabled() && admin.isVerified();
        }
        return false;
    }

    public List<Admin> getUnverifiedAdmins() {
        return adminRepo.findByIsVerifiedFalseOrderByRequestedAtDesc();
    }

    public List<Admin> getVerifiedAdmins() {
        return adminRepo.findByIsVerifiedTrueOrderByCreatedAtDesc();
    }

    public long getUnverifiedAdminCount() {
        return adminRepo.countByIsVerifiedFalse();
    }

    public Admin verifyAdmin(Long adminId, Long verifyingAdminId) {
        Optional<Admin> adminOpt = adminRepo.findById(adminId);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            admin.setIsVerified(1); // Set to 1 for verified
            admin.setVerifiedByAdminId(verifyingAdminId);
            admin.setVerifiedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            return adminRepo.save(admin);
        }
        throw new RuntimeException("Admin not found");
    }

    public void rejectAdmin(Long adminId) {
        adminRepo.deleteById(adminId);
    }

    public List<Admin> getAdminsVerifiedBy(Long adminId) {
        return adminRepo.findAdminsVerifiedBy(adminId);
    }
}
