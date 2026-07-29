package com.swasuraksha.controller;

import com.swasuraksha.dto.ApiResponse;
import com.swasuraksha.entity.Notification;
import com.swasuraksha.entity.User;
import com.swasuraksha.service.AuthService;
import com.swasuraksha.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse> getNotifications() {
        User user = authService.getAuthenticatedUser();
        List<Notification> notifications = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(new ApiResponse(true, "Notifications fetched successfully", notifications));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse> getUnreadNotifications() {
        User user = authService.getAuthenticatedUser();
        List<Notification> notifications = notificationService.getUnreadNotifications(user);
        return ResponseEntity.ok(new ApiResponse(true, "Unread notifications fetched successfully", notifications));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id) {
        User user = authService.getAuthenticatedUser();
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok(new ApiResponse(true, "Notification marked as read", null));
    }
}
