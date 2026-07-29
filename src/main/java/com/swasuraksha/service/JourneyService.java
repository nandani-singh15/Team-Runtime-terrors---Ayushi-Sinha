package com.swasuraksha.service;

import com.swasuraksha.entity.*;
import com.swasuraksha.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class JourneyService {

    @Autowired
    private JourneyRepository journeyRepository;

    @Autowired
    private JourneyTimelineRepository timelineRepository;

    @Autowired
    private SOSAlertRepository sosAlertRepository;

    @Autowired
    private TrustedContactRepository contactRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private NotificationService notificationService;

    public Journey startJourney(String startLocation, String endLocation,
                                 double startLat, double startLng,
                                 double endLat, double endLng,
                                 int expectedMinutes, boolean silentEscortEnabled) {
        User user = authService.getAuthenticatedUser();

        Optional<Journey> existing = journeyRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), "ACTIVE");
        existing.ifPresent(j -> {
            j.setStatus("COMPLETED");
            j.setEndTime(LocalDateTime.now());
            journeyRepository.save(j);
        });

        Map<String, Object> analysis = geminiService.analyzeRouteSafety(startLocation, endLocation, startLat, startLng, endLat, endLng);
        int riskScore = 100 - (int) analysis.getOrDefault("safetyScore", 88);
        String explanation = (String) analysis.getOrDefault("safetyExplanation", "Safe route suggested.");

        Journey journey = Journey.builder()
                .user(user)
                .startLocation(startLocation)
                .endLocation(endLocation)
                .startLat(startLat)
                .startLng(startLng)
                .endLat(endLat)
                .endLng(endLng)
                .currentLat(startLat)
                .currentLng(startLng)
                .startTime(LocalDateTime.now())
                .status("ACTIVE")
                .riskScore(riskScore)
                .safetyRouteExplanation(explanation)
                .silentEscortEnabled(silentEscortEnabled)
                .expectedCheckInTime(silentEscortEnabled ? LocalDateTime.now().plusMinutes(expectedMinutes) : null)
                .build();

        Journey saved = journeyRepository.save(journey);

        JourneyTimeline timeline = JourneyTimeline.builder()
                .journey(saved)
                .latitude(startLat)
                .longitude(startLng)
                .eventType("START")
                .description("Journey started from " + startLocation)
                .build();
        timelineRepository.save(timeline);

        return saved;
    }

    public Journey updateLocation(double latitude, double longitude) {
        User user = authService.getAuthenticatedUser();
        Journey journey = journeyRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), "ACTIVE")
                .or(() -> journeyRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), "DEVIATED"))
                .orElseThrow(() -> new RuntimeException("No active journey found to update location."));

        journey.setCurrentLat(latitude);
        journey.setCurrentLng(longitude);

        double startToDest = calculateDistance(journey.getStartLat(), journey.getStartLng(), journey.getEndLat(), journey.getEndLng());
        double currentToDest = calculateDistance(latitude, longitude, journey.getEndLat(), journey.getEndLng());

        String eventType = "CHECK_IN";
        String description = String.format("Location updated: Coords (%f, %f)", latitude, longitude);

        if (currentToDest > startToDest + 2.0) {
            journey.setStatus("DEVIATED");
            eventType = "ROUTE_DEVIATION";
            description = "Route deviation detected: Drifting away from destination!";
        }

        journeyRepository.save(journey);

        JourneyTimeline timeline = JourneyTimeline.builder()
                .journey(journey)
                .latitude(latitude)
                .longitude(longitude)
                .eventType(eventType)
                .description(description)
                .build();
        timelineRepository.save(timeline);

        return journey;
    }

    public Journey completeJourney() {
        User user = authService.getAuthenticatedUser();
        Journey journey = journeyRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), "ACTIVE")
                .or(() -> journeyRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), "DEVIATED"))
                .orElseThrow(() -> new RuntimeException("No active journey to complete."));

        journey.setStatus("COMPLETED");
        journey.setEndTime(LocalDateTime.now());
        Journey saved = journeyRepository.save(journey);

        JourneyTimeline timeline = JourneyTimeline.builder()
                .journey(saved)
                .latitude(journey.getCurrentLat())
                .longitude(journey.getCurrentLng())
                .eventType("END")
                .description("Journey successfully completed at " + journey.getEndLocation())
                .build();
        timelineRepository.save(timeline);

        return saved;
    }

    public SOSAlert triggerSOS(double latitude, double longitude) {
        User user = authService.getAuthenticatedUser();
        
        Optional<Journey> activeJourney = journeyRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), "ACTIVE")
                .or(() -> journeyRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), "DEVIATED"));

        activeJourney.ifPresent(j -> {
            j.setStatus("SOS");
            journeyRepository.save(j);

            JourneyTimeline timeline = JourneyTimeline.builder()
                    .journey(j)
                    .latitude(latitude)
                    .longitude(longitude)
                    .eventType("SOS")
                    .description("SOS alert triggered manually by user")
                    .build();
            timelineRepository.save(timeline);
        });

        SOSAlert alert = SOSAlert.builder()
                .journey(activeJourney.orElse(null))
                .user(user)
                .latitude(latitude)
                .longitude(longitude)
                .status("ACTIVE")
                .build();
        SOSAlert saved = sosAlertRepository.save(alert);

        List<TrustedContact> contacts = contactRepository.findByUserId(user.getId());
        String mapsLink = String.format("https://maps.google.com/?q=%f,%f", latitude, longitude);
        String subject = String.format("CRITICAL ALERT: SOS triggered by %s", user.getFullName());
        String body = String.format(
                "Urgent Alert: %s has triggered a critical SOS via SwaSuraksha journey safety. \n" +
                "Last known Location: %s\n" +
                "View location live on Maps: %s\n\n" +
                "Please contact them immediately or notify emergency services.",
                user.getFullName(), mapsLink, mapsLink
        );

        contacts.forEach(c -> {
            if (c.isPrimary()) {
                notificationService.sendEmailAlert(user, c.getEmail(), subject, body);
            }
        });

        return saved;
    }

    public void resolveSOS(Long alertId, String notes) {
        SOSAlert alert = sosAlertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("SOS Alert not found"));
        alert.setStatus("RESOLVED");
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolutionNotes(notes);
        sosAlertRepository.save(alert);

        if (alert.getJourney() != null) {
            Journey j = alert.getJourney();
            j.setStatus("COMPLETED");
            j.setEndTime(LocalDateTime.now());
            journeyRepository.save(j);
        }
    }

    @Scheduled(fixedRate = 60000)
    public void checkSilentEscortTimeouts() {
        LocalDateTime now = LocalDateTime.now();
        List<Journey> timeoutJourneys = journeyRepository
                .findByStatusAndSilentEscortEnabledTrueAndExpectedCheckInTimeBefore("ACTIVE", now);
        
        List<Journey> timeoutDeviated = journeyRepository
                .findByStatusAndSilentEscortEnabledTrueAndExpectedCheckInTimeBefore("DEVIATED", now);

        timeoutJourneys.addAll(timeoutDeviated);

        for (Journey j : timeoutJourneys) {
            j.setStatus("TIMEOUT_ALERT");
            journeyRepository.save(j);

            JourneyTimeline timeline = JourneyTimeline.builder()
                    .journey(j)
                    .latitude(j.getCurrentLat())
                    .longitude(j.getCurrentLng())
                    .eventType("TIMEOUT")
                    .description("Silent Escort timeout occurred: user missed check-in threshold")
                    .build();
            timelineRepository.save(timeline);

            List<TrustedContact> contacts = contactRepository.findByUserId(j.getUser().getId());
            String mapsLink = String.format("https://maps.google.com/?q=%f,%f", j.getCurrentLat(), j.getCurrentLng());
            String subject = String.format("SwaSuraksha ALERT: Silent Escort Timeout for %s", j.getUser().getFullName());
            String body = String.format(
                    "Alert: %s has missed their scheduled journey check-in window.\n" +
                    "Destination: %s\n" +
                    "Last known location Coords (%f, %f)\n" +
                    "Google Maps: %s\n\n" +
                    "Please check on them immediately.",
                    j.getUser().getFullName(), j.getEndLocation(), j.getCurrentLat(), j.getCurrentLng(), mapsLink
            );

            contacts.stream()
                    .filter(TrustedContact::isSilentEscortEnabled)
                    .forEach(c -> {
                        notificationService.sendEmailAlert(j.getUser(), c.getEmail(), subject, body);
                    });
        }
    }

    public List<Journey> getMyJourneys() {
        User user = authService.getAuthenticatedUser();
        return journeyRepository.findByUserId(user.getId());
    }

    public List<JourneyTimeline> getJourneyTimeline(Long journeyId) {
        User user = authService.getAuthenticatedUser();
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new RuntimeException("Journey not found"));

        if (!journey.getUser().getId().equals(user.getId()) && !user.getRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Unauthorized");
        }

        return timelineRepository.findByJourneyIdOrderByTimestampAsc(journeyId);
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
