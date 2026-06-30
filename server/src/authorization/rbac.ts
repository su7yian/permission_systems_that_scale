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
    | "project:read:all"
    | "project:read:own:dpt"
    | "project:read:non:dpt"


const permissionsByRole: Record<UserRole,Permissions[]> ={
    admin: [
    "document:create",
    "document:read",
    "document:update",
    "document:delete",
    "project:create",
    "project:read",
    "project:read:all",
    "project:read:own:dpt",
    "project:read:non:dpt",
    "project:update",
    "project:delete",
    ],
  author:[
    "document:read",
    "document:create",
    "document:update",
    "project:read",
    "project:read:own:dpt",
    "project:read:non:dpt"
    ],
  editor: [
     "document:read",
     "document:update", 
     "project:read",
     "project:read:own:dpt", 
     "project:read:non:dpt"
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
