package com.ai.pat.backend.service;

import com.ai.pat.backend.dto.AuthenticationRequest;
import com.ai.pat.backend.dto.AuthenticationResponse;
import com.ai.pat.backend.dto.RegisterRequest;
import com.ai.pat.backend.model.Role;
import com.ai.pat.backend.model.User;
import com.ai.pat.backend.repository.UserRepository;
import com.ai.pat.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthenticationService authenticationService;

    private User testUser;
    private RegisterRequest registerRequest;
    private AuthenticationRequest authRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .firstName("John")
                .lastName("Doe")
                .role(Role.ROLE_EMPLOYEE)
                .build();

        registerRequest = RegisterRequest.builder()
                .email("test@example.com")
                .password("password123")
                .firstName("John")
                .lastName("Doe")
                .build();

        authRequest = AuthenticationRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();
    }

    @Test
    void register_ShouldCreateNewUserAndReturnToken() {
        // Given
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any())).thenReturn(testUser);
        when(jwtService.generateToken(any())).thenReturn("jwtToken");

        // When
        AuthenticationResponse response = authenticationService.register(registerRequest);

        // Then
        assertNotNull(response);
        assertEquals("jwtToken", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("ROLE_EMPLOYEE", response.getRole());

        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
        verify(jwtService).generateToken(any(User.class));
    }

    @Test
    void authenticate_ShouldReturnTokenForValidCredentials() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(any())).thenReturn("jwtToken");

        // When
        AuthenticationResponse response = authenticationService.authenticate(authRequest);

        // Then
        assertNotNull(response);
        assertEquals("jwtToken", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("ROLE_EMPLOYEE", response.getRole());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail("test@example.com");
        verify(jwtService).generateToken(testUser);
    }
}
