package com.swasuraksha.repository;

import com.swasuraksha.entity.CommunityReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunityReportRepository extends JpaRepository<CommunityReport, Long> {
    List<CommunityReport> findByStatus(String status);
    List<CommunityReport> findByReporterIdOrderByReportedAtDesc(Long reporterId);
    long countByStatus(String status);
}
