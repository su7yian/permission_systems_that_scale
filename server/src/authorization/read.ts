import { Project, User } from "../generated/prisma/client";
import {can} from "./rbac";

function canReadProjects(
    user: Pick< User, "role" | "department">,
     project: Pick<Project,"department">
    ){
     if(can(user.role,"project:read:all")) {
        return true;
     }
     if(can(user.role,"project:read:non:dpt") && project.department === null){
        return true;
     }
     if(can(user.role,"project:read:own:dpt") && user.department === project.department){
        return true;
     }
     return false;
    }
    export {
      canReadProjects,
      canReadProjects as canReadDocuments
    }