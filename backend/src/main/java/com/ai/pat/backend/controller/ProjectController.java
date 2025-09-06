package com.ai.pat.backend.controller;

import com.ai.pat.backend.model.Project;
import com.ai.pat.backend.service.ProjectService;
import com.ai.pat.backend.controller.dto.CreateProjectRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/v1/projects", "/projects"})
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Project>> listProjects() {
        return ResponseEntity.ok(projectService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> createProject(@RequestBody CreateProjectRequest request) {
        return ResponseEntity.ok(projectService.create(request.name()));
    }
}
