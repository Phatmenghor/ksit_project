package com.menghor.ksit.config;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.menu.models.MenuItemEntity;
import com.menghor.ksit.feature.menu.models.MenuPermissionEntity;
import com.menghor.ksit.feature.menu.repository.MenuItemRepository;
import com.menghor.ksit.feature.menu.repository.MenuPermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Optional;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(3)
public class DefaultMenuInitializer implements CommandLineRunner {

    private final MenuItemRepository menuItemRepository;
    private final MenuPermissionRepository menuPermissionRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Syncing default menu items and routes...");
        migrateMenuData();
        seedMenus();
        log.info("Menu items synced successfully.");
    }

    private void seedMenus() {
        // 1. Dashboard
        MenuItemEntity dashboard = createMenuItem("dashboard", "Dashboard", "/", null, "dashboard", false, 1);
        addPermissions(dashboard, 1,
                RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 2. Master Data (parent)
        MenuItemEntity masterData = createMenuItem("master-data", "Master Data", null, null, "database", true, 2);
        addPermissions(masterData, 1, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity classes = createMenuItem("manage-class", "Classes", "/master-data/classes", masterData, "users", false, 1);
        addPermissions(classes, 1, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity semesters = createMenuItem("manage-semester", "Semesters", "/master-data/semesters", masterData, "calendar", false, 2);
        addPermissions(semesters, 2, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity majors = createMenuItem("manage-major", "Majors", "/master-data/majors", masterData, "book-open", false, 3);
        addPermissions(majors, 3, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity departments = createMenuItem("manage-department", "Departments", "/master-data/departments", masterData, "building-2", false, 4);
        addPermissions(departments, 4, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity rooms = createMenuItem("manage-room", "Rooms", "/master-data/rooms", masterData, "door-open", false, 5);
        addPermissions(rooms, 5, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity subjects = createMenuItem("manage-subject", "Subjects", "/master-data/subjects", masterData, "library", false, 6);
        addPermissions(subjects, 6, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity courses = createMenuItem("manage-course", "Courses", "/master-data/courses", masterData, "graduation-cap", false, 7);
        addPermissions(courses, 7, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 3. Users (parent)
        MenuItemEntity users = createMenuItem("users", "Users", null, null, "users", true, 3);
        addPermissions(users, 1, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity admins = createMenuItem("admin", "Admins", "/users/admins", users, "shield-user", false, 1);
        addPermissions(admins, 1, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity staff = createMenuItem("staff-officer", "Staff Officers", "/users/staff", users, "user-check", false, 2);
        addPermissions(staff, 2, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity teachers = createMenuItem("teachers", "Teachers", "/users/teachers", users, "user-pen", false, 3);
        addPermissions(teachers, 3, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 4. Students (parent)
        MenuItemEntity studentsParent = createMenuItem("students", "Students", null, null, "graduation-cap", true, 4);
        addPermissions(studentsParent, 1, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity studentList = createMenuItem("students-list", "Student List", "/students", studentsParent, "list", false, 1);
        addPermissions(studentList, 1, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity addSingle = createMenuItem("add-single-user", "Add Single", "/students/add-single", studentsParent, "user-plus", false, 2);
        addPermissions(addSingle, 2, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity addMultiple = createMenuItem("add-multiple-users", "Add Multiple", "/students/add-multiple", studentsParent, "users-round", false, 3);
        addPermissions(addMultiple, 3, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 5. Attendance (parent)
        MenuItemEntity attendance = createMenuItem("attendance", "Attendance", null, null, "clipboard-check", true, 5);
        addPermissions(attendance, 1, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity classSchedule = createMenuItem("class-schedule", "Class Schedule", "/attendance/schedule", attendance, "calendar-check", false, 1);
        addPermissions(classSchedule, 1, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.DEVELOPER);

        MenuItemEntity historyRecords = createMenuItem("history-records", "History Records", "/attendance/history", attendance, "history", false, 2);
        addPermissions(historyRecords, 2, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity studentRecords = createMenuItem("student-records", "Student Records", "/attendance/records", attendance, "file-text", false, 3);
        addPermissions(studentRecords, 3, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 6. Schedule
        MenuItemEntity schedule = createMenuItem("schedule", "Schedule", "/schedule", null, "calendar", false, 6);
        addPermissions(schedule, 1,
                RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 7. Manage Schedule
        MenuItemEntity manageSchedule = createMenuItem("manage-schedule", "Manage Schedule", "/manage-schedule", null, "calendar-cog", false, 7);
        addPermissions(manageSchedule, 1, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 8. Scores (parent)
        MenuItemEntity scores = createMenuItem("scores-submitted", "Scores", null, null, "bar-chart-2", true, 8);
        addPermissions(scores, 1, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity studentScore = createMenuItem("student-score", "Student Scores", "/scores/student", scores, "clipboard-list", false, 1);
        addPermissions(studentScore, 1, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity submittedList = createMenuItem("submitted-list", "Submitted List", "/scores/submitted", scores, "check-circle", false, 2);
        addPermissions(submittedList, 2, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity scoreSettings = createMenuItem("score-setting", "Score Settings", "/scores/settings", scores, "settings", false, 3);
        addPermissions(scoreSettings, 3, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 9. Payments (parent)
        MenuItemEntity payment = createMenuItem("payment", "Payments", null, null, "credit-card", true, 9);
        addPermissions(payment, 1, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity studentPayment = createMenuItem("student-payment", "Student Payment", "/payments", payment, "banknote", false, 1);
        addPermissions(studentPayment, 1, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity myPayment = createMenuItem("my-payment", "My Payment", "/my-payment", payment, "wallet", false, 2);
        addPermissions(myPayment, 2, RoleEnum.STUDENT);

        // 10. Survey (parent)
        MenuItemEntity survey = createMenuItem("survey", "Survey", null, null, "clipboard", true, 10);
        addPermissions(survey, 1, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity manageQa = createMenuItem("manage-qa", "Manage Q&A", "/survey/questions", survey, "message-circle-question", false, 1);
        addPermissions(manageQa, 1, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity surveyResults = createMenuItem("result-list", "Survey Results", "/survey/results", survey, "chart-bar", false, 2);
        addPermissions(surveyResults, 2, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity surveyStudent = createMenuItem("survey-student", "Student Survey", "/survey/student", survey, "user-round", false, 3);
        addPermissions(surveyStudent, 3,
                RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity surveyStudentRecords = createMenuItem("survey-student-records", "Student Records", "/survey/records", survey, "file-user", false, 4);
        addPermissions(surveyStudentRecords, 4, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 11. Requests
        MenuItemEntity requests = createMenuItem("request", "Requests", "/requests", null, "inbox", false, 11);
        addPermissions(requests, 1, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 12. My Class
        MenuItemEntity myClass = createMenuItem("my-class", "My Class", "/my-class", null, "school", false, 12);
        addPermissions(myClass, 1, RoleEnum.STUDENT, RoleEnum.TEACHER);

        // 13. Role & Permissions
        MenuItemEntity rolePermission = createMenuItem("role-permission", "Role & Permissions", "/permissions", null, "shield", false, 13);
        addPermissions(rolePermission, 1, RoleEnum.ADMIN, RoleEnum.DEVELOPER);
    }

    private MenuItemEntity createMenuItem(
            String code,
            String title,
            String route,
            MenuItemEntity parent,
            String icon,
            boolean isParent,
            int displayOrder) {

        MenuItemEntity item = menuItemRepository.findByCodeAndStatus(code, Status.ACTIVE)
                .orElse(new MenuItemEntity());
        item.setCode(code);
        item.setTitle(title);
        item.setRoute(route);
        item.setParent(parent);
        item.setIcon(icon);
        item.setIsParent(isParent);
        item.setDisplayOrder(displayOrder);
        item.setStatus(Status.ACTIVE);
        return menuItemRepository.save(item);
    }

    private void addPermissions(MenuItemEntity menuItem, int baseOrder, RoleEnum... roles) {
        List<MenuPermissionEntity> existing = menuPermissionRepository.findByMenuItemIdAndStatus(menuItem.getId(), Status.ACTIVE);
        if (!existing.isEmpty()) return;
        int order = baseOrder;
        for (RoleEnum role : Arrays.asList(roles)) {
            MenuPermissionEntity perm = new MenuPermissionEntity();
            perm.setMenuItem(menuItem);
            perm.setRole(role);
            perm.setCanView(true);
            perm.setDisplayOrder(order++);
            perm.setStatus(Status.ACTIVE);
            menuPermissionRepository.save(perm);
        }
    }

    private void migrateMenuData() {
        log.info("Migrating old uppercase menu codes to lowercase-hyphenated codes...");
        
        Map<String, String> migrationMap = new LinkedHashMap<>();
        migrationMap.put("DASHBOARD", "dashboard");
        migrationMap.put("MASTER_DATA", "master-data");
        migrationMap.put("MANAGE_CLASS", "manage-class");
        migrationMap.put("MANAGE_SEMESTER", "manage-semester");
        migrationMap.put("MANAGE_MAJOR", "manage-major");
        migrationMap.put("MANAGE_DEPARTMENT", "manage-department");
        migrationMap.put("MANAGE_ROOM", "manage-room");
        migrationMap.put("MANAGE_COURSE", "manage-course");
        migrationMap.put("MANAGE_SUBJECT", "manage-subject");
        migrationMap.put("USERS", "users");
        migrationMap.put("ADMIN", "admin");
        migrationMap.put("STAFF_OFFICER", "staff-officer");
        migrationMap.put("TEACHERS", "teachers");
        migrationMap.put("STUDENTS", "students");
        migrationMap.put("ADD_MULTIPLE_USERS", "add-multiple-users");
        migrationMap.put("ADD_SINGLE_USER", "add-single-user");
        migrationMap.put("STUDENTS_LIST", "students-list");
        migrationMap.put("ATTENDANCE", "attendance");
        migrationMap.put("CLASS_SCHEDULE", "class-schedule");
        migrationMap.put("HISTORY_RECORDS", "history-records");
        migrationMap.put("STUDENT_RECORDS", "student-records");
        migrationMap.put("SURVEY", "survey");
        migrationMap.put("RESULT_LIST", "result-list");
        migrationMap.put("MANAGE_QA", "manage-qa");
        migrationMap.put("SURVEY_STUDENT_RECORDS", "survey-student-records");
        migrationMap.put("SURVEY_STUDENT", "survey-student");
        migrationMap.put("SCORE_SUBMITTED", "scores-submitted");
        migrationMap.put("SUBMITTED_LIST", "submitted-list");
        migrationMap.put("SCORE_SETTING", "score-setting");
        migrationMap.put("STUDENT_SCORE", "student-score");
        migrationMap.put("SCHEDULE", "schedule");
        migrationMap.put("MANAGE_SCHEDULE", "manage-schedule");
        migrationMap.put("REQUEST", "request");
        migrationMap.put("PAYMENT", "payment");
        migrationMap.put("MY_PAYMENT", "my-payment");
        migrationMap.put("ROLE_PERMISSION", "role-permission");

        for (Map.Entry<String, String> entry : migrationMap.entrySet()) {
            String oldCode = entry.getKey();
            String newCode = entry.getValue();

            Optional<MenuItemEntity> oldMenuOpt = menuItemRepository.findByCodeAndStatus(oldCode, Status.ACTIVE);
            Optional<MenuItemEntity> newMenuOpt = menuItemRepository.findByCodeAndStatus(newCode, Status.ACTIVE);

            if (oldMenuOpt.isPresent()) {
                MenuItemEntity oldMenu = oldMenuOpt.get();
                if (newMenuOpt.isPresent()) {
                    MenuItemEntity newMenu = newMenuOpt.get();
                    log.info("Merging permissions from old menu {} to new menu {}", oldCode, newCode);
                    
                    // Re-point children of old menu to new menu
                    List<MenuItemEntity> children = menuItemRepository.findChildMenusByParentIdAndStatus(oldMenu.getId(), Status.ACTIVE);
                    for (MenuItemEntity child : children) {
                        child.setParent(newMenu);
                        menuItemRepository.save(child);
                    }
                    
                    // Transfer permissions from old menu item to new menu item
                    List<MenuPermissionEntity> oldPermissions = menuPermissionRepository.findByMenuItemIdAndStatus(oldMenu.getId(), Status.ACTIVE);
                    for (MenuPermissionEntity oldPerm : oldPermissions) {
                        boolean exists = false;
                        if (oldPerm.getUser() != null) {
                            exists = menuPermissionRepository.existsByUserIdAndMenuItemIdAndStatus(
                                    oldPerm.getUser().getId(), newMenu.getId(), Status.ACTIVE);
                        } else if (oldPerm.getRole() != null) {
                            exists = menuPermissionRepository.findByMenuItemIdAndRoleAndStatus(
                                    newMenu.getId(), oldPerm.getRole(), Status.ACTIVE).isPresent();
                        }
                        
                        if (!exists) {
                            oldPerm.setMenuItem(newMenu);
                            menuPermissionRepository.save(oldPerm);
                        } else {
                            oldPerm.setStatus(Status.DELETED);
                            menuPermissionRepository.save(oldPerm);
                        }
                    }
                    
                    // De-associate relationships to prevent foreign key errors
                    oldMenu.setParent(null);
                    oldMenu.setChildren(new ArrayList<>());
                    menuItemRepository.save(oldMenu);
                    
                    // Delete old menu item
                    menuItemRepository.delete(oldMenu);
                } else {
                    // Rename old to new
                    log.info("Renaming menu code from {} to {}", oldCode, newCode);
                    oldMenu.setCode(newCode);
                    menuItemRepository.save(oldMenu);
                }
            }
        }
    }
}
