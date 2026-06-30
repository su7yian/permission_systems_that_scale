import { UserRole } from "src/generated/prisma/enums";

type Permissions =
    | "document:create"
    | "document:read"
    | "document:update"
    | "document:delete"
    | "project:create"
    | "project:read"
    | "project:update"
    | "project:delete"

const permissionsByRole: Record<UserRole,Permissions[]> ={
    admin: [
    "document:create",
    "document:read",
    "document:update",
    "document:delete",
    "project:create",
    "project:read",
    "project:update",
    "project:delete",
    ],
  author:["document:read","document:create","document:update","project:read"],
  editor: ["document:read", "document:update", "project:read",],
  viewer: ["document:read","project:read"],
};

export function can(role: UserRole, permission: Permissions) {
  return permissionsByRole[role].includes(permission)
}