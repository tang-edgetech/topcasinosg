import type { SecurityPolicyDTO } from "@/lib/types";

// UI-only mirror of SecurityPolicy.PasswordProblem in
// api/internal/domain/security_policy.go, for the hints under password
// fields; the API enforces the real rules.
export function passwordRules(policy: SecurityPolicyDTO | undefined): string {
  const minLength = Math.max(policy?.passwordMinLength ?? 8, 8);
  const extras: string[] = [];
  if (policy?.passwordRequireMixed) extras.push("upper and lower case letters");
  if (policy?.passwordRequireNumber) extras.push("a number");
  if (policy?.passwordRequireSymbol) extras.push("a symbol");
  return `At least ${minLength} characters${extras.length ? `, with ${extras.join(", ")}` : ""}.`;
}
