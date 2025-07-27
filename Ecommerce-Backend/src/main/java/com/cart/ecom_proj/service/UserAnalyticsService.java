package com.cart.ecom_proj.service;

import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.model.UserActivity;
import com.cart.ecom_proj.repo.UserActivityRepo;
import com.cart.ecom_proj.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserAnalyticsService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private UserActivityRepo userActivityRepo;

    @Transactional
    public void trackUserVisit(Long userId, String sessionId, String ipAddress, String userAgent, String pageUrl, String referrer) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Update user visit count and last visit time
            user.setVisitCount(user.getVisitCount() + 1);
            user.setLastVisitAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            userRepo.save(user);
            
            // Create activity record
            UserActivity activity = new UserActivity();
            activity.setUser(user);
            activity.setActivityType(UserActivity.ActivityType.PAGE_VISIT);
            activity.setActivityTime(LocalDateTime.now());
            activity.setSessionId(sessionId);
            activity.setIpAddress(ipAddress);
            activity.setUserAgent(userAgent);
            activity.setPageUrl(pageUrl);
            activity.setReferrer(referrer);
            
            userActivityRepo.save(activity);
        }
    }

    @Transactional
    public void trackUserLogin(Long userId, String sessionId, String ipAddress, String userAgent) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Create login activity record
            UserActivity activity = new UserActivity();
            activity.setUser(user);
            activity.setActivityType(UserActivity.ActivityType.LOGIN);
            activity.setActivityTime(LocalDateTime.now());
            activity.setSessionId(sessionId);
            activity.setIpAddress(ipAddress);
            activity.setUserAgent(userAgent);
            
            userActivityRepo.save(activity);
        }
    }

    @Transactional
    public void trackUserPurchase(Long userId, String orderNumber, String sessionId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Update user purchase count and last purchase time
            user.setPurchaseCount(user.getPurchaseCount() + 1);
            user.setLastPurchaseAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            userRepo.save(user);
            
            // Create purchase activity record
            UserActivity activity = new UserActivity();
            activity.setUser(user);
            activity.setActivityType(UserActivity.ActivityType.ORDER_PLACED);
            activity.setActivityTime(LocalDateTime.now());
            activity.setSessionId(sessionId);
            activity.setAdditionalData(orderNumber);
            
            userActivityRepo.save(activity);
        }
    }

    @Transactional
    public void trackActivity(Long userId, UserActivity.ActivityType activityType, String sessionId, String additionalData) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            UserActivity activity = new UserActivity();
            activity.setUser(user);
            activity.setActivityType(activityType);
            activity.setActivityTime(LocalDateTime.now());
            activity.setSessionId(sessionId);
            activity.setAdditionalData(additionalData);
            
            userActivityRepo.save(activity);
        }
    }

    public List<UserActivity> getUserActivities(Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isPresent()) {
            return userActivityRepo.findByUserOrderByActivityTimeDesc(userOpt.get());
        }
        return List.of();
    }

    public Map<String, Object> getUserAnalytics(Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return new HashMap<>();
        }
        
        User user = userOpt.get();
        Map<String, Object> analytics = new HashMap<>();
        
        analytics.put("userId", user.getId());
        analytics.put("username", user.getUsername());
        analytics.put("visitCount", user.getVisitCount());
        analytics.put("purchaseCount", user.getPurchaseCount());
        analytics.put("lastVisitAt", user.getLastVisitAt());
        analytics.put("lastPurchaseAt", user.getLastPurchaseAt());
        analytics.put("memberSince", user.getCreatedAt());
        
        // Get activity counts by type
        Map<String, Long> activityCounts = new HashMap<>();
        for (UserActivity.ActivityType type : UserActivity.ActivityType.values()) {
            Long count = userActivityRepo.countUserActivitiesByType(userId, type);
            activityCounts.put(type.name(), count);
        }
        analytics.put("activityCounts", activityCounts);
        
        // Get recent activities
        List<UserActivity> recentActivities = userActivityRepo.findUserActivitiesSince(userId, LocalDateTime.now().minusDays(30));
        analytics.put("recentActivities", recentActivities);
        
        return analytics;
    }

    public Map<String, Object> getAllUsersAnalytics() {
        List<User> users = userRepo.findAll();
        Map<String, Object> analytics = new HashMap<>();
        
        long totalUsers = users.size();
        long totalVisits = users.stream().mapToLong(User::getVisitCount).sum();
        long totalPurchases = users.stream().mapToLong(User::getPurchaseCount).sum();
        
        analytics.put("totalUsers", totalUsers);
        analytics.put("totalVisits", totalVisits);
        analytics.put("totalPurchases", totalPurchases);
        analytics.put("averageVisitsPerUser", totalUsers > 0 ? (double) totalVisits / totalUsers : 0);
        analytics.put("averagePurchasesPerUser", totalUsers > 0 ? (double) totalPurchases / totalUsers : 0);
        
        // Top users by visits
        List<User> topVisitors = users.stream()
                .sorted((u1, u2) -> Long.compare(u2.getVisitCount(), u1.getVisitCount()))
                .limit(10)
                .toList();
        analytics.put("topVisitors", topVisitors);
        
        // Top users by purchases
        List<User> topBuyers = users.stream()
                .sorted((u1, u2) -> Long.compare(u2.getPurchaseCount(), u1.getPurchaseCount()))
                .limit(10)
                .toList();
        analytics.put("topBuyers", topBuyers);
        
        return analytics;
    }
}
