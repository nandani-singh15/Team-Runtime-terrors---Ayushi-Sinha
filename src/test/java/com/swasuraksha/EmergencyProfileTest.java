package com.swasuraksha;

import com.swasuraksha.entity.EmergencyProfile;
import com.swasuraksha.entity.User;
import com.swasuraksha.repository.EmergencyProfileRepository;
import com.swasuraksha.repository.UserRepository;
import com.swasuraksha.service.AuthService;
import com.swasuraksha.service.EmergencyProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class EmergencyProfileTest {

    @Autowired
    private EmergencyProfileService profileService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmergencyProfileRepository profileRepository;

    @MockBean
    private AuthService authService;

    private User testUser;

    @Autowired
    private com.swasuraksha.repository.SOSAlertRepository sosAlertRepository;

    @BeforeEach
    public void setup() {
        sosAlertRepository.deleteAll();
        profileRepository.deleteAll();
        userRepository.deleteAll();

        testUser = User.builder()
                .email("responder@swasuraksha.com")
                .password("encoded_pass")
                .fullName("John Doe")
                .phoneNumber("+919999999999")
                .role("ROLE_USER")
                .build();
        testUser = userRepository.save(testUser);

        Mockito.when(authService.getAuthenticatedUser()).thenReturn(testUser);
    }

    @Test
    public void testGetAndUpdateProfileFlow() {
        EmergencyProfile profile = profileService.getMyProfile();
        assertNotNull(profile);
        assertEquals("Not Specified", profile.getBloodType());
        assertNotNull(profile.getPublicAccessKey());
        assertNotNull(profile.getQrCodeBase64());

        profile.setBloodType("O-");
        profile.setAllergies("Peanut Allergy, Penicillin");
        profile.setMedicalConditions("Asthma");
        profile.setCurrentMedications("Albuterol Inhaler");
        profile.setEmergencyInstructions("Keep inhaler in the front pocket.");

        EmergencyProfile updated = profileService.updateProfile(profile);
        assertNotNull(updated);
        assertEquals("O-", updated.getBloodType());
        assertTrue(updated.getAiMedicalSummary().contains("PENICILLIN"));

        // Create an active SOS alert to unlock the emergency card profile details
        com.swasuraksha.entity.SOSAlert alert = com.swasuraksha.entity.SOSAlert.builder()
                .user(testUser)
                .latitude(28.6139)
                .longitude(77.2090)
                .status("ACTIVE")
                .triggeredAt(java.time.LocalDateTime.now())
                .build();
        sosAlertRepository.save(alert);

        Map<String, Object> publicCard = profileService.getPublicEmergencyCard(updated.getPublicAccessKey());
        assertEquals("John Doe", publicCard.get("fullName"));
        assertEquals("O-", publicCard.get("bloodType"));
        assertTrue(publicCard.get("allergies").toString().contains("Peanut Allergy"));
    }
}
