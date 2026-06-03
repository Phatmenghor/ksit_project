package com.menghor.ksit.feature.auth.repository;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.auth.models.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long>, JpaSpecificationExecutor<UserEntity> {

    @EntityGraph(attributePaths = {"roles", "classes", "department"})
    Optional<UserEntity> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM UserEntity u WHERE u.identifyNumber LIKE :pattern")
    List<UserEntity> findByIdentifyNumberLike(@Param("pattern") String pattern);

    boolean existsByUsernameAndIdNot(String username, Long id);

    /**
     * Check if identifyNumber exists
     */
    boolean existsByIdentifyNumber(String identifyNumber);

    List<UserEntity> findByClassesId(Long id);

    @Query("SELECT COUNT(u) FROM UserEntity u JOIN u.roles r WHERE r.name = :role AND u.status = :status")
    long countActiveUsersByRole(@Param("role") RoleEnum role, @Param("status") Status status);

    // =====================================================================
    // DEPARTMENT LOADING QUERIES - FIXED
    // =====================================================================

    /**
     * Find user by ID with eager loading of department and roles
     */
    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.department d LEFT JOIN FETCH u.roles r WHERE u.id = :id")
    Optional<UserEntity> findByIdWithEagerDepartment(@Param("id") Long id);

    /**
     * Find user by ID with EntityGraph for department and roles
     */
    @EntityGraph(attributePaths = {"roles", "department", "classes"})
    @Query("SELECT u FROM UserEntity u WHERE u.id = :id")
    Optional<UserEntity> findByIdWithDepartmentAndRoles(@Param("id") Long id);

    /**
     * Find all staff users with eager department loading
     */
    @Query("SELECT DISTINCT u FROM UserEntity u " +
           "LEFT JOIN FETCH u.department d " +
           "LEFT JOIN FETCH u.roles r " +
           "WHERE r.name IN ('ADMIN', 'TEACHER', 'STAFF', 'DEVELOPER')")
    List<UserEntity> findAllStaffWithDepartments();

    /**
     * Find staff users with department by specification and pagination
     */
    @EntityGraph(attributePaths = {"roles", "department"})
    Page<UserEntity> findAll(org.springframework.data.jpa.domain.Specification<UserEntity> spec, Pageable pageable);

    /**
     * Find user by username with all relationships
     */
    @Query("SELECT u FROM UserEntity u " +
           "LEFT JOIN FETCH u.department d " +
           "LEFT JOIN FETCH u.roles r " +
           "LEFT JOIN FETCH u.classes c " +
           "WHERE u.username = :username")
    Optional<UserEntity> findByUsernameWithAllRelationships(@Param("username") String username);

    /**
     * Check if department is assigned to any user
     */
    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.department.id = :departmentId")
    long countByDepartmentId(@Param("departmentId") Long departmentId);

    /**
     * Find users by department ID
     */
    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.roles WHERE u.department.id = :departmentId")
    List<UserEntity> findByDepartmentId(@Param("departmentId") Long departmentId);
}