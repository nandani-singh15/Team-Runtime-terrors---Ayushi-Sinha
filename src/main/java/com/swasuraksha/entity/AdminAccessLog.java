package com.swasuraksha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_access_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String adminUsername;

    @Column(nullable = false)
    private String patientName;

    @Column(nullable = false)
    private LocalDateTime accessedAt;

    private String reason;
}
