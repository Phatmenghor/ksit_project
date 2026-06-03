export function formatSemester(semester?: string): string {
  switch (semester) {
    case "SEMESTER_1":
      return "1st Semester";
    case "SEMESTER_2":
      return "2nd Semester";
    default:
      return "---";
  }
}
