import { AppSidebarIcons } from "./icons/icon";

export const ROUTE = {
  DASHBOARD: "/",

  AUTH: {
    LOGIN: "/login",
  },
  MASTER_DATA: {
    MANAGE_CLASS: "/manage-class",
    COURSES: {
      INDEX: "/courses",
      ADD: "/courses/add",
      UPDATE: (id: string) => `/courses/update/${id}`,
      VIEW: (id: string) => `/courses/${id}`,
    },
    MANAGE_SEMESTER: "/manage-semester",
    MANAGE_MAJOR: "/manage-major",
    MANAGE_DEPARTMENT: "/manage-department",
    MANAGE_ROOM: "/manage-room",
    MANAGE_SUBJECT: "/manage-subject",
  },

  USERS: {
    ADMIN: {
      INDEX: "/admin",
      ADMIN_VIEW: (id: string) => `/admin/view/${id}`,
    },
    ADMIN_PROFILE: "/admin/profile",
    EDIT_STAFF: (id: string) => `/staff-officer/edit/${id}`,
    VIEW_STAFF: (id: string) => `/staff-officer/view/${id}`,
    ADD_STAFF: "/staff-officer/add",
    STUFF_OFFICER: "/staff-officer",
    TEACHERS: "/teachers",
    ADD_TEACHER: "/teachers/add",
    EDIT_TEACHER: (id: string) => `/teachers/edit/${id}`,
    EDIT_TEACHER_PROFILE: "/profile/teacher/edit",
    EDIT_ADMIN_PROFILE: "/profile/admin/edit",
    VIEW_TEACHER: (id: string) => `/teachers/view/${id}`,
    SETTING_CHANGE_PASSWORD: "/change-password",
  },

  PROFILE: {
    ADMIN: "/profile/admin",
    TEACHER: "/profile/teacher",
    STUDENT: "/profile/student",
  },

  STUDENTS: {
    ADD_MULTIPLE: "/add-multiple",
    ADD_SINGLE: "/add-single",
    ADD_NEW: "/student-list/new",
    LIST: "/student-list",
    EDIT_STUDENT_PROFILE: "/profile/student/edit",
    VIEW: (id: string) => `/view/${id}`,
    EDIT_STUDENT: (id: string) => `/edit/${id}`,
  },

  STUDENT_LIST: (id: string) => `/student-list/${id}`,

  MANAGE_SCHEDULE: {
    DEPARTMENT: "/manage-schedule/department",
    DEPARTMENT_CLASS: "/manage-schedule/class",
    UPDATE_SCHEDULE: "/manage-schedule/all-schedule/update/",
    ROOT: "/schedule",
    CLASS: (id: string) => `/manage-schedule/class/${id}`,
    All_SCHEDULE_DETAIL: (id: string) => `/manage-schedule/all-schedule/${id}`,
  },

  SCHEDULE: {
    DEPARTMENT: "/manage-schedule/department",
    ROOT: "/schedule",
  },

  ATTENDANCE: {
    CLASS_SCHEDULE: "/attendance/schedule",
    ATTENDANCE_CHECK: "/attendance/schedule/check",
    HISTORY_RECORD: "/attendance/history-records",
    STUDENT_LIST_RECORD: "/attendance/student-records",
    STUDENT_LIST_RECORD_DETAIL: (id: string) =>
      `/attendance/student-records/detail/${id}`,
    STUDENT_LIST_HISTORY_RECORD: (scheduleId: string) =>
      `/attendance/history-records/student-list/${scheduleId}`,
    HISTORY_RECORD_DETAIL: (scheduleId: string, studentId: string) =>
      `/attendance/history-records/student-list/${scheduleId}/class/${studentId}`,
    STUDENT_RECORD_DETAIL: (id: string) =>
      `/attendance/student-records/view/${id}`,
  },

  SCORES: {
    STUDENT_SCORE: "/student-score",
    SUBMITTED: "/submitted-list",
    SUBMITTED_DETAIL: (id: string) => `/submitted-list/${id}`,
    STUDENT_SCORE_DETAIL: (id: string) => `/student-score/edit/${id}`,
    SETTINGS: "/score-setting",
  },

  REQUESTS: "/requests",
  REQUEST_DETAIL: (id: string) => `/requests/${id}`,
  REQUEST_UPDATE: (id: string) => `/request/${id}`,

  MY_CLASS: {
    CLASS: "/my-class",
    MY_SCHEDULE: "/my-schedule",
    MY_SCHEDULE_DETAIL: (id: string) => `/my-schedule/${id}`,
  },

  PERMISSIONS: "/permissions",
  PAYMENT: {
    ADD_NEW_PAYMENT: "/add-new",
    LIST: "/student-payment",
    VIEW_PAYMENT: (id: string) => `/view-payment/${id}`,
    MY_PAYMENT: `/my-payment`,
  },
  SURVEY: {
    RESULT_LIST: "/survey-result",
    MANAGE_QA: "/manage-question",
    STUDENT: "/survey/student",
    STUDENT_RECORDS: "/survey/student-records",
    SURVEY_FORM: (id: string) => `/survey-form/${id}`,
    STUDENT_ALL: (id: string) => `/survey/student/all/${id}`,
    STUDENT_RECORD: (id: string) => `/survey/student-records/all/${id}`,
  },
};
