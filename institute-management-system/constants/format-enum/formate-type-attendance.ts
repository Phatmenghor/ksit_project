import { formatEnumLabel } from "@/utils/general/format-enum-label";

export function formatType(type?: string): string {
  if (!type) return "---";
  return formatEnumLabel(type);
}
