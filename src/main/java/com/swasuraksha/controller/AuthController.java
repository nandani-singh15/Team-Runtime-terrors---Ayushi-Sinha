package com.swasuraksha.controller;

import com.swasuraksha.dto.ApiResponse;
import com.swasuraksha.dto.AuthResponse;
import com.swasuraksha.dto.LoginRequest;
import com.swasuraksha.dto.RegisterRequest;
import com.swasuraksha.entity.User;
import com.swasuraksha.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(new ApiResponse(true, "Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(new ApiResponse(true, "Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getMe() {
        User user = authService.getAuthenticatedUser();
        user.setPassword(null); // Hide password hash
        return ResponseEntity.ok(new ApiResponse(true, "Profile fetched successfully", user));
    }
}
