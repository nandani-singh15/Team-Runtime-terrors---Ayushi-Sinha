package com.swasuraksha.service;

import com.swasuraksha.entity.Notification;
import com.swasuraksha.entity.User;
import com.swasuraksha.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmailAlert(User recipientUser, String recipientEmail, String subject, String body) {
        System.out.println("==================================================");
        System.out.println("ALERT SENT TO: " + recipientEmail);
        System.out.println("SUBJECT: " + subject);
        System.out.println("BODY: " + body);
        System.out.println("==================================================");

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipientEmail);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("SMTP Mail sending failed: " + e.getMessage());
            }
        }

        Notification notification = Notification.builder()
                .user(recipientUser)
                .title(subject)
                .content(body)
                .type("EMAIL")
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserIdOrderBySentAtDesc(user.getId());
    }

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderBySentAtDesc(user.getId());
    }

    public void markAsRead(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }
}
