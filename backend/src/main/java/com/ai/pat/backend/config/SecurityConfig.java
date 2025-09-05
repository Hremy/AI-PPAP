package com.ai.pat.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers("/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/health/**").permitAll()
                .requestMatchers("/v1/health/**").permitAll()
                .requestMatchers("/health/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                
                // TEMPORARY: Allow all endpoints for development
                // TODO: Implement proper JWT authentication filter
                .requestMatchers("/api/v1/admin/**").permitAll()
                .requestMatchers("/v1/admin/**").permitAll()
                .requestMatchers("/api/admin/**").permitAll()
                .requestMatchers("/api/v1/manager/**").permitAll()
                .requestMatchers("/v1/manager/**").permitAll()
                .requestMatchers("/api/manager/**").permitAll()
                .requestMatchers("/api/v1/employee/**").permitAll()
                .requestMatchers("/v1/employee/**").permitAll()
                .requestMatchers("/api/employee/**").permitAll()
                
                // Evaluation endpoints - accessible by authenticated users
                .requestMatchers("/api/evaluations/**").permitAll()
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/v1/evaluations/**").permitAll()
                .requestMatchers("/v1/users/**").permitAll()
                
                // All other requests are permitted for development
                .anyRequest().permitAll()
            );
        // Dev-only: allow setting principal via X-User / X-Roles headers
        http.addFilterBefore(new DevHeaderAuthFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
