package com.swasuraksha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String bloodType;

    @Lob
    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.swasuraksha.util.EncryptionConverter.class)
    private String allergies;

    @Lob
    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.swasuraksha.util.EncryptionConverter.class)
    private String medicalConditions;

    @Lob
    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.swasuraksha.util.EncryptionConverter.class)
    private String currentMedications;

    @Lob
    @Column(columnDefinition = "TEXT")
    @Convert(converter = com.swasuraksha.util.EncryptionConverter.class)
    private String emergencyInstructions;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String aiMedicalSummary;

    @Column(unique = true, nullable = false)
    private String publicAccessKey; // UUID to allow first responders public view

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String qrCodeBase64; // cached base64 QR image

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
