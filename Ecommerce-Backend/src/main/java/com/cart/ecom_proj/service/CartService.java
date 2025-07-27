package com.cart.ecom_proj.service;

import com.cart.ecom_proj.model.Cart;
import com.cart.ecom_proj.model.CartItem;
import com.cart.ecom_proj.model.Customer;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.repo.CartRepo;
import com.cart.ecom_proj.repo.CartItemRepo;
import com.cart.ecom_proj.repo.CustomerRepo;
import com.cart.ecom_proj.repo.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepo cartRepo;

    @Autowired
    private CartItemRepo cartItemRepo;

    @Autowired
    private CustomerRepo customerRepo;

    @Autowired
    private ProductRepo productRepo;

    @Transactional
    public Cart getOrCreateCart(Long customerId) {
        Optional<Cart> existingCart = cartRepo.findByCustomerId(customerId);
        
        if (existingCart.isPresent()) {
            return existingCart.get();
        }
        
        // Create new cart
        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        Cart cart = new Cart();
        cart.setCustomer(customer);
        cart.setCreatedAt(LocalDateTime.now());
        cart.setUpdatedAt(LocalDateTime.now());
        
        return cartRepo.save(cart);
    }

    @Transactional
    public CartItem addToCart(Long customerId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(customerId);
        
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepo.findByCartAndProduct(cart, product);
        
        if (existingItem.isPresent()) {
            // Update quantity
            CartItem cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartItem.setUpdatedAt(LocalDateTime.now());
            return cartItemRepo.save(cartItem);
        } else {
            // Create new cart item
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem.setAddedAt(LocalDateTime.now());
            cartItem.setUpdatedAt(LocalDateTime.now());
            return cartItemRepo.save(cartItem);
        }
    }

    @Transactional
    public CartItem updateCartItemQuantity(Long customerId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(customerId);
        
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        CartItem cartItem = cartItemRepo.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (quantity <= 0) {
            cartItemRepo.delete(cartItem);
            return null;
        }
        
        cartItem.setQuantity(quantity);
        cartItem.setUpdatedAt(LocalDateTime.now());
        return cartItemRepo.save(cartItem);
    }

    @Transactional
    public void removeFromCart(Long customerId, Long productId) {
        Cart cart = getOrCreateCart(customerId);
        
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        cartItemRepo.deleteByCartAndProduct(cart, product);
    }

    public List<CartItem> getCartItems(Long customerId) {
        Cart cart = getOrCreateCart(customerId);
        return cartItemRepo.findByCart(cart);
    }

    public Double getCartTotal(Long customerId) {
        Cart cart = getOrCreateCart(customerId);
        Double total = cartItemRepo.calculateCartTotal(cart.getId());
        return total != null ? total : 0.0;
    }

    public Long getCartItemCount(Long customerId) {
        Cart cart = getOrCreateCart(customerId);
        Long count = cartItemRepo.countItemsInCart(cart.getId());
        return count != null ? count : 0L;
    }

    @Transactional
    public void clearCart(Long customerId) {
        Optional<Cart> cartOpt = cartRepo.findByCustomerId(customerId);
        if (cartOpt.isPresent()) {
            cartItemRepo.deleteByCartId(cartOpt.get().getId());
        }
    }

    public boolean isCartEmpty(Long customerId) {
        return getCartItemCount(customerId) == 0;
    }
}
