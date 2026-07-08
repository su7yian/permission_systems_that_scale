import { test, describe, expect } from '@jest/globals';
import { documentsWhereClause, projectsWhereClause } from './userWhereClause';
import { UserRole } from '../generated/prisma/enums';

describe('projectsWhereClause', () => {
  const cases = [
    {
      role: UserRole.admin,
      department: 'own', // department of current user will be used to create user object.
      expected: undefined,
      description: 'admin sees all projects'
    },
    {
      role: UserRole.author,
      department: 'own',
      expected: { OR: [{ department: 'own' }, { department: null }] },
      description: 'author sees own and null projects'
    },
    {
      role: UserRole.editor,
      department: 'own',
      expected: { OR: [{ department: 'own' }, { department: null }] },
      description: 'editor sees own and null projects'
    },
    {
      role: UserRole.viewer,
      department: 'own',
      expected: { OR: [{ department: 'own' }, { department: null }] },
      description: 'viewer sees own and null projects'
    }
  ];

  test.each(cases)('$description', ({ role, department, expected }) => {
    const user = { role, department };
    expect(projectsWhereClause(user)).toEqual(expected);
  });

  test('throws error for unhandled role', () => {

    const user = { role: 'unknown' as UserRole, department: 'own' };
    expect(() => projectsWhereClause(user)).toThrow('Unhandled user role: unknown');
  });
});

//------------------------------------------------------------------------------------------------------------

describe('documentsWhereClause', () => {
  const cases = [
    {
      role: UserRole.admin, 
      department: 'own', // department of current user will be used to create user object.
      id: 'self',
      expected: undefined,
      description: 'admin sees all documents'
    },
    {
      role: UserRole.author,
      department: 'own',
      id: 'self',
      expected: {
        OR: [
          { status: 'published', project: { department: null } },
          { status: 'published', project: { department: 'own' } },
          { status: 'draft', creatorId: 'self' }
        ]
      },
      description: 'author sees published docs (own/null dept) + their own drafts'
    },
    {
      role: UserRole.viewer,
      department: 'own',
      id: 'self',
      expected: {
        OR: [
          { status: 'published', project: { department: null } },
          { status: 'published', project: { department: 'own' } }
        ]
      },
      description: 'viewer only sees published docs (own/null dept)'
    },
    {
      role: UserRole.editor,
      department: 'own',
      id: 'self',
      expected: {
        OR: [
          { status: 'draft', project: { department: 'own' } },
          { status: 'published', project: { department: null } },
          { status: 'published', project: { department: 'own' } }
        ]
      },
      description: 'editor sees drafts in own dept + published docs (own/null dept)'
    }
  ];

  test.each(cases)('$description', ({ role, department, id, expected }) => {
    const user = { role, department, id };
    expect(documentsWhereClause(user)).toEqual(expected);
  });

  test('throws error for unhandled role', () => {
    const user = { 
      role: 'unknown' as UserRole, 
      department: 'own',
      id: 'self'
    };
    expect(() => documentsWhereClause(user)).toThrow('Unhandled user role: unknown');
  });
});