package com.swasuraksha.service;

import com.swasuraksha.entity.*;
import com.swasuraksha.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SafePointService {

    @Autowired
    private SafePointRepository safePointRepository;

    @Autowired
    private CommunityReportRepository reportRepository;

    @Autowired
    private SafetyRatingRepository ratingRepository;

    @Autowired
    private FeedbackSupportRepository feedbackRepository;

    @Autowired
    private AuthService authService;

    public List<SafePoint> getAllSafePoints() {
        return safePointRepository.findAll();
    }

    public SafePoint createSafePoint(SafePoint safePoint) {
        return safePointRepository.save(safePoint);
    }

    public List<SafePoint> findNearbyPlaces(double userLat, double userLng, String type, double radiusKm) {
        List<SafePoint> allPoints = safePointRepository.findAll();
        
        return allPoints.stream()
                .filter(p -> type == null || p.getType().equalsIgnoreCase(type))
                .filter(p -> calculateDistance(userLat, userLng, p.getLatitude(), p.getLongitude()) <= radiusKm)
                .sorted((p1, p2) -> Double.compare(
                        calculateDistance(userLat, userLng, p1.getLatitude(), p1.getLongitude()),
                        calculateDistance(userLat, userLng, p2.getLatitude(), p2.getLongitude())
                ))
                .collect(Collectors.toList());
    }

    public CommunityReport reportIssue(String title, String description, double latitude, double longitude, String riskLevel) {
        User user = authService.getAuthenticatedUser();

        CommunityReport report = CommunityReport.builder()
                .reporter(user)
                .title(title)
                .description(description)
                .latitude(latitude)
                .longitude(longitude)
                .riskLevel(riskLevel)
                .status("PENDING")
                .build();

        return reportRepository.save(report);
    }

    public List<CommunityReport> getVerifiedReports() {
        return reportRepository.findByStatus("VERIFIED");
    }

    public List<CommunityReport> getAllReportsForAdmin() {
        User admin = authService.getAuthenticatedUser();
        if (!admin.getRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Access denied. Admin only.");
        }
        return reportRepository.findAll();
    }

    public CommunityReport verifyReport(Long reportId, String status) {
        User admin = authService.getAuthenticatedUser();
        if (!admin.getRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Access denied. Admin only.");
        }

        CommunityReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus(status);
        CommunityReport saved = reportRepository.save(report);

        if ("VERIFIED".equalsIgnoreCase(status) && report.getRiskLevel().equalsIgnoreCase("LOW")) {
            SafePoint point = SafePoint.builder()
                    .name(report.getTitle())
                    .description("Community verified safe spot: " + report.getDescription())
                    .type("SHELTER")
                    .latitude(report.getLatitude())
                    .longitude(report.getLongitude())
                    .phoneNumber("+91 112")
                    .averageSafetyRating(5.0)
                    .totalRatings(1)
                    .build();
            safePointRepository.save(point);
        }

        return saved;
    }

    public SafetyRating rateLocation(double latitude, double longitude, int rating, String comment) {
        User user = authService.getAuthenticatedUser();

        SafetyRating safetyRating = SafetyRating.builder()
                .user(user)
                .latitude(latitude)
                .longitude(longitude)
                .rating(rating)
                .comment(comment)
                .build();

        return ratingRepository.save(safetyRating);
    }

    public FeedbackSupport submitFeedback(String fullName, String email, String subject, String message) {
        User user = null;
        try {
            user = authService.getAuthenticatedUser();
        } catch (Exception ignored) {
        }

        FeedbackSupport feedback = FeedbackSupport.builder()
                .user(user)
                .fullName(user != null ? user.getFullName() : fullName)
                .email(user != null ? user.getEmail() : email)
                .subject(subject)
                .message(message)
                .status("PENDING")
                .build();

        return feedbackRepository.save(feedback);
    }

    public List<FeedbackSupport> getAllFeedbackForAdmin() {
        User admin = authService.getAuthenticatedUser();
        if (!admin.getRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Access denied. Admin only.");
        }
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    public FeedbackSupport resolveFeedback(Long id) {
        User admin = authService.getAuthenticatedUser();
        if (!admin.getRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Access denied. Admin only.");
        }

        FeedbackSupport ticket = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus("RESOLVED");
        return feedbackRepository.save(ticket);
    }

    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        double earthRadius = 6371.0; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }
}
