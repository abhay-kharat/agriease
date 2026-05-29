package com.agriease.backend.service;

import com.agriease.backend.config.JwtUtil;
import com.agriease.backend.dto.RegisterRequest;
import com.agriease.backend.dto.TokenRefreshRequest;
import com.agriease.backend.dto.TokenRefreshResponse;
import com.agriease.backend.entity.RoleType;
import com.agriease.backend.entity.User;
import com.agriease.backend.entity.RefreshToken;
import com.agriease.backend.repository.FarmerRepository;
import com.agriease.backend.repository.SupplierRepository;
import com.agriease.backend.repository.UserRepository;
import com.agriease.backend.repository.UserRoleRepository;
import com.agriease.backend.repository.RefreshTokenRepository;
import com.agriease.delivery.repositories.DeliveryAgentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock private UserRepository repo;
    @Mock private UserRoleRepository userRoleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private DeliveryAgentRepository deliveryAgentRepository;
    @Mock private FarmerRepository farmerRepository;
    @Mock private SupplierRepository supplierRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    void testRegisterNewFarmer() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test Farmer");
        req.setEmail("test@farm.com");
        req.setPassword("pass");
        req.setRole("FARMER");
        req.setPhone("12345");
        req.setAddress("123 Farm St");

        when(repo.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        
        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setName("Test Farmer");
        when(repo.save(any(User.class))).thenReturn(savedUser);

        User result = authService.register(req);

        assertNotNull(result);
        verify(repo, times(1)).save(any(User.class));
        verify(farmerRepository, times(1)).save(any());
        verify(supplierRepository, never()).save(any());
    }

    @Test
    void testRegisterWithExistingUsernameThrowsException() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test User");
        req.setEmail("test2@farm.com");
        req.setUsername("taken_user");
        req.setPassword("pass");
        req.setRole("FARMER");

        when(repo.findByEmail(anyString())).thenReturn(Optional.empty());
        when(repo.findByUsername("taken_user")).thenReturn(Optional.of(new User()));

        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () -> {
            authService.register(req);
        }, "Username already taken");
    }

    @Test
    void testRegisterDeliveryAgentWithInvalidVehicleTypeThrowsException() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test Agent");
        req.setEmail("agent@delivery.com");
        req.setPassword("pass");
        req.setRole("DELIVERY_AGENT");
        req.setVehicleTypes(java.util.List.of("Rocket", "Bike"));

        when(repo.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        
        User savedUser = new User();
        savedUser.setId(2L);
        savedUser.setEmail("agent@delivery.com");
        when(repo.save(any(User.class))).thenReturn(savedUser);

        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () -> {
            authService.register(req);
        }, "Unsupported vehicle type: Rocket");
    }

    @Test
    void testRegisterDeliveryAgentWithValidVehicleTypes() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test Agent");
        req.setEmail("agent@delivery.com");
        req.setPassword("pass");
        req.setRole("DELIVERY_AGENT");
        req.setVehicleTypes(java.util.List.of("Van", "Bike"));

        when(repo.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        
        User savedUser = new User();
        savedUser.setId(2L);
        savedUser.setName("Test Agent");
        savedUser.setEmail("agent@delivery.com");
        when(repo.save(any(User.class))).thenReturn(savedUser);
        when(deliveryAgentRepository.findByEmail("agent@delivery.com")).thenReturn(Optional.empty());

        User result = authService.register(req);

        assertNotNull(result);
        verify(deliveryAgentRepository, times(1)).save(any(com.agriease.backend.entity.DeliveryAgent.class));
    }

    @Test
    void testLoginUpdatesExistingRefreshToken() {
        com.agriease.backend.dto.LoginRequest req = new com.agriease.backend.dto.LoginRequest();
        req.email = "test@farm.com";
        req.password = "pass";

        User user = new User();
        user.setId(1L);
        user.setEmail(req.email);
        user.setPassword("encoded");
        user.setActiveRole(RoleType.FARMER);
        user.addRole(RoleType.FARMER);

        RefreshToken existingToken = new RefreshToken();
        existingToken.setId(10L);
        existingToken.setUser(user);

        when(repo.findByEmail(req.email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(eq(req.password), anyString())).thenReturn(true);
        when(refreshTokenRepository.findByUser(user)).thenReturn(Optional.of(existingToken));
        when(jwtUtil.generateToken(anyString(), any(RoleType.class))).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(anyString())).thenReturn("new-refresh-token");

        authService.login(req);

        verify(refreshTokenRepository, times(1)).save(existingToken);
        assertEquals(10L, existingToken.getId()); // Should still have the same ID
    }

    private String hashToken(String token) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getEncoder().encodeToString(hash);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }

    @Test
    void testRefreshTokenSuccess() {
        String oldRefreshToken = "old-refresh-token";
        TokenRefreshRequest req = new TokenRefreshRequest();
        req.setRefreshToken(oldRefreshToken);

        User user = new User();
        user.setEmail("test@farm.com");
        user.setActiveRole(RoleType.FARMER);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(hashToken(oldRefreshToken));
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusSeconds(600));

        when(refreshTokenRepository.findByToken(hashToken(oldRefreshToken))).thenReturn(Optional.of(refreshToken));
        when(jwtUtil.generateToken(anyString(), any(RoleType.class))).thenReturn("new-access-token");

        TokenRefreshResponse response = authService.refreshToken(req);

        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
        assertEquals(oldRefreshToken, response.getRefreshToken());
    }

    @Test
    void testLogoutRevokesTokens() {
        String email = "test@farm.com";
        User user = new User();
        user.setEmail(email);

        when(repo.findByEmail(email)).thenReturn(Optional.of(user));

        authService.logout(email);

        verify(refreshTokenRepository, times(1)).deleteByUser(user);
    }
}
