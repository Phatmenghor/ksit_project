package com.menghor.ksit.config;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.feature.menu.models.MenuItemEntity;
import com.menghor.ksit.feature.menu.models.MenuPermissionEntity;
import com.menghor.ksit.feature.menu.repository.MenuItemRepository;
import com.menghor.ksit.feature.menu.repository.MenuPermissionRepository;
import com.menghor.ksit.feature.menu.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(3)
public class DefaultMenuInitializer implements CommandLineRunner {

    private final MenuItemRepository menuItemRepository;
    private final MenuPermissionRepository menuPermissionRepository;
    private final MenuService menuService;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== Menu initialization started ===");
        removeObsoleteMenus();
        seedMenus();
        menuService.syncAllUserMenuPermissions();
        log.info("=== Menu initialization complete ===");
    }

    private void removeObsoleteMenus() {
        List<String> obsoleteCodes = List.of("my-class");
        for (String code : obsoleteCodes) {
            menuItemRepository.findByCodeAndStatus(code, Status.ACTIVE).ifPresent(menu -> {
                log.info("Removing obsolete menu item: code={}, route={}", menu.getCode(), menu.getRoute());
                menu.setStatus(Status.DELETED);
                menuItemRepository.save(menu);

                List<MenuPermissionEntity> perms = menuPermissionRepository
                        .findByMenuItemIdAndStatus(menu.getId(), Status.ACTIVE);
                perms.forEach(p -> p.setStatus(Status.DELETED));
                if (!perms.isEmpty()) {
                    menuPermissionRepository.saveAll(perms);
                    log.info("Removed {} permission records for obsolete menu [{}]", perms.size(), code);
                }
            });
        }
    }

    private void seedMenus() {
        log.info("Seeding menu items...");

        // 1. Dashboard
        MenuItemEntity dashboard = upsertMenuItem("dashboard", "Dashboard", "/", null, "dashboard", false, 1);
        addPermissions(dashboard, 1,
                RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 2. Master Data
        MenuItemEntity masterData = upsertMenuItem("master-data", "Master Data", null, null, "database", true, 2);
        addPermissions(masterData, 1, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity classes = upsertMenuItem("manage-class", "Classes", "/master-data/classes", masterData, "users", false, 1);
        addPermissions(classes, 1, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity semesters = upsertMenuItem("manage-semester", "Semesters", "/master-data/semesters", masterData, "calendar", false, 2);
        addPermissions(semesters, 2, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity majors = upsertMenuItem("manage-major", "Majors", "/master-data/majors", masterData, "book-open", false, 3);
        addPermissions(majors, 3, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity departments = upsertMenuItem("manage-department", "Departments", "/master-data/departments", masterData, "building-2", false, 4);
        addPermissions(departments, 4, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity rooms = upsertMenuItem("manage-room", "Rooms", "/master-data/rooms", masterData, "door-open", false, 5);
        addPermissions(rooms, 5, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity subjects = upsertMenuItem("manage-subject", "Subjects", "/master-data/subjects", masterData, "library", false, 6);
        addPermissions(subjects, 6, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity courses = upsertMenuItem("manage-course", "Courses", "/master-data/courses", masterData, "graduation-cap", false, 7);
        addPermissions(courses, 7, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 3. Users
        MenuItemEntity users = upsertMenuItem("users", "Users", null, null, "users", true, 3);
        addPermissions(users, 1, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity admins = upsertMenuItem("admin", "Admins", "/users/admins", users, "shield-user", false, 1);
        addPermissions(admins, 1, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity staff = upsertMenuItem("staff-officer", "Staff Officers", "/users/staff", users, "user-check", false, 2);
        addPermissions(staff, 2, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity teachers = upsertMenuItem("teachers", "Teachers", "/users/teachers", users, "user-pen", false, 3);
        addPermissions(teachers, 3, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 4. Students
        MenuItemEntity studentsParent = upsertMenuItem("students", "Students", null, null, "graduation-cap", true, 4);
        addPermissions(studentsParent, 1, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity studentList = upsertMenuItem("students-list", "Student List", "/students", studentsParent, "list", false, 1);
        addPermissions(studentList, 1, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity addSingle = upsertMenuItem("add-single-user", "Add Single", "/students/add-single", studentsParent, "user-plus", false, 2);
        addPermissions(addSingle, 2, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity addMultiple = upsertMenuItem("add-multiple-users", "Add Multiple", "/students/add-multiple", studentsParent, "users-round", false, 3);
        addPermissions(addMultiple, 3, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 5. Attendance
        MenuItemEntity attendance = upsertMenuItem("attendance", "Attendance", null, null, "clipboard-check", true, 5);
        addPermissions(attendance, 1, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity classSchedule = upsertMenuItem("class-schedule", "Class Schedule", "/attendance/schedule", attendance, "calendar-check", false, 1);
        addPermissions(classSchedule, 1, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.DEVELOPER);

        MenuItemEntity historyRecords = upsertMenuItem("history-records", "History Records", "/attendance/history", attendance, "history", false, 2);
        addPermissions(historyRecords, 2, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity studentRecords = upsertMenuItem("student-records", "Student Records", "/attendance/records", attendance, "file-text", false, 3);
        addPermissions(studentRecords, 3, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 6. Schedule
        MenuItemEntity schedule = upsertMenuItem("schedule", "Schedule", "/schedule", null, "calendar", false, 6);
        addPermissions(schedule, 1,
                RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 7. Manage Schedule
        MenuItemEntity manageSchedule = upsertMenuItem("manage-schedule", "Manage Schedule", "/manage-schedule", null, "calendar-cog", false, 7);
        addPermissions(manageSchedule, 1, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 8. Scores
        MenuItemEntity scores = upsertMenuItem("scores-submitted", "Scores", null, null, "bar-chart-2", true, 8);
        addPermissions(scores, 1, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity studentScore = upsertMenuItem("student-score", "Student Scores", "/scores/student", scores, "clipboard-list", false, 1);
        addPermissions(studentScore, 1, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity submittedList = upsertMenuItem("submitted-list", "Submitted List", "/scores/submitted", scores, "check-circle", false, 2);
        addPermissions(submittedList, 2, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity scoreSettings = upsertMenuItem("score-setting", "Score Settings", "/scores/settings", scores, "settings", false, 3);
        addPermissions(scoreSettings, 3, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 9. Payments
        MenuItemEntity payment = upsertMenuItem("payment", "Payments", null, null, "credit-card", true, 9);
        addPermissions(payment, 1, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity studentPayment = upsertMenuItem("student-payment", "Student Payment", "/payments", payment, "banknote", false, 1);
        addPermissions(studentPayment, 1, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity myPayment = upsertMenuItem("my-payment", "My Payment", "/my-payment", payment, "wallet", false, 2);
        addPermissions(myPayment, 2, RoleEnum.STUDENT);

        // 10. Survey
        MenuItemEntity survey = upsertMenuItem("survey", "Survey", null, null, "clipboard", true, 10);
        addPermissions(survey, 1, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity manageQa = upsertMenuItem("manage-qa", "Manage Q&A", "/survey/questions", survey, "message-circle-question", false, 1);
        addPermissions(manageQa, 1, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity surveyResults = upsertMenuItem("result-list", "Survey Results", "/survey/results", survey, "chart-bar", false, 2);
        addPermissions(surveyResults, 2, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity surveyStudent = upsertMenuItem("survey-student", "Student Survey", "/survey/student", survey, "user-round", false, 3);
        addPermissions(surveyStudent, 3,
                RoleEnum.STUDENT, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        MenuItemEntity surveyStudentRecords = upsertMenuItem("survey-student-records", "Student Records", "/survey/records", survey, "file-user", false, 4);
        addPermissions(surveyStudentRecords, 4, RoleEnum.TEACHER, RoleEnum.STAFF, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 11. Requests
        MenuItemEntity requests = upsertMenuItem("request", "Requests", "/requests", null, "inbox", false, 11);
        addPermissions(requests, 1, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        // 12. Role & Permissions
        MenuItemEntity rolePermission = upsertMenuItem("role-permission", "Role & Permissions", "/permissions", null, "shield", false, 12);
        addPermissions(rolePermission, 1, RoleEnum.ADMIN, RoleEnum.DEVELOPER);

        log.info("Menu items seeded successfully.");
    }

    private MenuItemEntity upsertMenuItem(
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
        List<MenuPermissionEntity> existing = menuPermissionRepository
                .findByMenuItemIdAndStatus(menuItem.getId(), Status.ACTIVE);
        if (!existing.isEmpty()) return;

        List<MenuPermissionEntity> perms = new ArrayList<>();
        int order = baseOrder;
        for (RoleEnum role : Arrays.asList(roles)) {
            MenuPermissionEntity perm = new MenuPermissionEntity();
            perm.setMenuItem(menuItem);
            perm.setRole(role);
            perm.setCanView(true);
            perm.setDisplayOrder(order++);
            perm.setStatus(Status.ACTIVE);
            perms.add(perm);
        }
        menuPermissionRepository.saveAll(perms);
    }
}
