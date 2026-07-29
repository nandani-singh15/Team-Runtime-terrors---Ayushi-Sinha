package com.swasuraksha.controller;

import com.swasuraksha.dto.ApiResponse;
import com.swasuraksha.entity.Journey;
import com.swasuraksha.entity.JourneyTimeline;
import com.swasuraksha.entity.SOSAlert;
import com.swasuraksha.service.JourneyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/journeys")
public class JourneyController {

    @Autowired
    private JourneyService journeyService;

    @PostMapping("/start")
    public ResponseEntity<ApiResponse> startJourney(@RequestBody Map<String, Object> body) {
        String startLocation = (String) body.get("startLocation");
        String endLocation = (String) body.get("endLocation");
        double startLat = ((Number) body.get("startLat")).doubleValue();
        double startLng = ((Number) body.get("startLng")).doubleValue();
        double endLat = ((Number) body.get("endLat")).doubleValue();
        double endLng = ((Number) body.get("endLng")).doubleValue();
        int expectedMinutes = ((Number) body.getOrDefault("expectedMinutes", 30)).intValue();
        boolean silentEscortEnabled = (Boolean) body.getOrDefault("silentEscortEnabled", false);

        Journey journey = journeyService.startJourney(startLocation, endLocation, startLat, startLng, endLat, endLng, expectedMinutes, silentEscortEnabled);
        return ResponseEntity.ok(new ApiResponse(true, "Journey started successfully", journey));
    }

    @PutMapping("/location")
    public ResponseEntity<ApiResponse> updateLocation(@RequestBody Map<String, Object> body) {
        double latitude = ((Number) body.get("latitude")).doubleValue();
        double longitude = ((Number) body.get("longitude")).doubleValue();

        Journey journey = journeyService.updateLocation(latitude, longitude);
        return ResponseEntity.ok(new ApiResponse(true, "Location updated successfully", journey));
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse> completeJourney() {
        Journey journey = journeyService.completeJourney();
        return ResponseEntity.ok(new ApiResponse(true, "Journey completed successfully", journey));
    }

    @PostMapping("/sos")
    public ResponseEntity<ApiResponse> triggerSOS(@RequestBody Map<String, Object> body) {
        double latitude = ((Number) body.get("latitude")).doubleValue();
        double longitude = ((Number) body.get("longitude")).doubleValue();

        SOSAlert alert = journeyService.triggerSOS(latitude, longitude);
        return ResponseEntity.ok(new ApiResponse(true, "SOS Alert triggered successfully and contacts notified", alert));
    }

    @PostMapping("/sos/{id}/resolve")
    public ResponseEntity<ApiResponse> resolveSOS(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String notes = body.getOrDefault("notes", "Resolved safely.");
        journeyService.resolveSOS(id, notes);
        return ResponseEntity.ok(new ApiResponse(true, "SOS Alert resolved successfully", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getJourneys() {
        List<Journey> journeys = journeyService.getMyJourneys();
        return ResponseEntity.ok(new ApiResponse(true, "Journeys fetched successfully", journeys));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse> getJourneyTimeline(@PathVariable Long id) {
        List<JourneyTimeline> timeline = journeyService.getJourneyTimeline(id);
        return ResponseEntity.ok(new ApiResponse(true, "Timeline fetched successfully", timeline));
    }
}
