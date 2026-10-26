// Mirrors api/internal/domain/user.go: 3–30 lowercase letters, digits,
// underscores, hyphens or periods. The API validates independently.
export const USERNAME_PATTERN = "[a-z0-9._\\-]{3,30}";
export const USERNAME_HINT = "3–30 characters: lowercase letters, numbers, _ - and .";

export function normalizeUsername(value: string): string {
  return value.toLowerCase().replace(/\s/g, "");
}
