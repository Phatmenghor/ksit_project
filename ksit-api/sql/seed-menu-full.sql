SET client_min_messages TO NOTICE;

BEGIN;

-- 1. Wipe existing data (order matters: permissions first)
DELETE FROM menu_permissions;
DELETE FROM menu_items;

-- 2. Reset sequences (adjust sequence names if yours differ)
ALTER SEQUENCE menu_items_id_seq RESTART WITH 1;
ALTER SEQUENCE menu_permissions_id_seq RESTART WITH 1;

-- =========================================================
-- 3. INSERT menu_items
--    Columns: id, code, title, route, icon, display_order,
--             status, is_parent, parent_id, created_at, updated_at
-- =========================================================

-- ── FLAT / TOP-LEVEL ─────────────────────────────────────
INSERT INTO menu_items (code, title, route, icon, display_order, status, is_parent, parent_id, created_at)
VALUES
  ('dashboard',       'Dashboard',        '/',           'dashboard',    1,  'ACTIVE', false, NULL, NOW());

-- ── PARENT GROUPS ────────────────────────────────────────
INSERT INTO menu_items (code, title, route, icon, display_order, status, is_parent, parent_id, created_at)
VALUES
  ('master-data',     'Master Data',      NULL,          'database',       2,  'ACTIVE', true, NULL, NOW()),
  ('users',           'Users',            NULL,          'users',          3,  'ACTIVE', true, NULL, NOW()),
  ('students',        'Students',         NULL,          'graduation-cap', 4,  'ACTIVE', true, NULL, NOW()),
  ('attendance',      'Attendance',       NULL,          'clipboard-check',5,  'ACTIVE', true, NULL, NOW()),
  ('schedule-group',  'Schedule',         NULL,          'calendar',       6,  'ACTIVE', true, NULL, NOW()),
  ('scores-submitted','Scores',           NULL,          'bar-chart-2',    8,  'ACTIVE', true, NULL, NOW()),
  ('payment',         'Payments',         NULL,          'credit-card',    9,  'ACTIVE', true, NULL, NOW()),
  ('survey',          'Survey',           NULL,          'clipboard',      10, 'ACTIVE', true, NULL, NOW()),
  ('request-group',   'Requests',         NULL,          'inbox',          11, 'ACTIVE', true, NULL, NOW()),
  ('role-permission', 'Role & Permissions','/permissions','shield',        12, 'ACTIVE', false, NULL, NOW());

-- ── MASTER DATA children ─────────────────────────────────
INSERT INTO menu_items (code, title, route, icon, display_order, status, is_parent, parent_id, created_at)
VALUES
  ('manage-class',      'Classes',          '/master-data/classes',      'users',              1, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='master-data'), NOW()),
  ('manage-semester',   'Semesters',        '/master-data/semesters',    'calendar',           2, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='master-data'), NOW()),
  ('manage-major',      'Majors',           '/master-data/majors',       'book-open',          3, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='master-data'), NOW()),
  ('manage-department', 'Departments',      '/master-data/departments',  'building-2',         4, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='master-data'), NOW()),
  ('manage-room',       'Rooms',            '/master-data/rooms',        'door-open',          5, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='master-data'), NOW()),
  ('manage-subject',    'Subjects',         '/master-data/subjects',     'library',            6, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='master-data'), NOW()),
  ('manage-course',     'Courses',          '/master-data/courses',      'graduation-cap',     7, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='master-data'), NOW());

-- ── USERS children ───────────────────────────────────────
INSERT INTO menu_items (code, title, route, icon, display_order, status, is_parent, parent_id, created_at)
VALUES
  ('admin',         'Admins',        '/users/admins', 'shield-user',  1, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='users'), NOW()),
  ('staff-officer', 'Staff Officers','/users/staff',  'user-check',   2, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='users'), NOW()),
  ('teachers',      'Teachers',      '/users/teachers','user-pen',    3, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='users'), NOW());

-- ── STUDENTS children ────────────────────────────────────
INSERT INTO menu_items (code, title, route, icon, display_order, status, is_parent, parent_id, created_at)
VALUES
  ('students-list',      'Student List', '/students',              'list',        1, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='students'), NOW()),
  ('add-single-user',    'Add Single',   '/students/add-single',   'user-plus',   2, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='students'), NOW()),
  ('add-multiple-users', 'Add Multiple', '/students/add-multiple', 'users-round', 3, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='students'), NOW());

-- ── ATTENDANCE children ──────────────────────────────────
INSERT INTO menu_items (code, title, route, icon, display_order, status, is_parent, parent_id, created_at)
VALUES
  ('class-schedule',  'Class Schedule',   '/attendance/schedule', 'calendar-check', 1, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='attendance'), NOW()),
  ('history-records', 'History Records',  '/attendance/history',  'history',        2, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='attendance'), NOW()),
  ('student-records', 'Student Records',  '/attendance/records',  'file-text',      3, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='attendance'), NOW());

-- ── SCHEDULE children ────────────────────────────────────
INSERT INTO menu_items (code, title, route, icon, display_order, status, is_parent, parent_id, created_at)
VALUES
  ('schedule',         'My Schedule',     '/schedule',       'calendar',     1, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='schedule-group'), NOW()),
  ('manage-schedule',  'Manage Schedule', '/manage-schedule','calendar-cog', 2, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='schedule-group'), NOW());

-- ── SCORES children ──────────────────────────────────────
INSERT INTO menu_items (code, title, route, icon, display_order, status, is_parent, parent_id, created_at)
VALUES
  ('student-score',  'Student Scores', '/scores/student',   'clipboard-list', 1, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='scores-submitted'), NOW()),
  ('submitted-list', 'Submitted List', '/scores/submitted', 'check-circle',   2, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='scores-submitted'), NOW()),
  ('score-setting',  'Score Settings', '/scores/settings',  'settings',       3, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='scores-submitted'), NOW());

-- ── PAYMENT children ─────────────────────────────────────
INSERT INTO menu_items (code, title, route, icon, display_order, status, is_parent, parent_id, created_at)
VALUES
  ('student-payment', 'Student Payment', '/payments',    'banknote', 1, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='payment'), NOW()),
  ('my-payment',      'My Payment',      '/my-payment',  'wallet',   2, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='payment'), NOW());

-- ── SURVEY children ──────────────────────────────────────
INSERT INTO menu_items (code, title, route, icon, display_order, status, is_parent, parent_id, created_at)
VALUES
  ('manage-qa',             'Manage Q&A',      '/survey/questions', 'message-circle-question', 1, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='survey'), NOW()),
  ('result-list',           'Survey Results',  '/survey/results',   'chart-bar',               2, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='survey'), NOW()),
  ('survey-student',        'Student Survey',  '/survey/student',   'user-round',              3, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='survey'), NOW()),
  ('survey-student-records','Student Records', '/survey/records',   'file-user',               4, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='survey'), NOW());

-- ── REQUEST children ─────────────────────────────────────
INSERT INTO menu_items (code, title, route, icon, display_order, status, is_parent, parent_id, created_at)
VALUES
  ('request',     'Request List', '/requests',    'list',        1, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='request-group'), NOW()),
  ('my-requests', 'My Requests',  '/my-requests', 'plus-circle', 2, 'ACTIVE', false, (SELECT id FROM menu_items WHERE code='request-group'), NOW());

-- =========================================================
-- 4. INSERT menu_permissions  (role-based defaults)
--    role_name values: STUDENT | TEACHER | STAFF | ADMIN | DEVELOPER
--    user_id is NULL for role-based permissions
-- =========================================================

-- Helper: insert permission for one code + role
-- dashboard
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, 'STUDENT',   NULL::bigint, true, 1, 'ACTIVE', NOW() FROM menu_items WHERE code='dashboard'
UNION ALL
SELECT id, 'TEACHER',   NULL::bigint, true, 2, 'ACTIVE', NOW() FROM menu_items WHERE code='dashboard'
UNION ALL
SELECT id, 'STAFF',     NULL::bigint, true, 3, 'ACTIVE', NOW() FROM menu_items WHERE code='dashboard'
UNION ALL
SELECT id, 'ADMIN',     NULL::bigint, true, 4, 'ACTIVE', NOW() FROM menu_items WHERE code='dashboard'
UNION ALL
SELECT id, 'DEVELOPER', NULL::bigint, true, 5, 'ACTIVE', NOW() FROM menu_items WHERE code='dashboard';

-- master-data (parent + all children) → ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('ADMIN',1),('DEVELOPER',2)) AS r(role,ord)
WHERE code IN ('master-data','manage-class','manage-semester','manage-major',
               'manage-department','manage-room','manage-subject','manage-course');

-- users (parent + children) → ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('ADMIN',1),('DEVELOPER',2)) AS r(role,ord)
WHERE code IN ('users','admin','staff-officer','teachers');

-- students parent → STAFF, ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('STAFF',1),('ADMIN',2),('DEVELOPER',3)) AS r(role,ord)
WHERE code IN ('students','students-list','add-single-user','add-multiple-users');

-- attendance parent → TEACHER, STAFF, ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('TEACHER',1),('STAFF',2),('ADMIN',3),('DEVELOPER',4)) AS r(role,ord)
WHERE code = 'attendance';

-- class-schedule → TEACHER, STAFF, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('TEACHER',1),('STAFF',2),('DEVELOPER',3)) AS r(role,ord)
WHERE code = 'class-schedule';

-- history-records, student-records → TEACHER/STAFF/ADMIN/DEVELOPER & STAFF/ADMIN/DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('TEACHER',1),('STAFF',2),('ADMIN',3),('DEVELOPER',4)) AS r(role,ord)
WHERE code = 'history-records';

INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('STAFF',1),('ADMIN',2),('DEVELOPER',3)) AS r(role,ord)
WHERE code = 'student-records';

-- schedule-group + schedule → ALL roles
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('STUDENT',1),('TEACHER',2),('STAFF',3),('ADMIN',4),('DEVELOPER',5)) AS r(role,ord)
WHERE code IN ('schedule-group','schedule');

-- manage-schedule → STAFF, ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('STAFF',1),('ADMIN',2),('DEVELOPER',3)) AS r(role,ord)
WHERE code = 'manage-schedule';

-- scores-submitted + submitted-list + student-score → TEACHER, STAFF, ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('TEACHER',1),('STAFF',2),('ADMIN',3),('DEVELOPER',4)) AS r(role,ord)
WHERE code IN ('scores-submitted','submitted-list','student-score');

-- score-setting → ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('ADMIN',1),('DEVELOPER',2)) AS r(role,ord)
WHERE code = 'score-setting';

-- payment parent + student-payment → STAFF, ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('STAFF',1),('ADMIN',2),('DEVELOPER',3)) AS r(role,ord)
WHERE code IN ('payment','student-payment');

-- my-payment → STUDENT only
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, 'STUDENT', NULL::bigint, true, 1, 'ACTIVE', NOW()
FROM menu_items WHERE code = 'my-payment';

-- survey parent → TEACHER, STAFF, ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('TEACHER',1),('STAFF',2),('ADMIN',3),('DEVELOPER',4)) AS r(role,ord)
WHERE code IN ('survey','survey-student-records');

-- manage-qa, result-list → STAFF, ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('STAFF',1),('ADMIN',2),('DEVELOPER',3)) AS r(role,ord)
WHERE code IN ('manage-qa','result-list');

-- survey-student → ALL roles
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('STUDENT',1),('TEACHER',2),('STAFF',3),('ADMIN',4),('DEVELOPER',5)) AS r(role,ord)
WHERE code = 'survey-student';

-- request-group + my-requests → STUDENT, STAFF, ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('STUDENT',1),('STAFF',2),('ADMIN',3),('DEVELOPER',4)) AS r(role,ord)
WHERE code IN ('request-group','my-requests');

-- request (list) → STAFF, ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('STAFF',1),('ADMIN',2),('DEVELOPER',3)) AS r(role,ord)
WHERE code = 'request';

-- role-permission → ADMIN, DEVELOPER
INSERT INTO menu_permissions (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
SELECT id, role, NULL::bigint, true, ord, 'ACTIVE', NOW()
FROM menu_items
CROSS JOIN (VALUES ('ADMIN',1),('DEVELOPER',2)) AS r(role,ord)
WHERE code = 'role-permission';

-- =========================================================
COMMIT;

-- =========================================================
-- 5. ASSIGN menu permissions to all existing users
--    Loops through every user, determines their roles,
--    and inserts user-level can_view permissions for each
--    menu item based on the role-based permission rules.
-- =========================================================

DO $$
DECLARE
  v_user         RECORD;
  v_menu         RECORD;
  v_can_view     BOOLEAN;
  v_total_users  INT;
  v_current_user INT := 0;
  v_percent      INT := 0;
  v_last_percent INT := -1;
BEGIN
  -- Get total users count for percentage reporting
  SELECT COUNT(*) INTO v_total_users FROM users;
  RAISE NOTICE 'Starting permission assignment for % users...', v_total_users;

  -- Iterate over every user in the system
  FOR v_user IN
    SELECT u.id AS user_id, array_agg(r.name) AS roles
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r       ON r.id = ur.role_id
    GROUP BY u.id
  LOOP
    v_current_user := v_current_user + 1;
    
    -- Print progress status as a percentage (every 10%)
    IF v_total_users > 0 THEN
      v_percent := (v_current_user * 100) / v_total_users;
      -- Standardize output to multiples of 10%
      IF v_percent % 10 = 0 AND v_percent <> v_last_percent THEN
        RAISE NOTICE 'Assigning user permissions... %%% completed', v_percent;
        v_last_percent := v_percent;
      END IF;
    END IF;

    -- For each active menu item
    FOR v_menu IN
      SELECT id, code FROM menu_items WHERE status = 'ACTIVE'
    LOOP
      -- Determine can_view: true if the user has at least one role
      -- that is allowed for this menu item (based on role-level permissions)
      SELECT EXISTS (
        SELECT 1
        FROM menu_permissions mp
        WHERE mp.menu_item_id = v_menu.id
          AND mp.user_id IS NULL
          AND mp.status  = 'ACTIVE'
          AND mp.role_name = ANY(v_user.roles)
          AND mp.can_view  = true
      ) INTO v_can_view;

      -- Insert user-specific permission (skip if already exists)
      INSERT INTO menu_permissions
        (menu_item_id, role_name, user_id, can_view, display_order, status, created_at)
      SELECT
        v_menu.id,
        NULL,
        v_user.user_id,
        v_can_view,
        COALESCE((
          SELECT MAX(display_order) + 1
          FROM menu_permissions
          WHERE menu_item_id = v_menu.id AND user_id IS NULL AND status = 'ACTIVE'
        ), 1),
        'ACTIVE',
        NOW()
      WHERE NOT EXISTS (
        SELECT 1
        FROM menu_permissions
        WHERE menu_item_id = v_menu.id
          AND user_id = v_user.user_id
          AND status  = 'ACTIVE'
      );

    END LOOP;
  END LOOP;

  RAISE NOTICE 'User menu permissions assigned successfully.';
END;
$$;

-- Verify counts
SELECT 'menu_items'       AS tbl, COUNT(*) AS rows FROM menu_items
UNION ALL
SELECT 'menu_permissions' AS tbl, COUNT(*) AS rows FROM menu_permissions;
