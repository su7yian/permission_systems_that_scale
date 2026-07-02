import { Document, Project, User } from "../generated/prisma/client";
import {can} from "./roleBasedAccess";

export function canReadProject(
    user: Pick< User, "role" | "department">,
     project: Pick<Project,"department">
    ):boolean{
     if(can(user.role,"project:read:all")) {
        return true;
     }
     if(can(user.role,"project:read:noDpt") && project.department === null){
        return true;
     }
     if(can(user.role,"project:read:ownDpt") && user.department === project.department){
        return true;
     }
     return false;
    }
    // the reading of documents also depends on documents department which is defined by projects
    export function canReadDocument( 
      user: Pick< User, "role" | "department" | "id">,
      document: Pick<Document, "status"| 'creatorId'> & { project: Pick<Project, "department"> },
   ): boolean {
      const isOwner:boolean = document.creatorId === user.id;
      const isDraft:boolean = document.status === 'draft';
      const isOwnDept: boolean =  user.department === document.project.department;

     if(can(user.role,"document:read:all")) {
        return true;
     }
     if(can(user.role,"document:read:draft:ownDpt") && isDraft && isOwnDept ){
      return true;
     }
      if(can(user.role,"document:read:draft:owner") && isDraft && isOwner){
            return true;
      }

      if(can(user.role,"document:read:published:noDpt") && document.project.department === null && !isDraft){
        return true;
     }
     if(can(user.role,"document:read:published:ownDpt") && isOwnDept && !isDraft){
        return true;
     }
   return false;
   }
