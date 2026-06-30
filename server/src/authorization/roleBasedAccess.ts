import { UserRole } from "src/generated/prisma/enums";

type Permissions =
    | "document:create"
    | "document:read"
    | "document:read:drafts"
   | "document:delete"
    | "project:create"
    | "project:read"
    | "project:update"
    | "project:delete"
    | "project:read:all"
    | "project:read:own:dpt" // documetns can be read in dpt so same deprtment authorization applies
    | "project:read:non:dpt"
    | "document:update:all"
    | "document:update:unlocked"
    | "document:update:own-unlocked-draft"

const permissionsByRole: Record<UserRole,Permissions[]> ={
    admin: [
    "document:create",
    "document:read",
    "document:read:drafts",
    "document:update:all",
    "document:delete",
    "project:create",
    "project:read",
    "project:read:all",
    "project:update",
    "project:delete",
    "document:read:drafts",
    ],
  author:[
    "document:read",
    "document:create",
    "document:update:own-unlocked-draft",
    "project:read",
    "project:read:own:dpt",
    "project:read:non:dpt",
    ],
  editor: [
     "document:read",
     "document:update:unlocked",
     "project:read",
     "project:read:own:dpt", 
     "project:read:non:dpt",
     "document:read:drafts",
    ],
  viewer: [
    "document:read",
    "project:read", 
    "project:read:own:dpt", 
    "project:read:non:dpt",
  ],
};

export function can(role: UserRole, permission: Permissions) {
  return permissionsByRole[role].includes(permission)
}
