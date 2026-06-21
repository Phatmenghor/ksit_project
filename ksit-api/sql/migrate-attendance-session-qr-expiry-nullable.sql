DO $$
BEGIN

    RAISE NOTICE '🚀 START MIGRATION: drop NOT NULL on attendance_sessions.qr_expiry_time';

    -------------------------------------------------------------------
    -- AttendanceSessionEntity no longer sets qr_expiry_time on insert,
    -- but the column was left NOT NULL from when it did, causing
    -- "null value in column qr_expiry_time violates not-null constraint"
    -- on every new attendance session creation.

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'attendance_sessions'
          AND column_name = 'qr_expiry_time'
          AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE attendance_sessions ALTER COLUMN qr_expiry_time DROP NOT NULL;
        RAISE NOTICE '✔ qr_expiry_time is now nullable';
    ELSE
        RAISE NOTICE '↷ qr_expiry_time already nullable or column missing, skipping';
    END IF;

    RAISE NOTICE '🎉 MIGRATION COMPLETED SUCCESSFULLY';

END $$;
