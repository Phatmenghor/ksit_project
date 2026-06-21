import { AppSidebarIcons } from "./icons/icon";

export const ROUTE = {
  DASHBOARD: "/",

  AUTH: {
    LOGIN: "/login",
  },

  MASTER_DATA: {
    MANAGE_CLASS: "/master-data/classes",
    COURSES: {
      INDEX: "/master-data/courses",
      ADD: "/master-data/courses/add",
      UPDATE: (id: string) => `/master-data/courses/${id}/edit`,
      VIEW: (id: string) => `/master-data/courses/${id}`,
    },
    MANAGE_SEMESTER: "/master-data/semesters",
    MANAGE_MAJOR: "/master-data/majors",
    MANAGE_DEPARTMENT: "/master-data/departments",
    MANAGE_ROOM: "/master-data/rooms",
    MANAGE_SUBJECT: "/master-data/subjects",
  },

  USERS: {
    ADMIN: {
      INDEX: "/users/admins",
      ADMIN_VIEW: (id: string) => `/users/admins/${id}`,
      EDIT_ADMIN: (id: string) => `/users/admins/${id}/edit`,
      ADD_ADMIN: "/users/admins/add",
    },
    ADMIN_PROFILE: "/profile/admin",
    EDIT_STAFF: (id: string) => `/users/staff/${id}/edit`,
    VIEW_STAFF: (id: string) => `/users/staff/${id}`,
    ADD_STAFF: "/users/staff/add",
    STUFF_OFFICER: "/users/staff",
    TEACHERS: "/users/teachers",
    ADD_TEACHER: "/users/teachers/add",
    EDIT_TEACHER: (id: string) => `/users/teachers/${id}/edit`,
    EDIT_TEACHER_PROFILE: "/profile/teacher/edit",
    EDIT_ADMIN_PROFILE: "/profile/admin/edit",
    VIEW_TEACHER: (id: string) => `/users/teachers/${id}`,
    SETTING_CHANGE_PASSWORD: "/change-password",
  },

  PROFILE: {
    ADMIN: "/profile/admin",
    TEACHER: "/profile/teacher",
    STUDENT: "/profile/student",
  },

  STUDENTS: {
    ADD_MULTIPLE: "/students/add-multiple",
    ADD_SINGLE: "/students/add-single",
    ADD_NEW: "/students/new",
    LIST: "/students",
    EDIT_STUDENT_PROFILE: "/profile/student/edit",
    VIEW: (id: string) => `/students/${id}`,
    EDIT_STUDENT: (id: string) => `/students/${id}/edit`,
  },

  STUDENT_LIST: (id: string) => `/students/class/${id}`,

  MANAGE_SCHEDULE: {
    DEPARTMENT: "/manage-schedule",
    DEPARTMENT_CLASS: "/manage-schedule/class",
    UPDATE_SCHEDULE: "/manage-schedule/",
    ROOT: "/schedule",
    CLASS: (id: string) => `/manage-schedule/class/${id}`,
    All_SCHEDULE_DETAIL: (id: string) => `/manage-schedule/${id}`,
  },

  SCHEDULE: {
    DEPARTMENT: "/manage-schedule",
    ROOT: "/schedule",
  },

  ATTENDANCE: {
    CLASS_SCHEDULE: "/attendance/schedule",
    ATTENDANCE_CHECK: "/attendance/schedule",
    HISTORY_RECORD: "/attendance/history",
    STUDENT_LIST_RECORD: "/attendance/records",
    STUDENT_LIST_RECORD_DETAIL: (id: string) => `/attendance/records/${id}`,
    STUDENT_LIST_HISTORY_RECORD: (scheduleId: string) =>
      `/attendance/history/${scheduleId}`,
    HISTORY_RECORD_DETAIL: (scheduleId: string, studentId: string) =>
      `/attendance/history/${scheduleId}/${studentId}`,
    STUDENT_RECORD_DETAIL: (id: string) => `/attendance/records/${id}`,
  },

  SCORES: {
    STUDENT_SCORE: "/scores/student",
    SUBMITTED: "/scores/submitted",
    SUBMITTED_DETAIL: (id: string) => `/scores/submitted/${id}`,
    STUDENT_SCORE_DETAIL: (id: string) => `/scores/student/${id}/edit`,
    SETTINGS: "/scores/settings",
    GROUP: "/scores/group",
    GROUP_DETAIL: (classId: string) => `/scores/group/${classId}`,
  },

  REQUESTS: "/requests",
  REQUEST_CREATE: "/requests/new",
  MY_REQUESTS: "/my-requests",
  REQUEST_DETAIL: (id: string) => `/requests/${id}`,
  MY_REQUESTS_DETAIL: (id: string) => `/my-requests/${id}`,
  REQUEST_UPDATE: (id: string) => `/requests/${id}`,

  MY_CLASS: {
    CLASS: "/my-class",
    MY_SCHEDULE: "/my-schedule",
    MY_SCHEDULE_DETAIL: (id: string) => `/my-schedule/${id}`,
  },

  PERMISSIONS: "/permissions",
  PAYMENT: {
    ADD_NEW_PAYMENT: "/payments/add",
    LIST: "/payments",
    VIEW_PAYMENT: (id: string) => `/payments/${id}`,
    MY_PAYMENT: `/my-payment`,
  },
  SURVEY: {
    RESULT_LIST: "/survey/results",
    MANAGE_QA: "/survey/questions",
    STUDENT: "/survey/student",
    STUDENT_RECORDS: "/survey/records",
    SURVEY_FORM: (id: string) => `/survey-form/${id}`,
    STUDENT_ALL: (id: string) => `/survey/student/${id}`,
    STUDENT_RECORD: (id: string) => `/survey/records/${id}`,
  },
};
