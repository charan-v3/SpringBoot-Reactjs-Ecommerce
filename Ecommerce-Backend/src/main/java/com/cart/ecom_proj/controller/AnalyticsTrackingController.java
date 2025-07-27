package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.service.CustomerService;
import com.cart.ecom_proj.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/analytics")
public class AnalyticsTrackingController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Track page visits for authenticated customers
     */
    @PostMapping("/track-visit")
    public ResponseEntity<?> trackPageVisit(@RequestHeader(value = "Authorization", required = false) String token,
                                          @RequestBody Map<String, String> visitData,
                                          HttpServletRequest request) {
        try {
            // Only track for authenticated customers
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                Long customerId = jwtUtil.extractUserId(jwt);
                String role = jwtUtil.extractRole(jwt);
                
                if ("CUSTOMER".equals(role)) {
                    String sessionId = request.getSession().getId();
                    String ipAddress = getClientIpAddress(request);
                    String userAgent = request.getHeader("User-Agent");
                    String pageUrl = visitData.get("pageUrl");
                    String referrer = visitData.get("referrer");
                    
                    customerService.trackCustomerVisit(customerId, sessionId, ipAddress, userAgent, pageUrl, referrer);
                    
                    return new ResponseEntity<>(Map.of("status", "success", "message", "Visit tracked"), HttpStatus.OK);
                }
            }
            
            return new ResponseEntity<>(Map.of("status", "ignored", "message", "Visit not tracked - not authenticated customer"), HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error tracking visit: " + e.getMessage());
            return new ResponseEntity<>(Map.of("status", "error", "message", "Failed to track visit"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Track specific customer activities
     */
    @PostMapping("/track-activity")
    public ResponseEntity<?> trackActivity(@RequestHeader(value = "Authorization", required = false) String token,
                                         @RequestBody Map<String, String> activityData,
                                         HttpServletRequest request) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                Long customerId = jwtUtil.extractUserId(jwt);
                String role = jwtUtil.extractRole(jwt);
                
                if ("CUSTOMER".equals(role)) {
                    String sessionId = request.getSession().getId();
                    String activityType = activityData.get("activityType");
                    String additionalData = activityData.get("additionalData");
                    
                    // Map string to enum
                    try {
                        com.cart.ecom_proj.model.CustomerActivity.ActivityType type = 
                            com.cart.ecom_proj.model.CustomerActivity.ActivityType.valueOf(activityType);
                        
                        customerService.trackActivity(customerId, type, sessionId, additionalData);
                        
                        return new ResponseEntity<>(Map.of("status", "success", "message", "Activity tracked"), HttpStatus.OK);
                    } catch (IllegalArgumentException e) {
                        return new ResponseEntity<>(Map.of("status", "error", "message", "Invalid activity type"), HttpStatus.BAD_REQUEST);
                    }
                }
            }
            
            return new ResponseEntity<>(Map.of("status", "ignored", "message", "Activity not tracked - not authenticated customer"), HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error tracking activity: " + e.getMessage());
            return new ResponseEntity<>(Map.of("status", "error", "message", "Failed to track activity"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
