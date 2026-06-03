package com.menghor.ksit.feature.master.specification;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.master.model.ClassEntity;
import com.menghor.ksit.feature.master.model.DepartmentEntity;
import com.menghor.ksit.feature.master.model.MajorEntity;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

@Slf4j
public class ClassSpecification {

    public static Specification<ClassEntity> hasAcademyYear(Integer academyYear) {
        return (root, query, criteriaBuilder) -> {
            if (academyYear == null) return criteriaBuilder.conjunction();
            return criteriaBuilder.equal(root.get("academyYear"), academyYear);
        };
    }

    public static Specification<ClassEntity> hasStatus(Status status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) return criteriaBuilder.conjunction();
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    public static Specification<ClassEntity> hasMajorId(Long majorId) {
        return (root, query, criteriaBuilder) -> {
            if (majorId == null) return criteriaBuilder.conjunction();
            return criteriaBuilder.equal(root.get("major").get("id"), majorId);
        };
    }

    // Enhanced search that includes code, and optionally other fields
    public static Specification<ClassEntity> search(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(searchTerm)) return criteriaBuilder.conjunction();

            String term = "%" + searchTerm.toLowerCase() + "%";

            // Search in code field - you can expand this to search other fields too
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), term);
        };
    }

    public static Specification<ClassEntity> forUserRole(UserEntity user) {
        return (root, query, criteriaBuilder) -> {
            if (user == null) {
                log.warn("User is null in role-based specification");
                return criteriaBuilder.disjunction();
            }

            boolean hasAdminAccess = user.getRoles().stream()
                    .anyMatch(role -> role.getName() == RoleEnum.ADMIN || role.getName() == RoleEnum.DEVELOPER);

            if (hasAdminAccess) {
                return criteriaBuilder.conjunction();
            }

            boolean isTeacherOrStaff = user.getRoles().stream()
                    .anyMatch(role -> role.getName() == RoleEnum.TEACHER || role.getName() == RoleEnum.STAFF);

            if (isTeacherOrStaff) {
                if (user.getDepartment() == null) {
                    log.warn("Staff/Teacher {} has no department assigned", user.getUsername());
                    return criteriaBuilder.disjunction();
                }

                Join<ClassEntity, MajorEntity> majorJoin = root.join("major", JoinType.INNER);
                Join<MajorEntity, DepartmentEntity> departmentJoin = majorJoin.join("department", JoinType.INNER);
                return criteriaBuilder.equal(departmentJoin.get("id"), user.getDepartment().getId());
            }

            boolean isStudent = user.getRoles().stream()
                    .anyMatch(role -> role.getName() == RoleEnum.STUDENT);

            if (isStudent) {
                if (user.getClasses() == null) {
                    log.warn("Student {} has no class assigned", user.getUsername());
                    return criteriaBuilder.disjunction();
                }

                return criteriaBuilder.equal(root.get("id"), user.getClasses().getId());
            }

            log.warn("User {} has no recognized roles", user.getUsername());
            return criteriaBuilder.disjunction();
        };
    }

    // Basic combination without role filtering
    public static Specification<ClassEntity> combine(String searchTerm, Integer academyYear, Status status, Long majorId) {
        Specification<ClassEntity> spec = Specification.where(null);

        if (StringUtils.hasText(searchTerm)) {
            spec = spec.and(search(searchTerm));
        }

        if (academyYear != null) {
            spec = spec.and(hasAcademyYear(academyYear));
        }

        if (status != null) {
            spec = spec.and(hasStatus(status));
        }

        if (majorId != null) {
            spec = spec.and(hasMajorId(majorId));
        }

        return spec;
    }

    // Combination with role-based filtering
    public static Specification<ClassEntity> combineWithUserRole(String searchTerm, Integer academyYear,
                                                                 Status status, Long majorId, UserEntity user) {
        Specification<ClassEntity> spec = combine(searchTerm, academyYear, status, majorId);

        if (user != null) {
            spec = spec.and(forUserRole(user));
        }

        return spec;
    }
}