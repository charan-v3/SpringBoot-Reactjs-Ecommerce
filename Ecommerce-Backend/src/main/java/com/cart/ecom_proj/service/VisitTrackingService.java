package com.cart.ecom_proj.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class VisitTrackingService {
    
    // Track sessions to avoid duplicate visit counting
    private final ConcurrentMap<String, Long> sessionVisitTracker = new ConcurrentHashMap<>();
    
    /**
     * Check if this session has already been counted for visit tracking
     * @param sessionId The session ID
     * @param customerId The customer ID
     * @return true if this is a new visit for this session, false if already counted
     */
    public boolean shouldTrackVisit(String sessionId, Long customerId) {
        if (sessionId == null || customerId == null) {
            return false;
        }
        
        String sessionKey = sessionId + "_" + customerId;
        
        // If this session-customer combination hasn't been seen before, track it
        if (!sessionVisitTracker.containsKey(sessionKey)) {
            sessionVisitTracker.put(sessionKey, System.currentTimeMillis());
            return true;
        }
        
        return false;
    }
    
    /**
     * Clean up old session entries (scheduled task for memory management)
     * Runs every 30 minutes to remove sessions older than 1 hour
     */
    @Scheduled(fixedRate = 30 * 60 * 1000) // Run every 30 minutes
    public void cleanupOldSessions() {
        long currentTime = System.currentTimeMillis();
        long sessionTimeout = 60 * 60 * 1000; // 1 hour timeout

        int removedCount = 0;
        var iterator = sessionVisitTracker.entrySet().iterator();
        while (iterator.hasNext()) {
            var entry = iterator.next();
            if (currentTime - entry.getValue() > sessionTimeout) {
                iterator.remove();
                removedCount++;
            }
        }

        if (removedCount > 0) {
            System.out.println("Cleaned up " + removedCount + " old visit tracking sessions");
        }
    }
}
