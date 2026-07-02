import { UserRole } from "src/generated/prisma/enums";

export type Permissions =
    | "document:create"
   | "document:delete"
    | "project:create"
    | "project:update"
    | "project:delete"
    | "project:read:all"
    | "project:read:ownDpt"
    | "project:read:noDpt"
    | "document:read:all"
    | "document:read:published:ownDpt"
    | "document:read:published:noDpt"
    | "document:read:draft:ownDpt"
    | "document:read:draft:owner"
    | "document:update:all"
    | "document:update:published:unlocked"
    | "document:update:draft:unlocked:owner"

const permissionsByRole: Record<UserRole,Permissions[]> ={
    admin: [
    "document:create",
    "document:read:all",
    "document:update:all",
    "document:delete",
    "project:create",
    "project:read:all",
    "project:update",
    "project:delete",
    ],
  author:[
     "document:read:published:ownDpt",
     "document:read:published:noDpt",
     "document:read:draft:owner",
    "document:create",
    "document:update:draft:unlocked:owner",
    "project:read:ownDpt",
    "project:read:noDpt",
    ],
  editor: [
     "document:update:published:unlocked",
      "document:read:published:ownDpt",
     "document:read:published:noDpt",
      "document:read:draft:ownDpt",
     "project:read:ownDpt", 
     "project:read:noDpt",
    ],
  viewer: [
    "project:read:ownDpt", 
    "project:read:noDpt",
    "document:read:published:ownDpt",
    "document:read:published:noDpt",
  ],
};

export function can(role: UserRole, permission: Permissions) {
  return permissionsByRole[role].includes(permission)
}
