package com.agriease.backend.service;

import com.agriease.backend.config.JwtUtil;
import com.agriease.backend.dto.RegisterRequest;
import com.agriease.backend.entity.RoleType;
import com.agriease.backend.entity.User;
import com.agriease.backend.repository.FarmerRepository;
import com.agriease.backend.repository.SupplierRepository;
import com.agriease.backend.repository.UserRepository;
import com.agriease.backend.repository.UserRoleRepository;
import com.agriease.delivery.repositories.DeliveryAgentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

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
}
