import { UserRole, DocumentStatus } from "../generated/prisma/client";
import { test, describe, expect } from '@jest/globals';
import { canReadDocument,canReadProject } from "./readAccess";

/*
Rules:
- When expecting access to be false, you take inner most restrictive case, and all outer will be covered as false.
- When expecting access to be true, you take inner most permisive case, and all inner will be covered as true.
- If a single attribute is decisive and restrictive, test it while keeping the other such a attributes most permissive.
- If a single attribute is decisive and permisive, test it while making the other such attributes most restrictive.
- Don't skip a case merely because its obvious to you; skip it only when the tested case logically covers it.
  
Effective test reduced:
  12 possible combinations → 11 tests
  48 possible combinations → 22 tests (scalable test count reduces more as permissions increase. see update spec access )

  Instead of engineering, finance, bob, alice
  The test uses used relationship-based values such as own,any, self
  Now the test cases described the permission itself rather than arbitrary data.

*/
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
