export function formatDegree(degree?: string): string {
  switch (degree) {
    case "BACHELOR":
      return "Bachelor";
    case "ASSOCIATE":
      return "Associate";
    default:
      return "---";
  }
}
