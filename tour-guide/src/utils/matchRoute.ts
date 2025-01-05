export const matchRoute = (
  pattern: string,
  currentPath: string,
  exact: boolean = false
): boolean => {
  if (!pattern) return true;

  const normalizedPattern = pattern.replace(/\/+/g, "/").replace(/\/$/, "");
  const normalizedCurrentPath = currentPath.replace(/\/+/g, "/").replace(/\/$/, "");

  const regexPattern = normalizedPattern
    .replace(/\[\.{3}[^\]]+\]/g, ".*")
    .replace(/\[[^\]]+\]/g, "[^/]+")
    .replace(/\//g, "\\/");

  const regex = new RegExp(`^${regexPattern}${exact ? "$" : ""}`);
  return regex.test(normalizedCurrentPath);
};
