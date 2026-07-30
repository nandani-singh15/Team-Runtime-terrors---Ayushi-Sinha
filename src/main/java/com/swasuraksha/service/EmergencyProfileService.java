package com.swasuraksha.service;

import com.swasuraksha.entity.EmergencyProfile;
import com.swasuraksha.entity.TrustedContact;
import com.swasuraksha.entity.User;
import com.swasuraksha.repository.EmergencyProfileRepository;
import com.swasuraksha.repository.TrustedContactRepository;
import com.swasuraksha.repository.SOSAlertRepository;
import com.swasuraksha.repository.JourneyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmergencyProfileService {

    @Autowired
    private EmergencyProfileRepository profileRepository;

    @Autowired
    private TrustedContactRepository contactRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private QrCodeGeneratorService qrCodeGeneratorService;

    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private SOSAlertRepository sosAlertRepository;

    @Autowired
    private JourneyRepository journeyRepository;

    @Autowired
    private com.swasuraksha.repository.AdminAccessLogRepository adminAccessLogRepository;

    public EmergencyProfile getMyProfile() {
        User user = authService.getAuthenticatedUser();
        return profileRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultProfile(user));
    }

    private EmergencyProfile createDefaultProfile(User user) {
        String accessKey = UUID.randomUUID().toString();
        
        String qrLink = "https://swasuraksha.vercel.app/emergency/public-card/" + accessKey;
        String qrBase64 = qrCodeGeneratorService.generateQrCodeBase64(qrLink, 300, 300);

        EmergencyProfile profile = EmergencyProfile.builder()
                .user(user)
                .bloodType("Not Specified")
                .allergies("None")
                .medicalConditions("None")
                .currentMedications("None")
                .emergencyInstructions("None")
                .aiMedicalSummary("No summary generated yet.")
                .publicAccessKey(accessKey)
                .qrCodeBase64(qrBase64)
                .updatedAt(LocalDateTime.now())
                .build();

        EmergencyProfile saved = profileRepository.save(profile);
        
        // Record genesis block hash for new profile
        String hash = calculateProfileDataHash(saved);
        blockchainService.recordProfileHash(saved.getId(), hash);

        return saved;
    }

    public EmergencyProfile updateProfile(EmergencyProfile request) {
        User user = authService.getAuthenticatedUser();
        EmergencyProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultProfile(user));

        profile.setBloodType(request.getBloodType());
        profile.setAllergies(request.getAllergies());
        profile.setMedicalConditions(request.getMedicalConditions());
        profile.setCurrentMedications(request.getCurrentMedications());
        profile.setEmergencyInstructions(request.getEmergencyInstructions());

        String summary = geminiService.generateMedicalSummary(
                request.getBloodType(),
                request.getAllergies(),
                request.getMedicalConditions(),
                request.getCurrentMedications(),
                request.getEmergencyInstructions()
        );
        profile.setAiMedicalSummary(summary);
        profile.setUpdatedAt(LocalDateTime.now());

        String qrLink = "https://swasuraksha.vercel.app/emergency/public-card/" + profile.getPublicAccessKey();
        String qrBase64 = qrCodeGeneratorService.generateQrCodeBase64(qrLink, 300, 300);
        profile.setQrCodeBase64(qrBase64);

        EmergencyProfile saved = profileRepository.save(profile);

        // Mine a block on the blockchain ledger
        String hash = calculateProfileDataHash(saved);
        blockchainService.recordProfileHash(saved.getId(), hash);

        return saved;
    }

    public Map<String, Object> getPublicEmergencyCard(String publicAccessKey) {
        EmergencyProfile profile = profileRepository.findByPublicAccessKey(publicAccessKey)
                .orElseThrow(() -> new RuntimeException("Invalid QR Access Key"));

        User user = profile.getUser();
        
        // Log access if performed by an administrator
        try {
            User requester = authService.getAuthenticatedUser();
            if (requester != null && "ROLE_ADMIN".equalsIgnoreCase(requester.getRole())) {
                com.swasuraksha.entity.AdminAccessLog log = com.swasuraksha.entity.AdminAccessLog.builder()
                        .adminUsername(requester.getEmail())
                        .patientName(user.getFullName())
                        .accessedAt(LocalDateTime.now())
                        .reason("Accessed medical card lookup via Admin panel")
                        .build();
                adminAccessLogRepository.save(log);
            }
        } catch (Exception ignored) {}

        // Security Lock check: only allow viewing if user has ACTIVE SOS alert or TIMEOUT_ALERT
        boolean hasActiveSos = sosAlertRepository.findByStatus("ACTIVE").stream()
                .anyMatch(alert -> alert.getUser().getId().equals(user.getId()));
                
        boolean hasTimeoutJourney = journeyRepository.findByUserId(user.getId()).stream()
                .anyMatch(j -> "TIMEOUT_ALERT".equalsIgnoreCase(j.getStatus()) || "SOS".equalsIgnoreCase(j.getStatus()));

        if (!hasActiveSos && !hasTimeoutJourney) {
            Map<String, Object> restricted = new HashMap<>();
            restricted.put("fullName", user.getFullName());
            restricted.put("isLocked", true);
            restricted.put("message", "ACCESS RESTRICTED: Emergency medical profile is locked. No active SOS alert found for this user.");
            return restricted;
        }

        List<TrustedContact> contacts = contactRepository.findByUserId(user.getId());
        List<Map<String, String>> emergencyContacts = contacts.stream()
                .filter(TrustedContact::isPrimary)
                .map(c -> Map.of(
                        "name", c.getName(),
                        "phoneNumber", c.getPhoneNumber()
                ))
                .collect(Collectors.toList());

        if (emergencyContacts.isEmpty()) {
            emergencyContacts = contacts.stream()
                    .map(c -> Map.of(
                            "name", c.getName(),
                            "phoneNumber", c.getPhoneNumber()
                    ))
                    .collect(Collectors.toList());
        }

        // Verify blockchain integrity
        String currentHash = calculateProfileDataHash(profile);
        boolean isTamperFree = blockchainService.verifyIntegrity(profile.getId(), currentHash);
        String ledgerHash = blockchainService.getLatestProfileHash(profile.getId());

        Map<String, Object> publicCard = new HashMap<>();
        publicCard.put("fullName", user.getFullName());
        publicCard.put("bloodType", profile.getBloodType());
        publicCard.put("allergies", profile.getAllergies());
        publicCard.put("medicalConditions", profile.getMedicalConditions());
        publicCard.put("currentMedications", profile.getCurrentMedications());
        publicCard.put("emergencyInstructions", profile.getEmergencyInstructions());
        publicCard.put("aiMedicalSummary", profile.getAiMedicalSummary());
        publicCard.put("emergencyContacts", emergencyContacts);
        publicCard.put("isLocked", false);
        
        // Blockchain integrity metrics
        publicCard.put("blockchainStatus", isTamperFree ? "VERIFIED" : "TAMPER_DETECTED");
        publicCard.put("blockchainHash", ledgerHash);

        return publicCard;
    }

    public Map<String, Object> getProfileWithBlockchainStatus(EmergencyProfile profile) {
        String currentHash = calculateProfileDataHash(profile);
        String ledgerHash = blockchainService.getLatestProfileHash(profile.getId());
        
        // If first load and ledger hasn't mined it yet, record block
        if ("0x0000000000000000000000000000000000000000000000000000000000000000".equals(ledgerHash)) {
            blockchainService.recordProfileHash(profile.getId(), currentHash);
            ledgerHash = currentHash;
        }

        boolean isTamperFree = blockchainService.verifyIntegrity(profile.getId(), currentHash);

        Map<String, Object> map = new HashMap<>();
        map.put("id", profile.getId());
        map.put("bloodType", profile.getBloodType());
        map.put("allergies", profile.getAllergies());
        map.put("medicalConditions", profile.getMedicalConditions());
        map.put("currentMedications", profile.getCurrentMedications());
        map.put("emergencyInstructions", profile.getEmergencyInstructions());
        map.put("aiMedicalSummary", profile.getAiMedicalSummary());
        map.put("publicAccessKey", profile.getPublicAccessKey());
        map.put("qrCodeBase64", profile.getQrCodeBase64());
        
        map.put("blockchainStatus", isTamperFree ? "VERIFIED" : "TAMPER_DETECTED");
        map.put("blockchainHash", ledgerHash);

        return map;
    }

    private String calculateProfileDataHash(EmergencyProfile profile) {
        String rawData = String.format("%d|%s|%s|%s|%s|%s",
                profile.getId(),
                profile.getBloodType() != null ? profile.getBloodType() : "",
                profile.getAllergies() != null ? profile.getAllergies() : "",
                profile.getMedicalConditions() != null ? profile.getMedicalConditions() : "",
                profile.getCurrentMedications() != null ? profile.getCurrentMedications() : "",
                profile.getEmergencyInstructions() != null ? profile.getEmergencyInstructions() : ""
        );
        return com.swasuraksha.util.HashUtil.sha256(rawData);
    }
}
