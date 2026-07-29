package com.swasuraksha.controller;

import com.swasuraksha.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/api/v1/health")
    public ApiResponse health() {
        return new ApiResponse(
                true,
                "SwaSuraksha Backend Running",
                "Backend is healthy."
        );
    }
}
