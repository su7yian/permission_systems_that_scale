/**
 * prisma/seed.ts
 * Exact conversion of src/drizzle/seed.ts.
 * Run with:  npm run db:seed   OR   npx prisma db seed
 */
import "dotenv/config";

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole, DocumentStatus } from '../src/generated/prisma/client';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL})
})
async function seed() {
  console.log(process.env.DATABASE_URL);
  console.log('🌱 Seeding database...');

  // ── Clear existing data (reverse dependency order) ─────────────────────
  await prisma.document.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Cleared existing data');

  // ── Create users across different roles and departments ─────────────────
  const usersData = [
    // Engineering Department
    { email: 'admin.eng@example.com',    name: 'Alice',   role: UserRole.admin,  department: 'Engineering' },
    { email: 'author.eng@example.com',   name: 'Bob',     role: UserRole.author, department: 'Engineering' },
    { email: 'editor.eng@example.com',   name: 'Charlie', role: UserRole.editor, department: 'Engineering' },
    { email: 'viewer.eng@example.com',   name: 'Diana',   role: UserRole.viewer, department: 'Engineering' },
    // Marketing Department
    { email: 'admin.marketing@example.com',  name: 'Eve',   role: UserRole.admin,  department: 'Marketing' },
    { email: 'author.marketing@example.com', name: 'Frank', role: UserRole.author, department: 'Marketing' },
    { email: 'editor.marketing@example.com', name: 'Grace', role: UserRole.editor, department: 'Marketing' },
    { email: 'viewer.marketing@example.com', name: 'Henry', role: UserRole.viewer, department: 'Marketing' },
  ];

  const users: { id: string; email: string }[] = [];
  for (const data of usersData) {
    const user = await prisma.user.create({ data });
    users.push(user);
  }
  console.log(`✓ Created ${users.length} users across 2 departments`);

  const getUser = (email: string) => {
    const u = users.find(u => u.email === email);
    if (!u) throw new Error(`User not found: ${email}`);
    return u;
  };

  // ── Create project─────────────────────────────────────────────────────
  const projectsData = [
    // Engineering Projects
    {
      name: 'API Documentation',
      description: 'Technical documentation for our REST API',
      ownerId: getUser('admin.eng@example.com').id,
      department: 'Engineering',
    },
    {
      name: 'System Architecture',
      description: 'High-level system design documents',
      ownerId: getUser('admin.eng@example.com').id,
      department: 'Engineering',
    },
    // Marketing Projects
    {
      name: 'Brand Guidelines',
      description: 'Company branding and style guide',
      ownerId: getUser('admin.marketing@example.com').id,
      department: 'Marketing',
    },
    {
      name: 'Campaign Plans',
      description: 'Marketing campaign strategies and plans',
      ownerId: getUser('admin.marketing@example.com').id,
      department: 'Marketing',
    },
    // Cross-department Project
    {
      name: 'Company Wiki',
      description: 'General knowledge base for all departments',
      ownerId: getUser('admin.eng@example.com').id,
      department: null, // null = cross-department
    },
  ];

  const projects: { id: string; name: string }[] = [];
  for (const data of projectsData) {
    const project = await prisma.project.create({ data });
    projects.push(project);
  }
  console.log(`✓ Created ${projects.length} projects`);

  const getProject = (name: string) => {
    const p = projects.find(p => p.name === name);
    if (!p) throw new Error(`Project not found: ${name}`);
    return p;
  };

  // ── Create documents ────────────────────────────────────────────────────
  const documentsData = [
    // API Documentation Project
    {
      title: 'Getting Started Guide',
      content: 'Getting Started\n\nWelcome to our API...',
      status: DocumentStatus.published,
      isLocked: false,
      projectId: getProject('API Documentation').id,
      creatorId: getUser('author.eng@example.com').id,
      lastEditedById: getUser('editor.eng@example.com').id,
    },
    {
      title: 'Authentication Flow',
      content: 'Authentication\n\nWork in progress...',
      status: DocumentStatus.draft,
      isLocked: false,
      projectId: getProject('API Documentation').id,
      creatorId: getUser('author.eng@example.com').id,
      lastEditedById: getUser('author.eng@example.com').id,
    },
    {
      title: 'API v1 Reference',
      content: 'API v1\n\nDeprecated - use v2 instead',
      status: DocumentStatus.archived,
      isLocked: true,
      projectId: getProject('API Documentation').id,
      creatorId: getUser('admin.eng@example.com').id,
      lastEditedById: getUser('admin.eng@example.com').id,
    },
    {
      title: 'API v2 Reference',
      content: 'API v2\n\nList of all API endpoints...',
      status: DocumentStatus.published,
      isLocked: true, // Published but locked for editing
      projectId: getProject('API Documentation').id,
      creatorId: getUser('admin.eng@example.com').id,
      lastEditedById: getUser('editor.eng@example.com').id,
    },
    // System Architecture Project
    {
      title: 'Database Schema Design',
      content: 'Database Design\n\nOur PostgreSQL schema...',
      status: DocumentStatus.draft,
      isLocked: false,
      projectId: getProject('System Architecture').id,
      creatorId: getUser('author.eng@example.com').id,
      lastEditedById: getUser('author.eng@example.com').id,
    },
    {
      title: 'Microservices Overview',
      content: 'Microservices\n\nOur service architecture...',
      status: DocumentStatus.published,
      isLocked: false,
      projectId: getProject('System Architecture').id,
      creatorId: getUser('author.eng@example.com').id,
      lastEditedById: getUser('author.eng@example.com').id,
    },
    // Brand Guidelines Project
    {
      title: 'Logo Usage',
      content: 'Logo Guidelines\n\nHow to use our logo...',
      status: DocumentStatus.published,
      isLocked: false,
      projectId: getProject('Brand Guidelines').id,
      creatorId: getUser('author.marketing@example.com').id,
      lastEditedById: getUser('editor.marketing@example.com').id,
    },
    {
      title: 'Color Palette',
      content: 'Colors\n\nPrimary: #FF6B6B...',
      status: DocumentStatus.published,
      isLocked: true,
      projectId: getProject('Brand Guidelines').id,
      creatorId: getUser('admin.marketing@example.com').id,
      lastEditedById: getUser('admin.marketing@example.com').id,
    },
    {
      title: 'Typography Guide',
      content: 'Typography\n\nFonts and text styles...',
      status: DocumentStatus.draft,
      isLocked: false,
      projectId: getProject('Brand Guidelines').id,
      creatorId: getUser('author.marketing@example.com').id,
      lastEditedById: getUser('author.marketing@example.com').id,
    },
    // Campaign Plans Project
    {
      title: 'Q1 2026 Campaign',
      content: 'Q1 Campaign\n\nGoals and strategies...',
      status: DocumentStatus.published,
      isLocked: false,
      projectId: getProject('Campaign Plans').id,
      creatorId: getUser('author.marketing@example.com').id,
      lastEditedById: getUser('editor.marketing@example.com').id,
    },
    {
      title: 'Q4 2025 Retrospective',
      content: 'Q4 Results\n\nWhat went well...',
      status: DocumentStatus.archived,
      isLocked: false,
      projectId: getProject('Campaign Plans').id,
      creatorId: getUser('admin.marketing@example.com').id,
      lastEditedById: getUser('admin.marketing@example.com').id,
    },
    {
      title: 'Social Media Strategy',
      content: 'Social Media\n\nPlatform-specific tactics...',
      status: DocumentStatus.published,
      isLocked: false,
      projectId: getProject('Campaign Plans').id,
      creatorId: getUser('author.marketing@example.com').id,
      lastEditedById: getUser('editor.marketing@example.com').id,
    },
    {
      title: 'Email Campaign Templates',
      content: 'Email Templates\n\nReusable email designs...',
      status: DocumentStatus.draft,
      isLocked: false,
      projectId: getProject('Campaign Plans').id,
      creatorId: getUser('author.marketing@example.com').id,
      lastEditedById: getUser('author.marketing@example.com').id,
    },
    // Company Wiki — Cross-department
    {
      title: 'Company History',
      content: 'Our Story\n\nFounded in 2020...',
      status: DocumentStatus.draft,
      isLocked: false,
      projectId: getProject('Company Wiki').id,
      creatorId: getUser('admin.eng@example.com').id,
      lastEditedById: getUser('admin.eng@example.com').id,
    },
    {
      title: 'Office Locations',
      content: 'Offices\n\nSan Francisco, New York, London...',
      status: DocumentStatus.published,
      isLocked: false,
      projectId: getProject('Company Wiki').id,
      creatorId: getUser('author.marketing@example.com').id,
      lastEditedById: getUser('editor.marketing@example.com').id,
    },
    {
      title: 'Team Directory',
      content: "Directory\n\nWho's who in the company...",
      status: DocumentStatus.draft,
      isLocked: false,
      projectId: getProject('Company Wiki').id,
      creatorId: getUser('author.eng@example.com').id,
      lastEditedById: getUser('author.eng@example.com').id,
    },
    {
      title: 'FAQ',
      content: 'FAQ\n\nOld frequently asked questions...',
      status: DocumentStatus.archived,
      isLocked: true,
      projectId: getProject('Company Wiki').id,
      creatorId: getUser('admin.marketing@example.com').id,
      lastEditedById: getUser('admin.marketing@example.com').id,
    },
  ];

  const documents: { id: string }[] = [];
  for (const data of documentsData) {
    const doc = await prisma.document.create({ data });
    documents.push(doc);
  }
  console.log(`✓ Created ${documents.length} documents`);

  console.log('\n📊 Seed Summary:');
  console.log(`   - Users:     ${users.length}`);
  console.log(`   - Projects:  ${projects.length}`);
  console.log(`   - Documents: ${documents.length}`);
  console.log('\n✅ Database seeded successfully!');
}

seed()
  .catch(error => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });