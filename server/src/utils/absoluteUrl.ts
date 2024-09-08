export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  if (process.env.PRODUCTION_URL) return `${process.env.PRODUCTION_URL}${path}`;
  return `http://localhost:3000${path}`;
}
