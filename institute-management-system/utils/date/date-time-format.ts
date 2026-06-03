export function DateTimeFormatter(
  timstamps: string | null | undefined
): string {
  if (timstamps) {
    const date = new Date(timstamps);

    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Phnom_Penh",
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };

    const formattedDateTime = date.toLocaleString("en-US", options);

    return formattedDateTime;
  }
  return "";
}
