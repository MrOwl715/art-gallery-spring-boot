package com.example.art_gal.service;

import com.example.art_gal.entity.ActivityLog;
import com.example.art_gal.entity.User;
import com.example.art_gal.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public void logActivity(String action, String details) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String actor = "SYSTEM";

        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                actor = user.getFullName() + " (" + user.getUsername() + ")";
            } else {
                actor = authentication.getName();
            }
        }
        
        ActivityLog log = new ActivityLog();
        log.setActor(actor);
        log.setAction(action);
        log.setDetails(details);
        
        activityLogRepository.save(log);
    }
}