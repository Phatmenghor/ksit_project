package com.menghor.ksit.utils.component;

import com.menghor.ksit.enumations.RoleEnum;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Component
public class MenuPermissionConfig {

    // Menu permissions map - initialized once
    private final Map<String, Set<RoleEnum>> menuPermissions;

    public MenuPermissionConfig() {
        this.menuPermissions = initializeMenuPermissions();
    }

    /**
     * Get allowed roles for a specific menu code
     * @param menuCode The menu code to check
     * @return Set of roles allowed to access this menu, or empty set if not defined
     */
    public Set<RoleEnum> getAllowedRolesForMenu(String menuCode) {
        return menuPermissions.getOrDefault(menuCode, Set.of());
    }

    /**
     * Check if a role has access to a specific menu
     * @param menuCode The menu code to check
     * @param role The role to check
     * @return true if the role has access, false otherwise
     */
    public boolean hasRoleAccess(String menuCode, RoleEnum role) {
        Set<RoleEnum> allowedRoles = getAllowedRolesForMenu(menuCode);
        return allowedRoles.contains(role);
    }

    /**
     * Check if any of the user's roles has access to a specific menu
     * @param menuCode The menu code to check
     * @param userRoles The user's roles
     * @return true if any role has access, false otherwise
     */
    public boolean hasAnyRoleAccess(String menuCode, Set<RoleEnum> userRoles) {
        Set<RoleEnum> allowedRoles = getAllowedRolesForMenu(menuCode);
        return userRoles.stream().anyMatch(allowedRoles::contains);
    }

    /**
     * Get all menu codes
     * @return Set of all configured menu codes
     */
    public Set<String> getAllMenuCodes() {
        return menuPermissions.keySet();
    }

    /**
     * Initialize the menu permissions map
     * This is the SINGLE place to define all menu permissions
     * Specify individual roles directly for maximum clarity and flexibility
     */
    private Map<String, Set<RoleEnum>> initializeMenuPermissions() {
        Map<String, Set<RoleEnum>> permissions = new HashMap<>();

        // =========================
        // DASHBOARD - All Users
        // =========================
        permissions.put("DASHBOARD", Set.of(
            RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        // =========================
        // MASTER DATA - Admin/Developer Only
        // =========================
        permissions.put("MASTER_DATA", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("MANAGE_CLASS", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("MANAGE_SEMESTER", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("MANAGE_MAJOR", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("MANAGE_DEPARTMENT", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("MANAGE_ROOM", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("MANAGE_COURSE", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("MANAGE_SUBJECT", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        // =========================
        // USER MANAGEMENT - Admin/Developer Only
        // =========================
        permissions.put("USERS", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("ADMIN", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("STAFF_OFFICER", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("TEACHERS", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        // =========================
        // STUDENT MANAGEMENT - Staff, Admin, Developer
        // =========================
        permissions.put("STUDENTS", Set.of(
            RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("ADD_MULTIPLE_USERS", Set.of(
            RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("ADD_SINGLE_USER", Set.of(
            RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("STUDENTS_LIST", Set.of(
            RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        // =========================
        // ATTENDANCE - Teacher, Staff, Admin, Developer
        // =========================
        permissions.put("ATTENDANCE", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("CLASS_SCHEDULE", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.DEVELOPER
        ));
        permissions.put("HISTORY_RECORDS", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("STUDENT_RECORDS", Set.of(
             RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        // =========================
        // SURVEY - Teacher, Staff, Admin, Developer (except student survey)
        // =========================
        permissions.put("SURVEY", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("RESULT_LIST", Set.of(
             RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("MANAGE_QA", Set.of(
           RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("SURVEY_STUDENT_RECORDS", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("SURVEY_STUDENT", Set.of(
            RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        )); // Students can access their survey

        // =========================
        // SCORE MANAGEMENT - Teacher, Staff, Admin, Developer
        // =========================
        permissions.put("SCORE_SUBMITTED", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("SUBMITTED_LIST", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("SCORE_SETTING", Set.of(
             RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));
        permissions.put("STUDENT_SCORE", Set.of(
            RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        // =========================
        // SCHEDULE - All Users Can View
        // =========================
        permissions.put("SCHEDULE", Set.of(
            RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        // =========================
        // MANAGE SCHEDULE - Staff, Admin, Developer
        // =========================
        permissions.put("MANAGE_SCHEDULE", Set.of(
            RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        // =========================
        // REQUEST - Admin/Developer Only
        // =========================
        permissions.put("REQUEST", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        // =========================
        // PAYMENT - All Users
        // =========================
        permissions.put("PAYMENT", Set.of(
           RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        permissions.put("MY_PAYMENT", Set.of(
            RoleEnum.STUDENT
        )); // Students only for their own payments

        // =========================
        // ROLE & PERMISSION MANAGEMENT - Admin/Developer Only
        // =========================
        permissions.put("ROLE_PERMISSION", Set.of(
            RoleEnum.ADMIN, RoleEnum.DEVELOPER
        ));

        return permissions;
    }

    /**
     * Add or update a menu permission (for dynamic configuration)
     * @param menuCode The menu code
     * @param allowedRoles The roles allowed to access this menu
     */
    public void setMenuPermission(String menuCode, Set<RoleEnum> allowedRoles) {
        menuPermissions.put(menuCode, allowedRoles);
    }

    /**
     * Remove a menu permission
     * @param menuCode The menu code to remove
     */
    public void removeMenuPermission(String menuCode) {
        menuPermissions.remove(menuCode);
    }

    /**
     * Get a summary of all menu permissions for logging/debugging
     * @return Map of menu codes to their allowed roles
     */
    public Map<String, Set<RoleEnum>> getAllMenuPermissions() {
        return new HashMap<>(menuPermissions); // Return a copy to prevent external modification
    }

    public void printAllPermissions() {
    }

    /**
     * Helper method: Add a new role to an existing menu permission
     * @param menuCode The menu code
     * @param newRole The new role to add
     */
    public void addRoleToMenu(String menuCode, RoleEnum newRole) {
        Set<RoleEnum> currentRoles = getAllowedRolesForMenu(menuCode);
        if (!currentRoles.isEmpty()) {
            Set<RoleEnum> updatedRoles = new HashSet<>(currentRoles); // Create mutable copy
            updatedRoles.add(newRole);
            setMenuPermission(menuCode, updatedRoles);
        }
    }

    /**
     * Helper method: Remove a role from an existing menu permission
     * @param menuCode The menu code
     * @param roleToRemove The role to remove
     */
    public void removeRoleFromMenu(String menuCode, RoleEnum roleToRemove) {
        Set<RoleEnum> currentRoles = getAllowedRolesForMenu(menuCode);
        if (!currentRoles.isEmpty()) {
            Set<RoleEnum> updatedRoles = new HashSet<>(currentRoles); // Create mutable copy
            updatedRoles.remove(roleToRemove);
            setMenuPermission(menuCode, updatedRoles);
        }
    }
}