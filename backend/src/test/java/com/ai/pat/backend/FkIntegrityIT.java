package com.ai.pat.backend;

import com.ai.pat.backend.model.Project;
import com.ai.pat.backend.model.User;
import com.ai.pat.backend.repository.ProjectRepository;
import com.ai.pat.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Set;

@SpringBootTest
@ExtendWith(SpringExtension.class)
@Testcontainers
class FkIntegrityIT {

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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Project p1;
    private Project p2;

    @BeforeEach
    void setup() {
        projectRepository.deleteAll();
        userRepository.deleteAll();
        p1 = projectRepository.save(Project.builder().name("P1").build());
        p2 = projectRepository.save(Project.builder().name("P2").build());
    }

    @Test
    void deletingUserCascadesJoinRows() {
        User u = User.builder()
                .username("fk.user")
                .email("fk.user@corp.com")
                .password("nop")
                .roles(Set.of("EMPLOYEE"))
                .build();
        u.getProjects().add(p1);
        u.getProjects().add(p2);
        u = userRepository.save(u);

        Integer countBefore = jdbcTemplate.queryForObject(
                "select count(*) from user_projects where user_id = ?",
                Integer.class, u.getId());
        Assertions.assertEquals(2, countBefore);

        userRepository.deleteById(u.getId());

        Integer countAfter = jdbcTemplate.queryForObject(
                "select count(*) from user_projects where user_id = ?",
                Integer.class, u.getId());
        Assertions.assertEquals(0, countAfter);
    }

    @Test
    void deletingManagerCascadesManagerProjects() {
        User m = User.builder()
                .username("fk.manager")
                .email("fk.manager@corp.com")
                .password("nop")
                .roles(Set.of("MANAGER"))
                .build();
        m.getManagedProjects().add(p1);
        m = userRepository.save(m);

        Integer countBefore = jdbcTemplate.queryForObject(
                "select count(*) from manager_projects where manager_id = ?",
                Integer.class, m.getId());
        Assertions.assertEquals(1, countBefore);

        userRepository.deleteById(m.getId());

        Integer countAfter = jdbcTemplate.queryForObject(
                "select count(*) from manager_projects where manager_id = ?",
                Integer.class, m.getId());
        Assertions.assertEquals(0, countAfter);
    }
}
