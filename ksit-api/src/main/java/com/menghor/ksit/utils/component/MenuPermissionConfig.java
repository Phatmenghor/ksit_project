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

        permissions.put("dashboard", Set.of(
            RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        permissions.put("master-data", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("manage-class", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("manage-semester", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("manage-major", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("manage-department", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("manage-room", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("manage-course", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("manage-subject", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        permissions.put("users", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("admin", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("staff-officer", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("teachers", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        permissions.put("students", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("add-multiple-users", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("add-single-user", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("students-list", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        permissions.put("attendance", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("class-schedule", Set.of(RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.DEVELOPER));
        permissions.put("history-records", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("student-records", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        permissions.put("survey", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("result-list", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("manage-qa", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("survey-student-records", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("survey-student", Set.of(
            RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        permissions.put("scores-submitted", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("submitted-list", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("score-setting", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("student-score", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        permissions.put("schedule-group", Set.of(
            RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("schedule", Set.of(
            RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("manage-schedule", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        permissions.put("request-group", Set.of(
            RoleEnum.STUDENT, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("request", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("my-requests", Set.of(
            RoleEnum.STUDENT, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        permissions.put("payment", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("student-payment", Set.of(RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER));
        permissions.put("my-payment", Set.of(RoleEnum.STUDENT));

        permissions.put("role-permission", Set.of(RoleEnum.ADMIN, RoleEnum.DEVELOPER));

        return permissions;
    }
}
