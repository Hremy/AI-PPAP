package com.ai.pat.backend.repository;

import com.ai.pat.backend.model.Project;
import com.ai.pat.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    // Temporarily return empty lists for role-based queries to fix persistence issue
    @Query("SELECT u FROM User u WHERE 1=0")
    List<User> findByRolesIn(@Param("roles") List<String> roles);
    
    @Query("SELECT u FROM User u WHERE 1=0")
    List<User> findByRolesContaining(@Param("role") String role);
    
    @Query("SELECT u FROM User u WHERE u.department = :department")
    List<User> findByDepartment(@Param("department") String department);

    @Query("SELECT DISTINCT u FROM User u WHERE 1=0")
    List<User> findByProjectsAndRole(@Param("projects") List<Project> projects, @Param("role") String role);

    @Query("SELECT DISTINCT u FROM User u JOIN u.managedProjects mp WHERE mp IN :projects")
    List<User> findManagersByManagedProjects(@Param("projects") List<Project> projects);

    @Query("SELECT DISTINCT u FROM User u JOIN u.managedProjects mp WHERE mp.id IN :projectIds")
    List<User> findManagersByManagedProjectIds(@Param("projectIds") List<Long> projectIds);

    // Fallbacks to identify managers when roles are not persisted
    @Query("SELECT DISTINCT u FROM User u JOIN u.managedProjects mp")
    List<User> findAllManagersByManagedProjects();

    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE CONCAT('%', LOWER(:token), '%')")
    List<User> findByEmailContainsIgnoreCase(@Param("token") String token);

    // Native cleanup helpers (dev-friendly) to avoid FK violations when deleting users
    @Modifying
    @Query(value = "DELETE FROM user_roles WHERE user_id = :userId", nativeQuery = true)
    void deleteRolesByUserId(@Param("userId") Long userId);

    @Modifying
    @Query(value = "DELETE FROM user_projects WHERE user_id = :userId", nativeQuery = true)
    void deleteUserProjectsByUserId(@Param("userId") Long userId);

    @Modifying
    @Query(value = "DELETE FROM manager_projects WHERE manager_id = :userId", nativeQuery = true)
    void deleteManagerProjectsByUserId(@Param("userId") Long userId);

    @Modifying
    @Query(value = "DELETE FROM evaluations WHERE employee_id = :userId OR reviewer_id = :userId", nativeQuery = true)
    void deleteEvaluationsByUserInvolved(@Param("userId") Long userId);
}
