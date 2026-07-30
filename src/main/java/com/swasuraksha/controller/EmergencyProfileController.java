package com.swasuraksha.controller;

import com.swasuraksha.dto.ApiResponse;
import com.swasuraksha.entity.EmergencyProfile;
import com.swasuraksha.service.EmergencyProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/emergency")
public class EmergencyProfileController {

    @Autowired
    private EmergencyProfileService profileService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getMyProfile() {
        EmergencyProfile profile = profileService.getMyProfile();
        Map<String, Object> data = profileService.getProfileWithBlockchainStatus(profile);
        return ResponseEntity.ok(new ApiResponse(true, "Medical profile fetched successfully", data));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(@RequestBody EmergencyProfile profile) {
        EmergencyProfile updated = profileService.updateProfile(profile);
        Map<String, Object> data = profileService.getProfileWithBlockchainStatus(updated);
        return ResponseEntity.ok(new ApiResponse(true, "Medical profile updated successfully", data));
    }

    @GetMapping("/public-card/{publicAccessKey}")
    public ResponseEntity<ApiResponse> getPublicEmergencyCard(@PathVariable String publicAccessKey) {
        Map<String, Object> card = profileService.getPublicEmergencyCard(publicAccessKey);
        return ResponseEntity.ok(new ApiResponse(true, "Emergency card data loaded", card));
    }
}
