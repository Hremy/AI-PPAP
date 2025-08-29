package com.ai.pat.backend;

import com.ai.pat.backend.model.Project;
import com.ai.pat.backend.repository.ProjectRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ExtendWith(SpringExtension.class)
@Testcontainers
class UserProjectsIdempotencyIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("ai_ppap_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void registerProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.flyway.repair-on-migrate", () -> "true");
        registry.add("spring.flyway.validate-on-migrate", () -> "false");
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ProjectRepository projectRepository;

    private Project p1;
    private Project p2;

    @BeforeEach
    void setup() {
        projectRepository.deleteAll();
        p1 = projectRepository.save(Project.builder().name("MSC-Explora-T1").build());
        p2 = projectRepository.save(Project.builder().name("MG-T2").build());
    }

    private String baseUrl(String path) {
        return "http://localhost:" + port + "/api" + path;
    }

    @Test
    void putIsIdempotentForCurrentUserProjects() {
        // GET empty
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User", "alice.employee@corp.com");

        ResponseEntity<Set<Project>> emptyGet = restTemplate.exchange(
                baseUrl("/v1/users/me/projects"),
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<>() {}
        );
        Assertions.assertEquals(HttpStatus.OK, emptyGet.getStatusCode());
        Assertions.assertTrue(Objects.requireNonNull(emptyGet.getBody()).isEmpty());

        // PUT assign [p1, p2]
        List<Long> first = Arrays.asList(p1.getId(), p2.getId());
        ResponseEntity<String> put1 = restTemplate.exchange(
                baseUrl("/v1/users/me/projects"),
                HttpMethod.PUT,
                new HttpEntity<>(first, headers),
                String.class
        );
        Assertions.assertEquals(HttpStatus.OK, put1.getStatusCode());

        // GET should have 2
        ResponseEntity<Set<Project>> afterPut1 = restTemplate.exchange(
                baseUrl("/v1/users/me/projects"),
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<>() {}
        );
        Assertions.assertEquals(2, Objects.requireNonNull(afterPut1.getBody()).size());

        // PUT same again (same order)
        ResponseEntity<String> put2 = restTemplate.exchange(
                baseUrl("/v1/users/me/projects"),
                HttpMethod.PUT,
                new HttpEntity<>(first, headers),
                String.class
        );
        Assertions.assertEquals(HttpStatus.OK, put2.getStatusCode());

        // GET still 2
        ResponseEntity<Set<Project>> afterPut2 = restTemplate.exchange(
                baseUrl("/v1/users/me/projects"),
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<>() {}
        );
        Assertions.assertEquals(2, Objects.requireNonNull(afterPut2.getBody()).size());

        // PUT same set reversed
        List<Long> reversed = Arrays.asList(p2.getId(), p1.getId());
        ResponseEntity<String> put3 = restTemplate.exchange(
                baseUrl("/v1/users/me/projects"),
                HttpMethod.PUT,
                new HttpEntity<>(reversed, headers),
                String.class
        );
        Assertions.assertEquals(HttpStatus.OK, put3.getStatusCode());

        // GET still the same set
        ResponseEntity<Set<Project>> afterPut3 = restTemplate.exchange(
                baseUrl("/v1/users/me/projects"),
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<>() {}
        );
        Set<String> names = Objects.requireNonNull(afterPut3.getBody()).stream().map(Project::getName).collect(Collectors.toSet());
        Assertions.assertEquals(Set.of("MSC-Explora-T1", "MG-T2"), names);
    }
}
