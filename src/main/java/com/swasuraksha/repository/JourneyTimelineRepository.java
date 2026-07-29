package com.swasuraksha.repository;

import com.swasuraksha.entity.JourneyTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JourneyTimelineRepository extends JpaRepository<JourneyTimeline, Long> {
    List<JourneyTimeline> findByJourneyIdOrderByTimestampAsc(Long journeyId);
}
