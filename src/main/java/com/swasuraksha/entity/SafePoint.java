package com.swasuraksha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "safe_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SafePoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    // Type: POLICE_STATION, HOSPITAL, 24X7_STORE, METRO_STATION, SHELTER
    private String type;

    private double latitude;
    private double longitude;

    private double averageSafetyRating;
    private int totalRatings;
}
