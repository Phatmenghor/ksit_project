DO $$
BEGIN

    RAISE NOTICE '🚀 START MENU MIGRATION';

    -------------------------------------------------------------------
    RAISE NOTICE '1️⃣ Transfer permissions (old → new menus)';

UPDATE menu_permissions mp
SET menu_item_id = new_menu.id
    FROM menu_items old_menu
    JOIN menu_items new_menu
ON LOWER(REPLACE(old_menu.code, '_', '-')) = new_menu.code
WHERE mp.menu_item_id = old_menu.id
  AND old_menu.status = 'ACTIVE'
  AND new_menu.status = 'ACTIVE'
  AND old_menu.code ~ '^[A-Z_]+$'
  AND NOT EXISTS (
    SELECT 1 FROM menu_permissions mp2
    WHERE mp2.menu_item_id = new_menu.id
  AND COALESCE(mp2.user_id, -999) = COALESCE(mp.user_id, -999)
  AND COALESCE(mp2.role_name, 'NONE') = COALESCE(mp.role_name, 'NONE')
    );

RAISE NOTICE '✔ Permissions transferred';

    -------------------------------------------------------------------
    RAISE NOTICE '2️⃣ Delete duplicate old permissions';

DELETE FROM menu_permissions mp
    USING menu_items old_menu
WHERE mp.menu_item_id = old_menu.id
  AND old_menu.code ~ '^[A-Z_]+$';

RAISE NOTICE '✔ Old permissions deleted';

    -------------------------------------------------------------------
    RAISE NOTICE '3️⃣ Fix parent-child relationships';

UPDATE menu_items child
SET parent_id = parent_new.id
    FROM menu_items parent_old
    JOIN menu_items parent_new
ON LOWER(REPLACE(parent_old.code, '_', '-')) = parent_new.code
WHERE child.parent_id = parent_old.id
  AND parent_old.status = 'ACTIVE'
  AND parent_new.status = 'ACTIVE'
  AND parent_old.code ~ '^[A-Z_]+$';

RAISE NOTICE '✔ Parent-child fixed';

    -------------------------------------------------------------------
    RAISE NOTICE '4️⃣ Delete old uppercase menus';

DELETE FROM menu_items
WHERE code ~ '^[A-Z_]+$';

RAISE NOTICE '✔ Old menus deleted';

    -------------------------------------------------------------------
    RAISE NOTICE '5️⃣ Updating routes';

UPDATE menu_items SET route = '/' WHERE code = 'dashboard';
UPDATE menu_items SET route = '/master-data/classes' WHERE code = 'manage-class';
UPDATE menu_items SET route = '/master-data/semesters' WHERE code = 'manage-semester';
UPDATE menu_items SET route = '/master-data/majors' WHERE code = 'manage-major';
UPDATE menu_items SET route = '/master-data/departments' WHERE code = 'manage-department';
UPDATE menu_items SET route = '/master-data/rooms' WHERE code = 'manage-room';
UPDATE menu_items SET route = '/master-data/subjects' WHERE code = 'manage-subject';
UPDATE menu_items SET route = '/master-data/courses' WHERE code = 'manage-course';
UPDATE menu_items SET route = '/users/admins' WHERE code = 'admin';
UPDATE menu_items SET route = '/users/staff' WHERE code = 'staff-officer';
UPDATE menu_items SET route = '/users/teachers' WHERE code = 'teachers';
UPDATE menu_items SET route = '/students' WHERE code = 'students-list';
UPDATE menu_items SET route = '/students/add-single' WHERE code = 'add-single-user';
UPDATE menu_items SET route = '/students/add-multiple' WHERE code = 'add-multiple-users';
UPDATE menu_items SET route = '/attendance/schedule' WHERE code = 'class-schedule';
UPDATE menu_items SET route = '/attendance/history' WHERE code = 'history-records';
UPDATE menu_items SET route = '/attendance/records' WHERE code = 'student-records';
UPDATE menu_items SET route = '/scores/student' WHERE code = 'student-score';
UPDATE menu_items SET route = '/scores/submitted' WHERE code = 'submitted-list';
UPDATE menu_items SET route = '/scores/settings' WHERE code = 'score-setting';
UPDATE menu_items SET route = '/payments' WHERE code = 'student-payment';
UPDATE menu_items SET route = '/my-payment' WHERE code = 'my-payment';
UPDATE menu_items SET route = '/survey/results' WHERE code = 'result-list';
UPDATE menu_items SET route = '/survey/questions' WHERE code = 'manage-qa';
UPDATE menu_items SET route = '/survey/student' WHERE code = 'survey-student';
UPDATE menu_items SET route = '/survey/records' WHERE code = 'survey-student-records';
UPDATE menu_items SET route = '/permissions' WHERE code = 'role-permission';

RAISE NOTICE '✔ Routes updated';

    -------------------------------------------------------------------
    RAISE NOTICE '🎉 MIGRATION COMPLETED SUCCESSFULLY';

END $$;