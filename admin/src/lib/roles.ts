import type { AdminUserDTO, Role } from "./types";

// Mirrors api/internal/domain/user.go — used only for UI decisions (which
// buttons to show). The API enforces the real rules independently.
export function assignableRoles(actor: AdminUserDTO): Role[] {
  if (actor.role === "super_admin") return ["super_admin", "admin", "editor"];
  if (actor.role === "admin") return actor.canManageAdmins ? ["admin", "editor"] : ["editor"];
  return [];
}

export function canManage(actor: AdminUserDTO, target: AdminUserDTO): boolean {
  if (actor.role === "super_admin") return true;
  if (actor.role === "admin") {
    if (target.role === "editor") return true;
    if (target.role === "admin") return actor.canManageAdmins;
    return false;
  }
  return false;
}