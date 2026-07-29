package com.swasuraksha.repository;

import com.swasuraksha.entity.EmergencyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmergencyProfileRepository extends JpaRepository<EmergencyProfile, Long> {
    Optional<EmergencyProfile> findByUserId(Long userId);
    Optional<EmergencyProfile> findByPublicAccessKey(String publicAccessKey);
}
