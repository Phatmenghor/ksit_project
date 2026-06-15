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

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(3)
public class DefaultMenuInitializer implements CommandLineRunner {

    private final MenuItemRepository menuItemRepository;
    private final MenuPermissionRepository menuPermissionRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Syncing default menu items and routes...");
//        migrateMenuData();
//        seedMenus();
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
        log.info("Running database migration for old uppercase menu codes and routes...");
        try {
            String sql = """
                DO $$
                DECLARE
                    old_id BIGINT;
                    new_id BIGINT;
                    mappings JSONB := '[
                        {"old": "DASHBOARD", "new": "dashboard", "route": "/"},
                        {"old": "MASTER_DATA", "new": "master-data", "route": null},
                        {"old": "MANAGE_CLASS", "new": "manage-class", "route": "/master-data/classes"},
                        {"old": "MANAGE_SEMESTER", "new": "manage-semester", "route": "/master-data/semesters"},
                        {"old": "MANAGE_MAJOR", "new": "manage-major", "route": "/master-data/majors"},
                        {"old": "MANAGE_DEPARTMENT", "new": "manage-department", "route": "/master-data/departments"},
                        {"old": "MANAGE_ROOM", "new": "manage-room", "route": "/master-data/rooms"},
                        {"old": "MANAGE_COURSE", "new": "manage-course", "route": "/master-data/courses"},
                        {"old": "MANAGE_SUBJECT", "new": "manage-subject", "route": "/master-data/subjects"},
                        {"old": "USERS", "new": "users", "route": null},
                        {"old": "ADMIN", "new": "admin", "route": "/users/admins"},
                        {"old": "STAFF_OFFICER", "new": "staff-officer", "route": "/users/staff"},
                        {"old": "TEACHERS", "new": "teachers", "route": "/users/teachers"},
                        {"old": "STUDENTS", "new": "students", "route": null},
                        {"old": "ADD_MULTIPLE_USERS", "new": "add-multiple-users", "route": "/students/add-multiple"},
                        {"old": "ADD_SINGLE_USER", "new": "add-single-user", "route": "/students/add-single"},
                        {"old": "STUDENTS_LIST", "new": "students-list", "route": "/students"},
                        {"old": "ATTENDANCE", "new": "attendance", "route": null},
                        {"old": "CLASS_SCHEDULE", "new": "class-schedule", "route": "/attendance/schedule"},
                        {"old": "HISTORY_RECORDS", "new": "history-records", "route": "/attendance/history"},
                        {"old": "STUDENT_RECORDS", "new": "student-records", "route": "/attendance/records"},
                        {"old": "SURVEY", "new": "survey", "route": null},
                        {"old": "RESULT_LIST", "new": "result-list", "route": "/survey/results"},
                        {"old": "MANAGE_QA", "new": "manage-qa", "route": "/survey/questions"},
                        {"old": "SURVEY_STUDENT_RECORDS", "new": "survey-student-records", "route": "/survey/records"},
                        {"old": "SURVEY_STUDENT", "new": "survey-student", "route": "/survey/student"},
                        {"old": "SCORE_SUBMITTED", "new": "scores-submitted", "route": null},
                        {"old": "SUBMITTED_LIST", "new": "submitted-list", "route": "/scores/submitted"},
                        {"old": "SCORE_SETTING", "new": "score-setting", "route": "/scores/settings"},
                        {"old": "STUDENT_SCORE", "new": "student-score", "route": "/scores/student"},
                        {"old": "SCHEDULE", "new": "schedule", "route": "/schedule"},
                        {"old": "MANAGE_SCHEDULE", "new": "manage-schedule", "route": "/manage-schedule"},
                        {"old": "REQUEST", "new": "request", "route": "/requests"},
                        {"old": "PAYMENT", "new": "payment", "route": null},
                        {"old": "MY_PAYMENT", "new": "my-payment", "route": "/my-payment"},
                        {"old": "ROLE_PERMISSION", "new": "role-permission", "route": "/permissions"}
                    ]';
                    mapping JSONB;
                    old_code TEXT;
                    new_code TEXT;
                    new_route TEXT;
                BEGIN
                    FOR mapping IN SELECT * FROM jsonb_array_elements(mappings) LOOP
                        old_code := mapping->>'old';
                        new_code := mapping->>'new';
                        new_route := mapping->>'route';
                
                        SELECT id INTO old_id FROM menu_items WHERE code = old_code AND status = 'ACTIVE';
                        SELECT id INTO new_id FROM menu_items WHERE code = new_code AND status = 'ACTIVE';
                
                        IF old_id IS NOT NULL THEN
                            IF new_id IS NOT NULL THEN
                                UPDATE menu_items SET parent_id = new_id WHERE parent_id = old_id;
                                
                                UPDATE menu_permissions mp
                                SET menu_item_id = new_id
                                WHERE menu_item_id = old_id
                                  AND NOT EXISTS (
                                      SELECT 1 FROM menu_permissions mp2 
                                      WHERE mp2.menu_item_id = new_id 
                                        AND COALESCE(mp2.user_id, -999) = COALESCE(mp.user_id, -999)
                                        AND COALESCE(mp2.role_name, ''NONE'') = COALESCE(mp.role_name, ''NONE'')
                                  );
                                  
                                DELETE FROM menu_permissions WHERE menu_item_id = old_id;
                                DELETE FROM menu_items WHERE id = old_id;
                            ELSE
                                UPDATE menu_items 
                                SET code = new_code, route = new_route
                                WHERE id = old_id;
                            END IF;
                        END IF;
                    END LOOP;
                END $$;
                """;
            entityManager.createNativeQuery(sql).executeUpdate();
            log.info("Database migration completed successfully.");
        } catch (Exception e) {
            log.error("Failed to run database migration: {}", e.getMessage(), e);
        }
    }
}
