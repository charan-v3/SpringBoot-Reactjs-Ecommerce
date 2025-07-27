package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.service.OrderService;
import com.cart.ecom_proj.service.CustomerService;
import com.cart.ecom_proj.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin
public class PaymentController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${razorpay.key.id:rzp_test_your_key_id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:your_key_secret}")
    private String razorpayKeySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createPaymentOrder(@RequestHeader("Authorization") String token,
                                              @RequestBody Map<String, Object> orderData) {
        try {
            String jwt = token.substring(7);
            Long customerId = jwtUtil.extractUserId(jwt);
            String role = jwtUtil.extractRole(jwt);
            
            if (!"CUSTOMER".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            // Extract order details
            Double amount = Double.valueOf(orderData.get("amount").toString());
            String currency = orderData.getOrDefault("currency", "INR").toString();
            String orderNumber = orderData.get("orderNumber").toString();

            // Create Razorpay order (simplified - in real implementation, use Razorpay SDK)
            Map<String, Object> razorpayOrder = new HashMap<>();
            razorpayOrder.put("id", "order_" + System.currentTimeMillis());
            razorpayOrder.put("amount", amount * 100); // Amount in paise
            razorpayOrder.put("currency", currency);
            razorpayOrder.put("status", "created");

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("razorpayOrderId", razorpayOrder.get("id"));
            response.put("amount", amount);
            response.put("currency", currency);
            response.put("keyId", razorpayKeyId);
            response.put("orderNumber", orderNumber);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to create payment order"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestHeader("Authorization") String token,
                                         @RequestBody Map<String, String> paymentData) {
        try {
            String jwt = token.substring(7);
            Long customerId = jwtUtil.extractUserId(jwt);
            String role = jwtUtil.extractRole(jwt);
            
            if (!"CUSTOMER".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            String razorpayPaymentId = paymentData.get("razorpayPaymentId");
            String razorpayOrderId = paymentData.get("razorpayOrderId");
            String razorpaySignature = paymentData.get("razorpaySignature");
            String orderNumber = paymentData.get("orderNumber");

            // Verify payment signature (simplified - in real implementation, use Razorpay SDK)
            boolean isValidSignature = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

            if (isValidSignature) {
                // Update order status to paid
                // orderService.updateOrderPaymentStatus(orderNumber, "PAID", razorpayPaymentId);
                
                // Track customer purchase
                customerService.trackCustomerPurchase(customerId, orderNumber, null);

                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Payment verified successfully");
                response.put("paymentId", razorpayPaymentId);

                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(Map.of("error", "Invalid payment signature"), HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Payment verification failed"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/upi-payment")
    public ResponseEntity<?> processUPIPayment(@RequestHeader(value = "Authorization", required = false) String token,
                                             @RequestBody Map<String, Object> paymentData) {
        try {
            Long customerId = null;

            // Handle both authenticated and guest users
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                customerId = jwtUtil.extractUserId(jwt);
                String role = jwtUtil.extractRole(jwt);

                if (!"CUSTOMER".equals(role)) {
                    return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
                }
            }

            String orderNumber = paymentData.get("orderNumber") != null ?
                paymentData.get("orderNumber").toString() : "ORDER_" + System.currentTimeMillis();
            String upiTransactionId = paymentData.get("upiTransactionId").toString();
            Double amount = Double.valueOf(paymentData.get("amount").toString());
            String timestamp = paymentData.get("timestamp") != null ?
                paymentData.get("timestamp").toString() : new Date().toString();

            // Validate UPI transaction ID format (basic validation)
            if (upiTransactionId.length() < 8) {
                return new ResponseEntity<>(Map.of("error", "Invalid UPI transaction ID format"), HttpStatus.BAD_REQUEST);
            }

            // Store payment details (in a real app, you'd save to database)
            Map<String, Object> paymentRecord = new HashMap<>();
            paymentRecord.put("upiTransactionId", upiTransactionId);
            paymentRecord.put("amount", amount);
            paymentRecord.put("orderNumber", orderNumber);
            paymentRecord.put("paymentMethod", "UPI");
            paymentRecord.put("status", "PENDING_VERIFICATION");
            paymentRecord.put("timestamp", timestamp);
            paymentRecord.put("upiId", "9976656631@axl");

            // Track customer purchase if authenticated
            if (customerId != null) {
                customerService.trackCustomerPurchase(customerId, orderNumber, null);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "UPI payment recorded successfully");
            response.put("paymentRecord", paymentRecord);
            response.put("note", "Payment verification pending. Transaction ID: " + upiTransactionId);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "UPI payment processing failed: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/upi-qr")
    public ResponseEntity<?> generateUPIQR(@RequestParam Double amount,
                                         @RequestParam String orderNumber) {
        try {
            String upiUrl = generateUPIUrl(amount, orderNumber);
            
            Map<String, Object> response = new HashMap<>();
            response.put("upiUrl", upiUrl);
            response.put("upiId", "9976656631@axl");
            response.put("amount", amount);
            response.put("merchantName", "Ecommerce Store");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to generate UPI QR"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/admin/payment-settings")
    public ResponseEntity<?> getPaymentSettings(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            
            if (!"ADMIN".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Map<String, Object> settings = new HashMap<>();
            settings.put("razorpayKeyId", razorpayKeyId);
            settings.put("upiId", "9976656631@axl");
            settings.put("merchantName", "Ecommerce Store");
            settings.put("supportedMethods", new String[]{"card", "netbanking", "wallet", "upi"});

            return new ResponseEntity<>(settings, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to fetch payment settings"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private boolean verifyRazorpaySignature(String orderId, String paymentId, String signature) {
        // Simplified signature verification
        // In real implementation, use Razorpay SDK to verify signature
        // String expectedSignature = hmac_sha256(orderId + "|" + paymentId, razorpayKeySecret);
        // return expectedSignature.equals(signature);
        return true; // For demo purposes
    }

    private String generateUPIUrl(Double amount, String orderNumber) {
        String upiId = "9976656631@axl";
        String merchantName = "Ecommerce Store";
        String transactionNote = "Payment for Order #" + orderNumber;

        return String.format("upi://pay?pa=%s&pn=%s&am=%.2f&cu=INR&tn=%s",
                upiId,
                merchantName.replace(" ", "%20"),
                amount,
                transactionNote.replace(" ", "%20"));
    }
}
