package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepo extends JpaRepository<Admin, Long> {

    Optional<Admin> findByUsername(String username);

    Optional<Admin> findByEmail(String email);

    Optional<Admin> findByUsernameOrEmail(String username, String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUpiId(String upiId);

    // Find unverified admin requests (isVerified = 0)
    List<Admin> findByIsVerifiedOrderByRequestedAtDesc(int isVerified);

    // Find verified admins (isVerified = 1)
    List<Admin> findByIsVerifiedOrderByCreatedAtDesc(int isVerified);

    // Count unverified admin requests (isVerified = 0)
    long countByIsVerified(int isVerified);

    // Convenience methods for backward compatibility
    default List<Admin> findByIsVerifiedFalseOrderByRequestedAtDesc() {
        return findByIsVerifiedOrderByRequestedAtDesc(0);
    }

    default List<Admin> findByIsVerifiedTrueOrderByCreatedAtDesc() {
        return findByIsVerifiedOrderByCreatedAtDesc(1);
    }

    default long countByIsVerifiedFalse() {
        return countByIsVerified(0);
    }

    // Find admins verified by a specific admin
    @Query("SELECT a FROM Admin a WHERE a.verifiedByAdminId = :adminId ORDER BY a.verifiedAt DESC")
    List<Admin> findAdminsVerifiedBy(@Param("adminId") Long adminId);
}
