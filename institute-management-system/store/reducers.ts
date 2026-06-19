import departmentReducer from "@/features/master-data/store/slice/department-slice";
import majorReducer from "@/features/master-data/store/slice/major-slice";
import roomReducer from "@/features/master-data/store/slice/room-slice";
import semesterReducer from "@/features/master-data/store/slice/semester-slice";
import subjectReducer from "@/features/master-data/store/slice/subject-slice";
import classReducer from "@/features/master-data/store/slice/class-slice";

import courseReducer from "@/features/school/store/slice/course-slice";

import staffReducer from "@/features/users/store/slice/staff-slice";
import studentReducer from "@/features/students/store/slice/student-slice";

import scheduleReducer from "@/features/schedules/store/slice/schedule-slice";
import attendanceReducer from "@/features/schedules/store/slice/attendance-slice";

import submittedScoreReducer from "@/features/scores/store/slice/submitted-score-slice";

import requestReducer from "@/features/requests/store/slice/request-slice";
import myRequestReducer from "@/features/requests/store/slice/my-request-slice";

import paymentReducer from "@/features/payments/store/slice/payment-slice";

import surveyReducer from "@/features/survey/store/slice/survey-slice";
import surveyQAReducer from "@/features/survey/store/slice/survey-qa-slice";
import permissionReducer from "@/features/permissions/store/slice/permission-slice";

import uiReducer from "./slices/ui-slice";
import comboboxCacheReducer from "./slices/combobox-cache-slice";
import authReducer from "./slices/auth-slice";
import statisticReducer from "./slices/statistic-slice";

export const reducers = {
  ui: uiReducer,
  comboboxCache: comboboxCacheReducer,
  auth: authReducer,
  statistic: statisticReducer,

  departments: departmentReducer,
  majors: majorReducer,
  rooms: roomReducer,
  semesters: semesterReducer,
  subjects: subjectReducer,
  classes: classReducer,

  courses: courseReducer,

  staff: staffReducer,
  studentList: studentReducer,

  scheduleList: scheduleReducer,
  attendance: attendanceReducer,

  submittedScores: submittedScoreReducer,

  requests: requestReducer,
  myRequests: myRequestReducer,

  payments: paymentReducer,

  surveyResults: surveyReducer,
  surveyQA: surveyQAReducer,
  permissionsData: permissionReducer,
};
