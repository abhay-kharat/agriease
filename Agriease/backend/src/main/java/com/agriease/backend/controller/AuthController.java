package com.agriease.backend.controller;

import com.agriease.backend.dto.ApiResponse;
import com.agriease.backend.dto.LoginRequest;
import com.agriease.backend.dto.LoginResponse;
import com.agriease.backend.dto.RegisterRequest;
import com.agriease.backend.dto.TokenRefreshRequest;
import com.agriease.backend.dto.TokenRefreshResponse;
import com.agriease.backend.entity.User;
import com.agriease.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping({"/auth", "/api/auth"})
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User user = service.register(request);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        LoginResponse response = service.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        TokenRefreshResponse response = service.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        service.logout(email);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}
