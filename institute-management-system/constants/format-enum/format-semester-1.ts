export function formatSemesterOne(semester?: string): string {
  switch (semester) {
    case "SEMESTER_1":
      return "Semester 1";
    case "SEMESTER_2":
      return "Semester 2";
    default:
      return "---";
  }
}
