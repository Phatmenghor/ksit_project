import { RoleEnum } from "@/constants/constant";

export function removeEmptyStringsAndNulls<T extends object>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (value === "" || value === null) return undefined; // remove empty string and null
      return value;
    })
  );
}
