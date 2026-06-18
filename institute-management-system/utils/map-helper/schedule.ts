import { DAYS_OF_WEEK } from "@/constants/constant";
import { ScheduleModel } from "@/model/schedules/all-schedule-model";

const SEMESTER_LABELS: Record<string, string> = {
  SEMESTER_1: "Semester 1",
  SEMESTER_2: "Semester 2",
  All_SEMESTER: "All Semesters",
};

export function formatTime12h(time?: string | null): string {
  if (!time) return "—";
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minuteStr ?? "00"} ${period}`;
}

export function formatSemester(value: string | undefined | null): string {
  if (!value) return "---";
  return SEMESTER_LABELS[value] ?? value;
}

export function formatAcademyYear(value: string | number | undefined | null): string {
  if (!value || value === "---") return "---";
  const year = Number(value);
  if (isNaN(year)) return String(value);
  return `${year}-${year + 1}`;
}

type WeeklySchedule = {
  day: string;
  classes: {
    subjectCode: string;
    subject: string;
    credit: string;
    instructor: string;
    datetime: string;
    room: string;
  }[];
};

export function convertToWeeklySchedule(scheduleData: ScheduleModel[]): {
  classInfo: {
    class: string;
    major: string;
    semester: string;
    academicYear: string;
  };
  weeklySchedule: WeeklySchedule[];
} {
  // Filter out "ALL" when creating empty schedule
  const EMPTY_WEEKLY_SCHEDULE: WeeklySchedule[] = DAYS_OF_WEEK.filter(
    (day) => day.value !== "ALL"
  ).map((day) => ({
    day: day.label,
    classes: [],
  }));

  if (!scheduleData || scheduleData.length === 0) {
    return {
      classInfo: {
        class: "---",
        semester: "---",
        major: "---",
        academicYear: "---",
      },
      weeklySchedule: EMPTY_WEEKLY_SCHEDULE,
    };
  }

  const schedules = Array.isArray(scheduleData) ? scheduleData : [scheduleData];
  const firstSchedule = schedules[0];

  const classInfo = {
    class: firstSchedule?.classes?.code || "---",
    semester: firstSchedule?.semester?.semester || "---",
    major: firstSchedule?.classes.major.name || "---",
    academicYear: String(firstSchedule?.classes?.academyYear || "---"),
  };

  const weeklyMap: Record<string, WeeklySchedule["classes"]> = {};

  // Initialize days (excluding "ALL")
  DAYS_OF_WEEK.forEach((day) => {
    if (day.value !== "ALL") {
      weeklyMap[day.value] = [];
    }
  });
  weeklyMap["---"] = []; // fallback for invalid days

  const getInstructorName = (teacher: any): string => {
    if (!teacher) return "---";
    const english = `${teacher.englishFirstName ?? ""} ${
      teacher.englishLastName ?? ""
    }`.trim();
    const khmer = `${teacher.khmerFirstName ?? ""} ${
      teacher.khmerLastName ?? ""
    }`.trim();
    return english || khmer || teacher.username || "---";
  };

  schedules.forEach((schedule) => {
    if (!schedule) return;

    const isValidDay = DAYS_OF_WEEK.some(
      (d) => d.value === schedule.day && d.value !== "ALL"
    );
    const dayKey = isValidDay ? schedule.day : "---";

    const instructorName = getInstructorName(schedule.teacher);

    const classItem = {
      subjectCode: schedule.course?.code || "---",
      subject: schedule.course?.nameKH || schedule.course?.nameEn || "---",
      credit: schedule.course?.credit
        ? `${schedule.course.credit}(${schedule.course.theory ?? 0}.${
            schedule.course.execute ?? 0
          }.${schedule.course.apply ?? 0})`
        : "---",

      instructor: instructorName,
      datetime: `${formatTime12h(schedule.startTime)} - ${formatTime12h(schedule.endTime)}`,
      room: schedule.room?.name || "---",
    };

    weeklyMap[dayKey].push(classItem);
  });

  // Create weekly schedule (excluding "ALL")
  const weeklySchedule: WeeklySchedule[] = DAYS_OF_WEEK.filter(
    (day) => day.value !== "ALL"
  ).map((day) => ({
    day: day.label,
    classes: weeklyMap[day.value] || [],
  }));

  // Include fallback group (---) at the end if it has any classes
  if (weeklyMap["---"] && weeklyMap["---"].length > 0) {
    weeklySchedule.push({
      day: "---",
      classes: weeklyMap["---"],
    });
  }

  // Sort by day order (excluding "ALL" from sorting)
  weeklySchedule.sort((a, b) => {
    const indexA = DAYS_OF_WEEK.findIndex(
      (d) => d.label === a.day && d.value !== "ALL"
    );
    const indexB = DAYS_OF_WEEK.findIndex(
      (d) => d.label === b.day && d.value !== "ALL"
    );
    return indexA - indexB;
  });

  return { classInfo, weeklySchedule };
}
