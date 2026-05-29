package com.agriease.backend.controller;

import com.agriease.backend.dto.ApiResponse;
import com.agriease.backend.dto.RegisterRequest;
import com.agriease.backend.entity.RoleType;
import com.agriease.backend.entity.User;
import com.agriease.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class AuthControllerTest {

    private AuthService authService;
    private AuthController authController;

    @BeforeEach
    void setUp() {
        authService = Mockito.mock(AuthService.class);
        authController = new AuthController(authService);
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("password123");
        request.setRole("FARMER");
        request.setPhone("1234567890");

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setName("John Doe");
        mockUser.setEmail("john@example.com");
        mockUser.setActiveRole(RoleType.FARMER);

        when(authService.register(any(RegisterRequest.class))).thenReturn(mockUser);

        ResponseEntity<ApiResponse<User>> response = authController.register(request);
        
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("John Doe", response.getBody().getData().getName());
        assertEquals(200, response.getBody().getStatus());
    }
}
