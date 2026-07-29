package com.swasuraksha.repository;

import com.swasuraksha.entity.SOSAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SOSAlertRepository extends JpaRepository<SOSAlert, Long> {
    List<SOSAlert> findByStatus(String status);
    List<SOSAlert> findByUserIdOrderByTriggeredAtDesc(Long userId);
    long countByStatus(String status);
}
