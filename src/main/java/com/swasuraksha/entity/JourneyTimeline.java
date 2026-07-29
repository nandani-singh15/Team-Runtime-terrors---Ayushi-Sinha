package com.swasuraksha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "journey_timelines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourneyTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journey_id", nullable = false)
    private Journey journey;

    private double latitude;
    private double longitude;

    // Event type: CHECK_IN, ROUTE_DEVIATION, SPEED_ALERT, TIMEOUT, SOS, START, END
    private String eventType;

    private String description;

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
