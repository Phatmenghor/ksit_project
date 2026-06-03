export const formatYearLevel = (yearLevel: string) => {
  return yearLevel
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export const formatDegree = (degree: string) => {
  return degree.charAt(0).toUpperCase() + degree.slice(1).toLowerCase();
};
