package com.swasuraksha.repository;

import com.swasuraksha.entity.Journey;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface JourneyRepository extends JpaRepository<Journey, Long> {
    List<Journey> findByUserId(Long userId);
    Optional<Journey> findFirstByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
    
    // Find active journeys with silent escort that have passed their expected check-in time
    List<Journey> findByStatusAndSilentEscortEnabledTrueAndExpectedCheckInTimeBefore(String status, LocalDateTime time);
    
    // Count active journeys
    long countByStatus(String status);
}
