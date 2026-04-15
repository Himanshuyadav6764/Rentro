/**
 * Shared environment-variable helpers used across server & client code.
 * Centralises placeholder detection so "TODO", "your-", "replace_with", etc.
 * are caught in one place.
 */

const PLACEHOLDER_PREFIXES = [
  "todo",
  "your-",
  "your_",
  "replace_with",
  "replace-with",
  "add_",
  "add-",
  "put_",
  "put-",
  "enter_",
  "enter-",
  "insert_",
  "insert-",
  "fill_",
  "fill-",
  "changeme",
  "change_me",
  "change-me",
  "placeholder",
];

const PLACEHOLDER_INCLUDES = [
  "example",
  "<",
  "xxxxx",
  "your_",
  "your-",
  "project-id",
  "project_id_here",
];

/**
 * Returns `true` when the value looks like a dev placeholder
 * (empty, undefined, or starts with a known prefix like "TODO").
 */
export function isPlaceholderValue(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized.length === 0) {
    return true;
  }

  if (PLACEHOLDER_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return true;
  }

  if (PLACEHOLDER_INCLUDES.some((fragment) => normalized.includes(fragment))) {
    return true;
  }

  return false;
}

/**
 * Returns `true` only when the value is a real, non-placeholder credential.
 */
export function isConfigured(value: string | undefined): boolean {
  return !isPlaceholderValue(value);
}

/**
 * Validates that a set of required env vars are present and real.
 * Returns an array of variable names that are missing / placeholder.
 */
export function getMissingEnvVars(
  vars: Record<string, string | undefined>,
): string[] {
  return Object.entries(vars)
    .filter(([, value]) => isPlaceholderValue(value))
    .map(([key]) => key);
}

/**
 * Log a warning (server-side only) when critical env vars are placeholders.
 * Safe to call from Edge/Node – guards against `console` absence.
 */
export function warnMissingEnv(context: string, missing: string[]): void {
  if (missing.length === 0) {
    return;
  }

  if (typeof console !== "undefined") {
    console.warn(
      `[Rentro:${context}] Missing or placeholder env vars: ${missing.join(", ")}`,
    );
  }
}
