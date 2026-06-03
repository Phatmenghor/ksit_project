export function formatType(type?: string): string {
  switch (type) {
    case "NONE":
      return "None";
    case "PERMISSION":
      return "Permission";
    default:
      return "---";
  }
}
