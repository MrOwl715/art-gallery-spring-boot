package com.example.art_gal.service;

import com.example.art_gal.dto.ActivityLogDTO;
import com.example.art_gal.entity.ActivityLog;
import com.example.art_gal.entity.User;
import com.example.art_gal.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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
                actor = ((User) principal).getFullName();
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
    
    // --- PHƯƠNG THỨC MỚI ---
    public List<ActivityLogDTO> getAllLogs() {
        // Sắp xếp theo thời gian tạo giảm dần để lấy các log mới nhất
        List<ActivityLog> logs = activityLogRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return logs.stream()
                   .map(this::convertToDTO)
                   .collect(Collectors.toList());
    }

    // --- PHƯƠG THỨC MỚI ---
    private ActivityLogDTO convertToDTO(ActivityLog log) {
        ActivityLogDTO dto = new ActivityLogDTO();
        dto.setActor(log.getActor());
        dto.setAction(log.getAction());
        dto.setDetails(log.getDetails());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}