package com.swasuraksha.controller;

import com.swasuraksha.dto.ApiResponse;
import com.swasuraksha.entity.*;
import com.swasuraksha.repository.*;
import com.swasuraksha.service.AuthService;
import com.swasuraksha.service.SafePointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JourneyRepository journeyRepository;

    @Autowired
    private SOSAlertRepository sosAlertRepository;

    @Autowired
    private CommunityReportRepository reportRepository;

    @Autowired
    private FeedbackSupportRepository feedbackRepository;

    @Autowired
    private SafePointService safePointService;

    @Autowired
    private AuthService authService;

    @Autowired
    private com.swasuraksha.repository.AdminAccessLogRepository adminAccessLogRepository;

    private void checkAdminAccess() {
        User user = authService.getAuthenticatedUser();
        if (!"ROLE_ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Access denied. Admin role required.");
        }
    }

    @GetMapping("/access-logs")
    public ResponseEntity<ApiResponse> getAdminAccessLogs() {
        checkAdminAccess();
        List<AdminAccessLog> logs = adminAccessLogRepository.findAllByOrderByAccessedAtDesc();
        return ResponseEntity.ok(new ApiResponse(true, "Admin accountability audit logs retrieved", logs));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getDashboardStats() {
        checkAdminAccess();

        long totalUsers = userRepository.count();
        long activeJourneys = journeyRepository.countByStatus("ACTIVE") + journeyRepository.countByStatus("DEVIATED");
        long completedJourneys = journeyRepository.countByStatus("COMPLETED");
        long activeSOS = sosAlertRepository.countByStatus("ACTIVE");
        long pendingReports = reportRepository.countByStatus("PENDING");
        long pendingFeedback = feedbackRepository.findByStatusOrderByCreatedAtDesc("PENDING").size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeJourneys", activeJourneys);
        stats.put("completedJourneys", completedJourneys);
        stats.put("activeSOSAlerts", activeSOS);
        stats.put("pendingReports", pendingReports);
        stats.put("pendingFeedbackTickets", pendingFeedback);

        return ResponseEntity.ok(new ApiResponse(true, "Dashboard analytics fetched successfully", stats));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse> getAllReports() {
        checkAdminAccess();
        List<CommunityReport> reports = safePointService.getAllReportsForAdmin();
        return ResponseEntity.ok(new ApiResponse(true, "All community reports retrieved", reports));
    }

    @PutMapping("/reports/{id}")
    public ResponseEntity<ApiResponse> updateReportStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        checkAdminAccess();
        String status = body.get("status"); // VERIFIED, REJECTED
        CommunityReport updated = safePointService.verifyReport(id, status);
        return ResponseEntity.ok(new ApiResponse(true, "Report status updated to " + status, updated));
    }

    @GetMapping("/feedback")
    public ResponseEntity<ApiResponse> getAllFeedback() {
        checkAdminAccess();
        List<FeedbackSupport> tickets = safePointService.getAllFeedbackForAdmin();
        return ResponseEntity.ok(new ApiResponse(true, "All feedback tickets retrieved", tickets));
    }

    @PutMapping("/feedback/{id}/resolve")
    public ResponseEntity<ApiResponse> resolveFeedbackTicket(@PathVariable Long id) {
        checkAdminAccess();
        FeedbackSupport updated = safePointService.resolveFeedback(id);
        return ResponseEntity.ok(new ApiResponse(true, "Support ticket resolved", updated));
    }

    @PostMapping("/safepoints")
    public ResponseEntity<ApiResponse> addSafePoint(@RequestBody SafePoint safePoint) {
        checkAdminAccess();
        SafePoint created = safePointService.createSafePoint(safePoint);
        return ResponseEntity.ok(new ApiResponse(true, "SafePoint seeded successfully", created));
    }
}
