package com.swasuraksha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "journeys")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Journey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String startLocation;
    private String endLocation;

    private double startLat;
    private double startLng;
    private double endLat;
    private double endLng;

    private double currentLat;
    private double currentLng;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Status: PLANNED, ACTIVE, COMPLETED, SOS, TIMEOUT_ALERT
    private String status;

    private int riskScore; // 0 to 100

    @Lob
    @Column(columnDefinition = "TEXT")
    private String safetyRouteExplanation;

    private LocalDateTime expectedCheckInTime; // Silent Escort threshold

    private boolean silentEscortEnabled;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
