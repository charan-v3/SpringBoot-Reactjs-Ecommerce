package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.ProductListResponse;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.service.ProductService;
import com.cart.ecom_proj.service.CustomerService;
import com.cart.ecom_proj.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;


@RestController
@CrossOrigin
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService service;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/products")
    public ResponseEntity<List<ProductListResponse>> getAllProducts(){
        long startTime = System.currentTimeMillis();
        System.out.println("🔍 Fetching all products (optimized)...");

        List<ProductListResponse> products = service.getAllProductsOptimized();

        long endTime = System.currentTimeMillis();
        System.out.println("✅ Products fetched: " + products.size() + " products in " + (endTime - startTime) + "ms");

        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/products/fast")
    public ResponseEntity<List<ProductListResponse>> getAllProductsFast(){
        long startTime = System.currentTimeMillis();
        System.out.println("🚀 Fetching products (fast endpoint)...");

        List<ProductListResponse> products = service.getAllProductsOptimized();

        long endTime = System.currentTimeMillis();
        System.out.println("⚡ Products fetched (fast): " + products.size() + " products in " + (endTime - startTime) + "ms");

        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id,
                                            @RequestHeader(value = "Authorization", required = false) String token,
                                            HttpServletRequest request){

        Product product = service.getProductById(id);

        if(product != null) {
            // Track customer visit if authenticated
            if (token != null && token.startsWith("Bearer ")) {
                try {
                    String jwt = token.substring(7);
                    Long customerId = jwtUtil.extractUserId(jwt);
                    String role = jwtUtil.extractRole(jwt);

                    if ("CUSTOMER".equals(role)) {
                        String sessionId = request.getSession().getId();
                        String ipAddress = getClientIpAddress(request);
                        String userAgent = request.getHeader("User-Agent");
                        String pageUrl = request.getRequestURL().toString();
                        String referrer = request.getHeader("Referer");

                        customerService.trackCustomerVisit(customerId, sessionId, ipAddress, userAgent, pageUrl, referrer);
                    }
                } catch (Exception e) {
                    // Log error but don't fail the request
                    System.err.println("Error tracking customer visit: " + e.getMessage());
                }
            }

            return new ResponseEntity<>(product, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/product")
    public ResponseEntity<?> addProduct(@RequestPart Product product, @RequestPart MultipartFile imageFile) {

        try {
            System.out.println(product);
            Product product1 = service.addProduct(product, imageFile);
            return new ResponseEntity<>(product1, HttpStatus.CREATED);
        }
        catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("product/{productId}/image")
    public ResponseEntity getImageByProductId(@PathVariable Long productId){
        try {
            Product product = service.getProductById(productId);
            if (product == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            byte[] imageFile = service.getProductImage(productId);
            if (imageFile == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.valueOf(product.getImageType()))
                    .body(imageFile);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/product/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable Long id,
                                                @RequestPart Product product,
                                                @RequestPart MultipartFile imageFile){

        Product product1 = null;
        try {
            product1 = service.updateProduct(id, product, imageFile);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        if (product1 != null)
            return new ResponseEntity<>("Updated", HttpStatus.OK);
        else
            return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);

    }

    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id){
        Product product = service.getProductById(id);
        if(product != null) {
            service.deleteProduct(id);
            return new ResponseEntity<>("Deleted", HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword){
        System.out.println("searching with " + keyword);
        List<Product> products = service.searchProducts(keyword);
        return new ResponseEntity<>(products, HttpStatus.OK);
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
