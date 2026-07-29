package com.swasuraksha.repository;

import com.swasuraksha.entity.SafePoint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SafePointRepository extends JpaRepository<SafePoint, Long> {
    List<SafePoint> findByType(String type);
}
