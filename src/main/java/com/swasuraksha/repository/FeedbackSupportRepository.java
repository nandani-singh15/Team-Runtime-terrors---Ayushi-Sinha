package com.swasuraksha.repository;

import com.swasuraksha.entity.FeedbackSupport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackSupportRepository extends JpaRepository<FeedbackSupport, Long> {
    List<FeedbackSupport> findByStatusOrderByCreatedAtDesc(String status);
    List<FeedbackSupport> findAllByOrderByCreatedAtDesc();
}
