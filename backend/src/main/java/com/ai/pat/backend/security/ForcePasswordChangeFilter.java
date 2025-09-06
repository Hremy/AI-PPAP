package com.ai.pat.backend.security;

import com.ai.pat.backend.model.User;
import com.ai.pat.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Component
@Order(10)
public class ForcePasswordChangeFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public ForcePasswordChangeFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        // Allow preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        // Normalize to path without host, already is
        // Whitelist: auth endpoints and change-password and public health
        if (isWhitelisted(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Identify current user from X-User or SecurityContext Authentication name
        String userKey = request.getHeader("X-User");
        if (userKey == null || userKey.isBlank()) {
            try {
                org.springframework.security.core.Authentication auth =
                        org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated()) {
                    userKey = auth.getName();
                }
            } catch (Exception ignore) {}
        }

        if (userKey == null || userKey.isBlank()) {
            // If unauthenticated, continue and let other security handle it
            filterChain.doFilter(request, response);
            return;
        }

        Optional<User> userOpt = Optional.empty();
        try {
            userOpt = userRepository.findByUsername(userKey);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(userKey);
            }
        } catch (Exception ignore) {}

        if (userOpt.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        Set<String> roles = userOpt.get().getRoles();
        if (roles != null && roles.contains("FORCE_PASSWORD_CHANGE")) {
            // Block everything except whitelisted paths
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            String body = toJson(Map.of(
                    "success", false,
                    "message", "Password change required before continuing",
                    "error", "FORCE_PASSWORD_CHANGE"
            ));
            response.getWriter().write(body);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isWhitelisted(String path) {
        // Allow both with and without /api prefix
        String[] patterns = new String[] {
                "/", 
                "/health", 
                "/api/health",
                "/v1/auth/**",
                "/api/v1/auth/**",
                "/v1/users/change-password",
                "/api/v1/users/change-password",
                // Static assets
                "/static/**", 
                "/assets/**"
        };
        for (String p : patterns) {
            if (pathMatcher.match(p, path)) return true;
        }
        return false;
    }

    private String toJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        boolean first = true;
        for (Map.Entry<String, Object> e : map.entrySet()) {
            if (!first) sb.append(',');
            first = false;
            sb.append('"').append(escape(e.getKey())).append('"').append(':');
            Object v = e.getValue();
            if (v instanceof String) {
                sb.append('"').append(escape((String) v)).append('"');
            } else {
                sb.append(String.valueOf(v));
            }
        }
        sb.append("}");
        return sb.toString();
    }

    private String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
