package com.swasuraksha.repository;

import com.swasuraksha.entity.SafetyRating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SafetyRatingRepository extends JpaRepository<SafetyRating, Long> {
    List<SafetyRating> findByUserIdOrderByCreatedAtDesc(Long userId);
}
