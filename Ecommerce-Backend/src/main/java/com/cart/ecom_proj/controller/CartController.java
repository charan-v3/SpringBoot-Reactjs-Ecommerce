package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.CartItemResponse;
import com.cart.ecom_proj.model.CartItem;
import com.cart.ecom_proj.service.CartService;
import com.cart.ecom_proj.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestHeader("Authorization") String token,
                                     @RequestBody Map<String, Object> request) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long customerId = jwtUtil.extractUserId(jwt);
            
            if (!"CUSTOMER".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Long productId = Long.valueOf(request.get("productId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());

            CartItem cartItem = cartService.addToCart(customerId, productId, quantity);
            
            return new ResponseEntity<>(Map.of(
                "message", "Product added to cart successfully",
                "cartItem", new CartItemResponse(cartItem),
                "cartTotal", cartService.getCartTotal(customerId),
                "cartItemCount", cartService.getCartItemCount(customerId)
            ), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to add product to cart: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<?> getCartItems(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long customerId = jwtUtil.extractUserId(jwt);
            
            if (!"CUSTOMER".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            List<CartItem> cartItems = cartService.getCartItems(customerId);
            List<CartItemResponse> cartItemResponses = cartItems.stream()
                    .map(CartItemResponse::new)
                    .toList();
            Double cartTotal = cartService.getCartTotal(customerId);
            Long cartItemCount = cartService.getCartItemCount(customerId);

            return new ResponseEntity<>(Map.of(
                "cartItems", cartItemResponses,
                "cartTotal", cartTotal,
                "cartItemCount", cartItemCount,
                "isEmpty", cartService.isCartEmpty(customerId)
            ), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to fetch cart items"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(@RequestHeader("Authorization") String token,
                                          @RequestBody Map<String, Object> request) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long customerId = jwtUtil.extractUserId(jwt);
            
            if (!"CUSTOMER".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Long productId = Long.valueOf(request.get("productId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());

            CartItem cartItem = cartService.updateCartItemQuantity(customerId, productId, quantity);
            
            if (cartItem == null) {
                return new ResponseEntity<>(Map.of(
                    "message", "Item removed from cart",
                    "cartTotal", cartService.getCartTotal(customerId),
                    "cartItemCount", cartService.getCartItemCount(customerId)
                ), HttpStatus.OK);
            }
            
            return new ResponseEntity<>(Map.of(
                "message", "Cart item updated successfully",
                "cartItem", new CartItemResponse(cartItem),
                "cartTotal", cartService.getCartTotal(customerId),
                "cartItemCount", cartService.getCartItemCount(customerId)
            ), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to update cart item: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromCart(@RequestHeader("Authorization") String token,
                                          @PathVariable Long productId) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long customerId = jwtUtil.extractUserId(jwt);
            
            if (!"CUSTOMER".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            cartService.removeFromCart(customerId, productId);
            
            return new ResponseEntity<>(Map.of(
                "message", "Product removed from cart successfully",
                "cartTotal", cartService.getCartTotal(customerId),
                "cartItemCount", cartService.getCartItemCount(customerId)
            ), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to remove product from cart: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long customerId = jwtUtil.extractUserId(jwt);
            
            if (!"CUSTOMER".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            cartService.clearCart(customerId);
            
            return new ResponseEntity<>(Map.of(
                "message", "Cart cleared successfully",
                "cartTotal", 0.0,
                "cartItemCount", 0L
            ), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to clear cart"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/count")
    public ResponseEntity<?> getCartItemCount(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long customerId = jwtUtil.extractUserId(jwt);
            
            if (!"CUSTOMER".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Long count = cartService.getCartItemCount(customerId);
            
            return new ResponseEntity<>(Map.of("count", count), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to get cart count"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/total")
    public ResponseEntity<?> getCartTotal(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String role = jwtUtil.extractRole(jwt);
            Long customerId = jwtUtil.extractUserId(jwt);
            
            if (!"CUSTOMER".equals(role)) {
                return new ResponseEntity<>(Map.of("error", "Access denied"), HttpStatus.FORBIDDEN);
            }

            Double total = cartService.getCartTotal(customerId);
            
            return new ResponseEntity<>(Map.of("total", total), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to get cart total"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
