import { UserRole, DocumentStatus } from "../generated/prisma/client";
import { test, describe, expect } from '@jest/globals';
import { canReadDocument,canReadProject } from "./readAccess";

describe('canRead',()=> {
describe('canReadProject', () => {
  const user = (role: UserRole) =>
    ({
      role,
      department: 'own'
    });

  const Project = ( department: string | null) => ({
    department, 
  });
  const cases: Array<[UserRole, string | null, boolean]> = [
    //       userRole, dpt, expected
    [UserRole.admin, 'other', true],
    [UserRole.admin, null, true],

//both are desesive.
    [UserRole.author, 'other', false], 
    [UserRole.author, 'own', true],
    [UserRole.author, null, true],

    [UserRole.editor, 'other', false],
    [UserRole.editor, 'own', true],
    [UserRole.editor, null, true],

    [UserRole.viewer, 'other', false],
    [UserRole.viewer,  'own', true],
    [UserRole.viewer, null, true],
  ];

  test.each(cases)('role: %s, dept: %s -> %s', 
    (role, department, expected) => {
    const userInstance = user(role);
    const proj = Project( department);
    expect(canReadProject(userInstance, proj)).toBe(expected);
  });
});
describe('canReadDocument', () => {
  const user = (role: UserRole) =>
    ({
      id: 'self',
      role,
      department: 'own'
    });

  const document = (status: DocumentStatus, creatorId: string, department: string | null) => ({
    status,
    creatorId,
    project: { department },
  });
  const cases: Array<[UserRole, DocumentStatus, string, string | null, boolean]> = [
    //       userRole        doc status,     creator, dpt, expected
    [UserRole.admin, DocumentStatus.draft, 'other', 'other', true],
    [UserRole.admin, DocumentStatus.published, 'other', 'other', true],
    [UserRole.admin, DocumentStatus.draft, 'other', null, true],
    [UserRole.admin, DocumentStatus.published, 'other', null, true],

//both are desesive.
    [UserRole.author, DocumentStatus.draft, 'other', 'other', false], // proves for other and above/outer of other
    [UserRole.author, DocumentStatus.draft, 'self', 'own', true],
// self is desesive
    [UserRole.author, DocumentStatus.draft, 'other', null, false],
    [UserRole.author, DocumentStatus.draft, 'self', null, true],
// department is desesive
    [UserRole.author, DocumentStatus.published, 'self', 'other', false],
    //although above combination like self created doc in other dpt isnt possiible but it helps cover all test cases and if
    // in future ther exists a bug htat allows creating a doc in other dpt the test will fail. 
    [UserRole.author, DocumentStatus.published, 'other', 'own', true],
    [UserRole.author, DocumentStatus.published, 'other', null, true],
//  department is desesive
    [UserRole.editor, DocumentStatus.draft, 'self', 'other', false],
    [UserRole.editor, DocumentStatus.draft, 'other', 'own', true],
    [UserRole.editor, DocumentStatus.draft, 'self', null, false],
// department is desesive
    [UserRole.editor, DocumentStatus.published, 'self', 'other', false],
    [UserRole.editor, DocumentStatus.published, 'other', 'own', true],
    [UserRole.editor, DocumentStatus.published, 'other', null, true],
// department is desesive
    [UserRole.viewer, DocumentStatus.published, 'self', 'other', false],
    [UserRole.viewer, DocumentStatus.published, 'other', 'own', true],
    [UserRole.viewer, DocumentStatus.published, 'self', null, true],

// draft is desesive, then keep others most restricted.
    [UserRole.viewer, DocumentStatus.draft, 'self', 'own', false],
    [UserRole.viewer, DocumentStatus.draft, 'self', null, false],
  ];

  test.each(cases)('role: %s, status: %s, creator: %s, dept: %s -> %s', 
    (role, status, id, department, expected) => {
    const userInstance = user(role);
    const doc = document(status, id, department);
    expect(canReadDocument(userInstance, doc)).toBe(expected);
  });
});
});
/*
In permissions that are subset of others yu can reduce tests cases by:
If a permission for role is allowding then expect all subset of permissions at allowded level to be true. all inenr will be proven true if you prove outer.
If a permission for role is denying thne expect all outer sets of permissions at restrictive level to be false. all above will be proven false.
If a permission is restrictive for desesive attribute then expect outer set of decisive permission to be false 
and keep all other permissions most restrictive whereas, expect allowded set of decisive permission 
to be true and keep all other permissions most allowding.
this same rule also applies to non scoped/binary permissions too, if the desesive is that non scoped / binary permission but if desesive is set / subset of permissions then all birnary cases.
lets take exampel we have permissions like creaotr which could be anyone or self self is subset of anyone 
and a permsision any dpt or owndpt own dpt is subset of nay spt if no one desicdes then you will have always a way out ... 
its only for permission with set and subset... you have to make either one or both dessesive 
if both then expect outer range of all desesive subsets to be false as it will false all above permissions.
and expect the allowdded subset with both attributes exactly to be true.  
*/