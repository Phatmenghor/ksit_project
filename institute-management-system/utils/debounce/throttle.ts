export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
) {
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (lastRan === null || now - lastRan >= limit) {
      func(...args);
      lastRan = now;
    } else {
      if (lastFunc) clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        func(...args);
        lastRan = Date.now();
      }, limit - (now - lastRan));
    }
  };
}
