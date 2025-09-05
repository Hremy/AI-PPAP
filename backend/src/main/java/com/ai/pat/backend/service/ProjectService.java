package com.ai.pat.backend.service;

import com.ai.pat.backend.model.Project;
import com.ai.pat.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<Project> getAll() {
        return projectRepository.findAll();
    }

    @Transactional
    public Project createIfNotExists(String name) {
        return projectRepository.findByName(name)
                .orElseGet(() -> projectRepository.save(Project.builder().name(name).build()));
    }

    @Transactional
    public Project create(String name) {
        if (projectRepository.existsByName(name)) {
            throw new IllegalArgumentException("Project already exists: " + name);
        }
        return projectRepository.save(Project.builder().name(name).build());
    }
}
