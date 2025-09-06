package com.ai.pat.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = {"com.ai.pat.backend.model", "com.ai.pat.backend.entity"})
@EnableJpaRepositories(basePackages = "com.ai.pat.backend.repository")
public class BackendApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
