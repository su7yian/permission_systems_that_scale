import { User,Document } from "../generated/prisma/client"
import { can } from "./roleBasedAccess"

export function canUpdateDocument(
  user: Pick<User, "role" | "id">,
  document: Pick<Document, "creatorId" | "status" | "isLocked">,
): boolean {
    // Admins: can edit any document
    if(can(user.role, "document:update:all")){
      return true;
    }
    // Editors: can edit any unlocked document
    if(can(user.role, "document:update:unlocked") && !document.isLocked) {
      return true;
    }
    // Authors: only their own, unlocked, draft documents
    if(can(user.role, "document:update:own-unlocked-draft") &&
      document.creatorId === user.id &&
      !document.isLocked &&
       document.status === "draft"){
        return true;
      }
      return false;
}