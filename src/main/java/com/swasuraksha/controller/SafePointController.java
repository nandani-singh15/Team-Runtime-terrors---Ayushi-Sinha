package com.swasuraksha.controller;

import com.swasuraksha.dto.ApiResponse;
import com.swasuraksha.entity.CommunityReport;
import com.swasuraksha.entity.FeedbackSupport;
import com.swasuraksha.entity.SafePoint;
import com.swasuraksha.entity.SafetyRating;
import com.swasuraksha.service.SafePointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/safepoints")
public class SafePointController {

    @Autowired
    private SafePointService safePointService;

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse> getNearbyPoints(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "5.0") double radius) {
        
        List<SafePoint> points = safePointService.findNearbyPlaces(latitude, longitude, type, radius);
        return ResponseEntity.ok(new ApiResponse(true, "Nearby safe places retrieved successfully", points));
    }

    @PostMapping("/reports")
    public ResponseEntity<ApiResponse> reportIssue(@RequestBody Map<String, Object> body) {
        String title = (String) body.get("title");
        String description = (String) body.get("description");
        double latitude = ((Number) body.get("latitude")).doubleValue();
        double longitude = ((Number) body.get("longitude")).doubleValue();
        String riskLevel = (String) body.getOrDefault("riskLevel", "MEDIUM");

        CommunityReport report = safePointService.reportIssue(title, description, latitude, longitude, riskLevel);
        return ResponseEntity.ok(new ApiResponse(true, "Safety issue reported successfully for moderation", report));
    }

    @GetMapping("/reports/verified")
    public ResponseEntity<ApiResponse> getVerifiedReports() {
        List<CommunityReport> reports = safePointService.getVerifiedReports();
        return ResponseEntity.ok(new ApiResponse(true, "Verified safety reports retrieved", reports));
    }

    @PostMapping("/ratings")
    public ResponseEntity<ApiResponse> rateLocation(@RequestBody Map<String, Object> body) {
        double latitude = ((Number) body.get("latitude")).doubleValue();
        double longitude = ((Number) body.get("longitude")).doubleValue();
        int rating = ((Number) body.get("rating")).intValue();
        String comment = (String) body.get("comment");

        SafetyRating safetyRating = safePointService.rateLocation(latitude, longitude, rating, comment);
        return ResponseEntity.ok(new ApiResponse(true, "Safety rating submitted successfully", safetyRating));
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse> submitFeedback(@RequestBody Map<String, String> body) {
        String fullName = body.get("fullName");
        String email = body.get("email");
        String subject = body.get("subject");
        String message = body.get("message");

        FeedbackSupport ticket = safePointService.submitFeedback(fullName, email, subject, message);
        return ResponseEntity.ok(new ApiResponse(true, "Feedback / Support inquiry received. Thank you!", ticket));
    }
}
