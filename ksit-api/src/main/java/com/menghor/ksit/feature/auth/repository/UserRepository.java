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

    @EntityGraph(attributePaths = {"roles", "classes", "classes.major", "classes.major.department", "department"})
    Optional<UserEntity> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByUsernameAndIdNot(String username, Long id);

    boolean existsByIdentifyNumber(String identifyNumber);

    @Query("SELECT u FROM UserEntity u WHERE u.identifyNumber LIKE :pattern")
    List<UserEntity> findByIdentifyNumberLike(@Param("pattern") String pattern);

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.department LEFT JOIN FETCH u.classes c LEFT JOIN FETCH c.major WHERE u.classes.id = :classesId")
    List<UserEntity> findByClassesId(@Param("classesId") Long classesId);

    @Query("SELECT COUNT(u) FROM UserEntity u JOIN u.roles r WHERE r.name = :role AND u.status = :status")
    long countActiveUsersByRole(@Param("role") RoleEnum role, @Param("status") Status status);

    @EntityGraph(attributePaths = {"roles", "department", "classes", "classes.major"})
    Page<UserEntity> findAll(org.springframework.data.jpa.domain.Specification<UserEntity> spec, Pageable pageable);
}
