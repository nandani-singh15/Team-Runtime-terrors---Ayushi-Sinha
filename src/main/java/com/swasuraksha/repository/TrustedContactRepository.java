package com.swasuraksha.repository;

import com.swasuraksha.entity.TrustedContact;
import com.swasuraksha.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrustedContactRepository extends JpaRepository<TrustedContact, Long> {
    List<TrustedContact> findByUser(User user);
    List<TrustedContact> findByUserId(Long userId);
}
