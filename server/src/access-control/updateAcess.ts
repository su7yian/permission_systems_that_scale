import { User,Document,Project} from "../generated/prisma/client"
import { can } from "./roleBasedAccess"

export function canUpdateDocument(
  user: Pick<User, "role" | "id" | "department">,
  document: Pick<Document, "creatorId" | "status" | "isLocked"> & {project: Pick<Project, "department">},
): boolean {
  const isDraft = document.status==='draft';
    // Admins: can edit any document
    if(can(user.role, "document:update:all")){
      return true;
    }
    // Editors: can edit any unlocked document
    if(can(user.role, "document:update:published:unlocked:ownDpt") && !document.isLocked && document.project.department === user.department && !isDraft ) {
      return true;
    }
    // Authors: only their own, unlocked, draft documents
    if(can(user.role, "document:update:draft:unlocked:owner") && isDraft &&
      document.creatorId === user.id &&
      !document.isLocked
       ){
        return true;
      }
      return false;
}