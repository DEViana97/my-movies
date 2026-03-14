export function getErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const maybe = payload as { error?: unknown };
  return typeof maybe.error === "string" && maybe.error.trim() ? maybe.error : fallback;
}
