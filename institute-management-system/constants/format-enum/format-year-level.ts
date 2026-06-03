export function formatYearLevel(level?: string): string {
  switch (level) {
    case "FIRST_YEAR":
      return "1st Year";
    case "SECOND_YEAR":
      return "2nd Year";
    case "THIRD_YEAR":
      return "3rd Year";
    case "FOURTH_YEAR":
      return "4th Year";
    default:
      return "---";
  }
}
