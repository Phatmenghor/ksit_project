package com.menghor.ksit.utils.component;

import com.menghor.ksit.enumations.RoleEnum;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Component
public class MenuPermissionConfig {

    private final Map<String, Set<RoleEnum>> menuPermissions;

    public MenuPermissionConfig() {
        this.menuPermissions = initializeMenuPermissions();
    }

    public Set<RoleEnum> getAllowedRolesForMenu(String menuCode) {
        return menuPermissions.getOrDefault(menuCode, Set.of());
    }

    public boolean hasRoleAccess(String menuCode, RoleEnum role) {
        return getAllowedRolesForMenu(menuCode).contains(role);
    }

    public boolean hasAnyRoleAccess(String menuCode, Set<RoleEnum> userRoles) {
        Set<RoleEnum> allowedRoles = getAllowedRolesForMenu(menuCode);
        return userRoles.stream().anyMatch(allowedRoles::contains);
    }

    public Set<String> getAllMenuCodes() {
        return menuPermissions.keySet();
    }

    public Map<String, Set<RoleEnum>> getAllMenuPermissions() {
        return new HashMap<>(menuPermissions);
    }

    public void setMenuPermission(String menuCode, Set<RoleEnum> allowedRoles) {
        menuPermissions.put(menuCode, allowedRoles);
    }

    public void removeMenuPermission(String menuCode) {
        menuPermissions.remove(menuCode);
    }

    public void addRoleToMenu(String menuCode, RoleEnum newRole) {
        Set<RoleEnum> currentRoles = getAllowedRolesForMenu(menuCode);
        if (!currentRoles.isEmpty()) {
            Set<RoleEnum> updatedRoles = new HashSet<>(currentRoles);
            updatedRoles.add(newRole);
            setMenuPermission(menuCode, updatedRoles);
        }
    }

    public void removeRoleFromMenu(String menuCode, RoleEnum roleToRemove) {
        Set<RoleEnum> currentRoles = getAllowedRolesForMenu(menuCode);
        if (!currentRoles.isEmpty()) {
            Set<RoleEnum> updatedRoles = new HashSet<>(currentRoles);
            updatedRoles.remove(roleToRemove);
            setMenuPermission(menuCode, updatedRoles);
        }
    }

    private Map<String, Set<RoleEnum>> initializeMenuPermissions() {
        Map<String, Set<RoleEnum>> permissions = new HashMap<>();

        permissions.put("DASHBOARD", Set.of(
            RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        permissions.put("MASTER_DATA", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("MANAGE_CLASS", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("MANAGE_SEMESTER", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("MANAGE_MAJOR", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("MANAGE_DEPARTMENT", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("MANAGE_ROOM", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("MANAGE_COURSE", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("MANAGE_SUBJECT", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        permissions.put("USERS", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("ADMIN", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("STAFF_OFFICER", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("TEACHERS", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        permissions.put("STUDENTS", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("ADD_MULTIPLE_USERS", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("ADD_SINGLE_USER", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("STUDENTS_LIST", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        permissions.put("ATTENDANCE", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("CLASS_SCHEDULE", Set.of(RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.DEVELOPER));
        permissions.put("HISTORY_RECORDS", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("STUDENT_RECORDS", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        permissions.put("SURVEY", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("RESULT_LIST", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("MANAGE_QA", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("SURVEY_STUDENT_RECORDS", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("SURVEY_STUDENT", Set.of(
            RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        permissions.put("SCORE_SUBMITTED", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("SUBMITTED_LIST", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("SCORE_SETTING", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("STUDENT_SCORE", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        permissions.put("SCHEDULE", Set.of(
            RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("MANAGE_SCHEDULE", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        permissions.put("REQUEST", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        permissions.put("PAYMENT", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("MY_PAYMENT", Set.of(RoleEnum.STUDENT));

        permissions.put("ROLE_PERMISSION", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        return permissions;
    }
}
