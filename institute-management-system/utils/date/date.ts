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

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// =============================================================================
// DATE UTILITIES
// =============================================================================

export class DateUtils {
  // Format date
  static format(date: Date, format: string, locale: string = "en-US"): string {
    const options: Intl.DateTimeFormatOptions = {};

    if (format.includes("YYYY")) options.year = "numeric";
    if (format.includes("MM")) options.month = "2-digit";
    if (format.includes("DD")) options.day = "2-digit";
    if (format.includes("HH")) options.hour = "2-digit";
    if (format.includes("mm")) options.minute = "2-digit";
    if (format.includes("ss")) options.second = "2-digit";

    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  // Add days to date
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Add months to date
  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  // Add years to date
  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  // Get difference in days
  static diffInDays(date1: Date, date2: Date): number {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Get difference in months
  static diffInMonths(date1: Date, date2: Date): number {
    return Math.abs(
      date2.getMonth() -
        date1.getMonth() +
        12 * (date2.getFullYear() - date1.getFullYear())
    );
  }

  // Get difference in years
  static diffInYears(date1: Date, date2: Date): number {
    return Math.abs(date2.getFullYear() - date1.getFullYear());
  }

  // Check if date is today
  static isToday(date: Date): boolean {
    const today = new Date();
    return DateUtils.isSameDay(date, today);
  }

  // Check if dates are same day
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  // Check if date is weekend
  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  // Check if date is weekday
  static isWeekday(date: Date): boolean {
    return !DateUtils.isWeekend(date);
  }

  // Get start of day
  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  // Get end of day
  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  // Get start of month
  static startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  // Get end of month
  static endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  // Get age from birth date
  static getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Check if leap year
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  // Get days in month
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  // Get timezone offset
  static getTimezoneOffset(date: Date): number {
    return date.getTimezoneOffset();
  }

  // Convert to UTC
  static toUTC(date: Date): Date {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }

  // Convert from UTC
  static fromUTC(date: Date): Date {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  }
}
