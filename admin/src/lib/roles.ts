import type { AdminUserDTO, Role } from "./types";

// Mirrors api/internal/domain/user.go — used only for UI decisions (which
// buttons to show). The API enforces the real rules independently.
export function isSuperAdmin(user: Pick<AdminUserDTO, "role">): boolean {
  return user.role === "super_admin";
}

export function isStaff(user: Pick<AdminUserDTO, "role">): boolean {
  return user.role === "super_admin" || user.role === "admin";
}

export function assignableRoles(actor: AdminUserDTO): Role[] {
  if (actor.role === "super_admin") return ["super_admin", "admin", "editor"];
  if (actor.role === "admin") return ["admin", "editor"];
  return [];
}

export function canManage(actor: AdminUserDTO, target: AdminUserDTO): boolean {
  if (actor.role === "super_admin") return true;
  if (actor.role === "admin") return target.role === "admin" || target.role === "editor";
  return false;
}
