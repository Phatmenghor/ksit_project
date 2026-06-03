import { use } from "react";

export function truncateText(
  text: string | null | undefined,
  maxLength: number = 20,
  placeholder: string = "---"
): string {
  if (!text) return placeholder;
  return text.length > maxLength ? `${text.slice(0, maxLength)} ...` : text;
}

//----- how to use
// <TableCell>
//   {truncateText(req?.title)}    or    truncateText(req?.title, 30);
// </TableCell>
