package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.Cart;
import com.cart.ecom_proj.model.CartItem;
import com.cart.ecom_proj.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByCart(Cart cart);
    
    List<CartItem> findByCartId(Long cartId);
    
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
    
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);
    
    @Modifying
    @Transactional
    void deleteByCartAndProduct(Cart cart, Product product);

    @Modifying
    @Transactional
    void deleteByCartId(Long cartId);
    
    @Query("SELECT SUM(ci.quantity * ci.product.price) FROM CartItem ci WHERE ci.cart.id = :cartId")
    Double calculateCartTotal(@Param("cartId") Long cartId);
    
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.cart.id = :cartId")
    Long countItemsInCart(@Param("cartId") Long cartId);
}
