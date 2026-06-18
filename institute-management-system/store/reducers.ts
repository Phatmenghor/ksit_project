import departmentReducer from "@/features/master-data/store/slice/department-slice";
import majorReducer from "@/features/master-data/store/slice/major-slice";
import roomReducer from "@/features/master-data/store/slice/room-slice";
import semesterReducer from "@/features/master-data/store/slice/semester-slice";
import subjectReducer from "@/features/master-data/store/slice/subject-slice";
import classReducer from "@/features/master-data/store/slice/class-slice";

import staffReducer from "@/features/users/store/slice/staff-slice";

import uiReducer from "./slices/ui-slice";

export const reducers = {
  ui: uiReducer,

  departments: departmentReducer,
  majors: majorReducer,
  rooms: roomReducer,
  semesters: semesterReducer,
  subjects: subjectReducer,
  classes: classReducer,

  staff: staffReducer,
};
