package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.model.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityRepo extends JpaRepository<UserActivity, Long> {
    
    List<UserActivity> findByUserOrderByActivityTimeDesc(User user);
    
    List<UserActivity> findByUserAndActivityTypeOrderByActivityTimeDesc(User user, UserActivity.ActivityType activityType);
    
    @Query("SELECT ua FROM UserActivity ua WHERE ua.user.id = :userId AND ua.activityTime >= :startDate ORDER BY ua.activityTime DESC")
    List<UserActivity> findUserActivitiesSince(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.user.id = :userId AND ua.activityType = :activityType")
    Long countUserActivitiesByType(@Param("userId") Long userId, @Param("activityType") UserActivity.ActivityType activityType);
    
    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.user.id = :userId AND ua.activityType = :activityType AND ua.activityTime >= :startDate")
    Long countUserActivitiesByTypeAndDate(@Param("userId") Long userId, @Param("activityType") UserActivity.ActivityType activityType, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT ua.user.id, COUNT(ua) FROM UserActivity ua WHERE ua.activityType = :activityType GROUP BY ua.user.id")
    List<Object[]> getUserActivityCounts(@Param("activityType") UserActivity.ActivityType activityType);
    
    @Query("SELECT ua FROM UserActivity ua WHERE ua.sessionId = :sessionId ORDER BY ua.activityTime DESC")
    List<UserActivity> findBySessionIdOrderByActivityTimeDesc(@Param("sessionId") String sessionId);
}
