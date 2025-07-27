package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.model.Admin;
import com.cart.ecom_proj.service.AdminService;
import com.cart.ecom_proj.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/verification")
@CrossOrigin
public class AdminVerificationController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingAdminRequests(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            
            if (!"ADMIN".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            List<Admin> pendingAdmins = adminService.getUnverifiedAdmins();
            
            // Remove sensitive information
            pendingAdmins.forEach(admin -> admin.setPassword(null));
            
            return new ResponseEntity<>(pendingAdmins, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to fetch pending requests"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/count")
    public ResponseEntity<?> getPendingAdminCount(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            
            if (!"ADMIN".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            long count = adminService.getUnverifiedAdminCount();
            return new ResponseEntity<>(Map.of("count", count), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to fetch count"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/approve/{adminId}")
    public ResponseEntity<?> approveAdmin(@RequestHeader("Authorization") String token,
                                        @PathVariable Long adminId) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long verifyingAdminId = jwtUtil.extractUserId(jwt);
            
            if (!"ADMIN".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Admin approvedAdmin = adminService.verifyAdmin(adminId, verifyingAdminId);
            approvedAdmin.setPassword(null); // Remove password from response
            
            return new ResponseEntity<>(Map.of(
                "message", "Admin approved successfully",
                "admin", approvedAdmin
            ), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to approve admin"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/reject/{adminId}")
    public ResponseEntity<?> rejectAdmin(@RequestHeader("Authorization") String token,
                                       @PathVariable Long adminId) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            
            if (!"ADMIN".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            adminService.rejectAdmin(adminId);
            
            return new ResponseEntity<>(Map.of("message", "Admin request rejected successfully"), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to reject admin"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/verified")
    public ResponseEntity<?> getVerifiedAdmins(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            
            if (!"ADMIN".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            List<Admin> verifiedAdmins = adminService.getVerifiedAdmins();
            
            // Remove sensitive information
            verifiedAdmins.forEach(admin -> admin.setPassword(null));
            
            return new ResponseEntity<>(verifiedAdmins, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to fetch verified admins"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/my-approvals")
    public ResponseEntity<?> getMyApprovals(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long adminId = jwtUtil.extractUserId(jwt);
            
            if (!"ADMIN".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            List<Admin> approvedByMe = adminService.getAdminsVerifiedBy(adminId);
            
            // Remove sensitive information
            approvedByMe.forEach(admin -> admin.setPassword(null));
            
            return new ResponseEntity<>(approvedByMe, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to fetch approvals"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
