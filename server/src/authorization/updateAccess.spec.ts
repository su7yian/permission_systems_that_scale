import { UserRole, DocumentStatus } from "../generated/prisma/client";
import { test, describe, expect } from '@jest/globals';
import { canReadDocument } from "./readAccess";
import { canUpdateDocument } from "./updateAcess";
describe('canUpdateDocument', () => {
  const user = (role: UserRole) =>
    ({
      id: 'self',
      role,
      department: 'own'
    });

  const document = (status: DocumentStatus, creatorId: string, department: string | null, isLocked: boolean) => ({
    status,
    creatorId,
    project: { department },
    isLocked,
  });

  const cases: Array<[UserRole, DocumentStatus, string, string | null, boolean, boolean]> = [
    //       userRole        doc status,     creator, dpt, locked expected
    [UserRole.admin, DocumentStatus.draft, 'other', 'other', true, true],
    [UserRole.admin, DocumentStatus.draft, 'other', 'other', false, true],
    [UserRole.admin, DocumentStatus.draft, 'other', null, true, true],
    [UserRole.admin, DocumentStatus.draft, 'other', null, false, true],

    [UserRole.admin, DocumentStatus.published, 'other', 'other', true, true],
    [UserRole.admin, DocumentStatus.published, 'other', null, true, true],
    [UserRole.admin, DocumentStatus.published, 'other', 'other', false, true],
    [UserRole.admin, DocumentStatus.published, 'other', null ,false, true],

    [UserRole.author, DocumentStatus.draft, 'self', 'own', true, false],
    [UserRole.author, DocumentStatus.draft, 'other', 'other',false, false],
    [UserRole.author, DocumentStatus.draft, 'self', 'own',false, true],
    [UserRole.author, DocumentStatus.draft, 'self', null, true, false],
    [UserRole.author, DocumentStatus.draft, 'self', null,false, true],

    [UserRole.author, DocumentStatus.published, 'self', 'own',true, false],
    [UserRole.author, DocumentStatus.published, 'self', 'own', false, false],
    [UserRole.author, DocumentStatus.published, 'self', null, true, false],
    [UserRole.author, DocumentStatus.published, 'self', null, false, false],

    [UserRole.editor, DocumentStatus.draft, 'self', 'own', true, false],
    [UserRole.editor, DocumentStatus.draft, 'self', 'own',false, false],
    [UserRole.editor, DocumentStatus.draft, 'self', null, true, false],
    [UserRole.editor, DocumentStatus.draft, 'self', null, false, false],

// department is desesive
    [UserRole.editor, DocumentStatus.published, 'self', 'other', true, false],
    [UserRole.editor, DocumentStatus.published, 'self', 'other', false, false],
    [UserRole.editor, DocumentStatus.published, 'other', 'own', false, true],
    [UserRole.editor, DocumentStatus.published, 'self', null, true,  false],
    [UserRole.editor, DocumentStatus.published, 'self', null, false,  false],
// department is desesive
    [UserRole.viewer, DocumentStatus.published, 'self', 'own',true, false],
    [UserRole.viewer, DocumentStatus.published, 'self', 'own',false, false],
    [UserRole.viewer, DocumentStatus.published, 'self', null,true, false],
    [UserRole.viewer, DocumentStatus.published, 'self', null,false, false],

// draft is desesive, then keep others most restricted.
    [UserRole.viewer, DocumentStatus.draft, 'self', 'own',false, false],
    [UserRole.viewer, DocumentStatus.draft, 'self', 'own',true, false],
    [UserRole.viewer, DocumentStatus.draft, 'self', null,true, false],
    [UserRole.viewer, DocumentStatus.draft, 'self', null,false, false],

  ];

  test.each(cases)('role: %s, status: %s, creator: %s, dept: %s, locked: %s -> %s', 
    (role, status, id, department, isLocked, expected) => {
    const userInstance = user(role);
    const doc = document(status, id, department, isLocked );
    expect(canUpdateDocument(userInstance, doc)).toBe(expected);
  });
});