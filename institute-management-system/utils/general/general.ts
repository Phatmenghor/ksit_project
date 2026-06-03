// =============================================================================
// COMPREHENSIVE TYPESCRIPT UTILITY LIBRARY
// =============================================================================

// =============================================================================
// TYPE UTILITIES
// =============================================================================

// Deep readonly type
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Deep partial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Pick by value type
export type PickByValue<T, ValueType> = Pick<
  T,
  {
    [Key in keyof T]: T[Key] extends ValueType ? Key : never;
  }[keyof T]
>;

// Omit by value type
export type OmitByValue<T, ValueType> = Omit<
  T,
  {
    [Key in keyof T]: T[Key] extends ValueType ? Key : never;
  }[keyof T]
>;

// Non-nullable type
export type NonNullable<T> = T extends null | undefined ? never : T;

// Function type utilities
export type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;
export type ReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;

// =============================================================================
// ARRAY UTILITIES
// =============================================================================

export class ArrayUtils {
  // Remove duplicates from array
  static unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
  }

  // Remove duplicates by property
  static uniqueBy<T, K extends keyof T>(arr: T[], key: K): T[] {
    const seen = new Set();
    return arr.filter((item) => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  // Flatten array of arrays
  static flatten<T>(arr: T[][]): T[] {
    return arr.reduce((acc, val) => acc.concat(val), []);
  }

  // Deep flatten array
  static deepFlatten<T>(arr: any[]): T[] {
    return arr.reduce(
      (acc, val) =>
        Array.isArray(val)
          ? acc.concat(ArrayUtils.deepFlatten(val))
          : acc.concat(val),
      []
    );
  }

  // Chunk array into smaller arrays
  static chunk<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  }

  // Group array by property
  static groupBy<T, K extends keyof T>(arr: T[], key: K): Record<string, T[]> {
    return arr.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  // Sort array by multiple properties
  static sortBy<T>(arr: T[], ...keys: (keyof T)[]): T[] {
    return [...arr].sort((a, b) => {
      for (const key of keys) {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
      }
      return 0;
    });
  }

  // Find intersection of arrays
  static intersection<T>(...arrays: T[][]): T[] {
    return arrays.reduce((acc, arr) => acc.filter((x) => arr.includes(x)));
  }

  // Find difference between arrays
  static difference<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((x) => !arr2.includes(x));
  }

  // Shuffle array
  static shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Sample random element(s) from array
  static sample<T>(arr: T[], count: number = 1): T[] {
    const shuffled = ArrayUtils.shuffle(arr);
    return shuffled.slice(0, count);
  }

  // Check if array is empty
  static isEmpty<T>(arr: T[]): boolean {
    return arr.length === 0;
  }

  // Get last element
  static last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
  }

  // Get first element
  static first<T>(arr: T[]): T | undefined {
    return arr[0];
  }

  // Remove falsy values
  static compact<T>(arr: T[]): NonNullable<T>[] {
    return arr.filter(Boolean) as NonNullable<T>[];
  }

  // Zip arrays together
  static zip<T, U>(arr1: T[], arr2: U[]): [T, U][] {
    return arr1.map((val, i) => [val, arr2[i]]);
  }

  // Transpose 2D array
  static transpose<T>(matrix: T[][]): T[][] {
    return (
      matrix[0]?.map((_, colIndex) => matrix.map((row) => row[colIndex])) || []
    );
  }
}

// =============================================================================
// OBJECT UTILITIES
// =============================================================================

export class ObjectUtils {
  // Deep clone object
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array)
      return obj.map((item) => ObjectUtils.deepClone(item)) as unknown as T;
    if (typeof obj === "object") {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = ObjectUtils.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  }

  // Deep merge objects
  static deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (ObjectUtils.isObject(target) && ObjectUtils.isObject(source)) {
      for (const key in source) {
        if (ObjectUtils.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          ObjectUtils.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return ObjectUtils.deepMerge(target, ...sources);
  }

  // Check if value is object
  static isObject(item: any): item is object {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  // Get nested property value
  static get<T>(obj: any, path: string, defaultValue?: T): T {
    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) return defaultValue as T;
    }

    return result;
  }

  // Set nested property value
  static set(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  // Check if object has nested property
  static has(obj: any, path: string): boolean {
    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return false;
      }
      current = current[key];
    }

    return true;
  }

  // Get object keys with type safety
  static keys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
  }

  // Get object values with type safety
  static values<T extends object>(obj: T): T[keyof T][] {
    return Object.values(obj);
  }

  // Get object entries with type safety
  static entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
  }

  // Pick specific properties
  static pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  // Omit specific properties
  static omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }

  // Check if object is empty
  static isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }

  // Invert object keys and values
  static invert(obj: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[value] = key;
    }
    return result;
  }

  // Map object values
  static mapValues<T, U>(
    obj: Record<string, T>,
    fn: (value: T, key: string) => U
  ): Record<string, U> {
    const result: Record<string, U> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = fn(value, key);
    }
    return result;
  }

  // Map object keys
  static mapKeys<T>(
    obj: Record<string, T>,
    fn: (key: string, value: T) => string
  ): Record<string, T> {
    const result: Record<string, T> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[fn(key, value)] = value;
    }
    return result;
  }
}

// =============================================================================
// STRING UTILITIES
// =============================================================================

export class StringUtils {
  // Capitalize first letter
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Convert to camelCase
  static camelCase(str: string): string {
    return str.replace(/[-_\s]+(.)?/g, (_, char) =>
      char ? char.toUpperCase() : ""
    );
  }

  // Convert to PascalCase
  static pascalCase(str: string): string {
    return StringUtils.capitalize(StringUtils.camelCase(str));
  }

  // Convert to snake_case
  static snakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/^_/, "");
  }

  // Convert to kebab-case
  static kebabCase(str: string): string {
    return str
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .replace(/^-/, "");
  }

  // Convert to CONSTANT_CASE
  static constantCase(str: string): string {
    return StringUtils.snakeCase(str).toUpperCase();
  }

  // Truncate string
  static truncate(str: string, length: number, suffix: string = "..."): string {
    if (str.length <= length) return str;
    return str.slice(0, length - suffix.length) + suffix;
  }

  // Pad string
  static pad(str: string, length: number, char: string = " "): string {
    if (str.length >= length) return str;
    const padding = char.repeat(Math.ceil((length - str.length) / char.length));
    const start = Math.floor((length - str.length) / 2);
    return padding.slice(0, start) + str + padding.slice(start);
  }

  // Pad start
  static padStart(str: string, length: number, char: string = " "): string {
    if (str.length >= length) return str;
    const padding = char.repeat(Math.ceil((length - str.length) / char.length));
    return padding.slice(0, length - str.length) + str;
  }

  // Pad end
  static padEnd(str: string, length: number, char: string = " "): string {
    if (str.length >= length) return str;
    const padding = char.repeat(Math.ceil((length - str.length) / char.length));
    return str + padding.slice(0, length - str.length);
  }

  // Remove accents
  static removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Slugify string
  static slugify(str: string): string {
    return StringUtils.removeAccents(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Count occurrences of substring
  static count(str: string, substring: string): number {
    return (str.match(new RegExp(substring, "g")) || []).length;
  }

  // Check if string contains only digits
  static isNumeric(str: string): boolean {
    return /^\d+$/.test(str);
  }

  // Check if string is email
  static isEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  // Check if string is URL
  static isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  // Escape HTML
  static escapeHtml(str: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return str.replace(/[&<>"']/g, (char) => map[char]);
  }

  // Unescape HTML
  static unescapeHtml(str: string): string {
    const map: Record<string, string> = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
    };
    return str.replace(
      /&amp;|&lt;|&gt;|&quot;|&#39;/g,
      (entity) => map[entity]
    );
  }

  // Generate random string
  static random(
    length: number = 10,
    charset: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  ): string {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  // Word wrap
  static wordWrap(str: string, width: number): string {
    return str
      .replace(new RegExp(`(.{1,${width}})(\\s|$)`, "g"), "$1\n")
      .trim();
  }

  // Reverse string
  static reverse(str: string): string {
    return str.split("").reverse().join("");
  }

  // Check if palindrome
  static isPalindrome(str: string): boolean {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleaned === StringUtils.reverse(cleaned);
  }
}

// =============================================================================
// NUMBER UTILITIES
// =============================================================================

export class NumberUtils {
  // Check if number is even
  static isEven(num: number): boolean {
    return num % 2 === 0;
  }

  // Check if number is odd
  static isOdd(num: number): boolean {
    return num % 2 !== 0;
  }

  // Check if number is prime
  static isPrime(num: number): boolean {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  }

  // Generate random number between min and max
  static random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  // Generate random integer between min and max
  static randomInt(min: number, max: number): number {
    return Math.floor(NumberUtils.random(min, max + 1));
  }

  // Clamp number between min and max
  static clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }

  // Round to specified decimal places
  static round(num: number, decimals: number = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }

  // Format number with thousand separators
  static format(num: number, locale: string = "en-US"): string {
    return new Intl.NumberFormat(locale).format(num);
  }

  // Format as currency
  static formatCurrency(
    num: number,
    currency: string = "USD",
    locale: string = "en-US"
  ): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(num);
  }

  // Format as percentage
  static formatPercent(num: number, locale: string = "en-US"): string {
    return new Intl.NumberFormat(locale, {
      style: "percent",
    }).format(num);
  }

  // Calculate percentage
  static percentage(part: number, total: number): number {
    return (part / total) * 100;
  }

  // Calculate factorial
  static factorial(num: number): number {
    if (num < 0) return -1;
    if (num === 0) return 1;
    return num * NumberUtils.factorial(num - 1);
  }

  // Calculate greatest common divisor
  static gcd(a: number, b: number): number {
    return b === 0 ? a : NumberUtils.gcd(b, a % b);
  }

  // Calculate least common multiple
  static lcm(a: number, b: number): number {
    return Math.abs(a * b) / NumberUtils.gcd(a, b);
  }

  // Check if number is in range
  static inRange(num: number, min: number, max: number): boolean {
    return num >= min && num <= max;
  }

  // Convert to binary
  static toBinary(num: number): string {
    return num.toString(2);
  }

  // Convert to hexadecimal
  static toHex(num: number): string {
    return num.toString(16);
  }

  // Convert to octal
  static toOctal(num: number): string {
    return num.toString(8);
  }

  // Sum of array of numbers
  static sum(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0);
  }

  // Average of array of numbers
  static average(numbers: number[]): number {
    return NumberUtils.sum(numbers) / numbers.length;
  }

  // Median of array of numbers
  static median(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  // Mode of array of numbers
  static mode(numbers: number[]): number[] {
    const frequency: Record<number, number> = {};
    let maxFreq = 0;

    for (const num of numbers) {
      frequency[num] = (frequency[num] || 0) + 1;
      maxFreq = Math.max(maxFreq, frequency[num]);
    }

    return Object.keys(frequency)
      .filter((key) => frequency[Number(key)] === maxFreq)
      .map(Number);
  }
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

// =============================================================================
// FUNCTION UTILITIES
// =============================================================================

export class FunctionUtils {
  // Debounce function
  static debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function
  static throttle<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), wait);
      }
    };
  }

  // Memoize function
  static memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map();

    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  // Curry function
  static curry<T extends (...args: any[]) => any>(func: T): any {
    return function curried(...args: any[]): any {
      if (args.length >= func.length) {
        return func.apply(this, args);
      } else {
        return function (...args2: any[]) {
          return curried.apply(this, args.concat(args2));
        };
      }
    };
  }

  // Compose functions
  static compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
    return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
  }

  // Pipe functions
  static pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
    return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
  }

  // Retry function with exponential backoff
  static async retry<T>(
    func: () => Promise<T>,
    maxRetries: number = 3,
    backoffMs: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await func();
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries) break;

        const delay = backoffMs * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // Once function (execute only once)
  static once<T extends (...args: any[]) => any>(func: T): T {
    let called = false;
    let result: ReturnType<T>;

    return ((...args: Parameters<T>) => {
      if (!called) {
        called = true;
        result = func(...args);
      }
      return result;
    }) as T;
  }

  // Partial application
  static partial<T extends (...args: any[]) => any>(
    func: T,
    ...partialArgs: any[]
  ): (...args: any[]) => ReturnType<T> {
    return (...args: any[]) => func(...partialArgs, ...args);
  }
}
