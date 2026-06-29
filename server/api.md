# Branch 1 — API Testing Guide (Postman / Thunder Client)

> Base URL: `http://localhost:3000`

---

## 0. Setup Checklist (run these first)

```bash
# 1. Copy env file
cp .env.example .env

# 2. Start Postgres
docker compose up -d

# 3. Install dependencies
npm install

# 4. Generate Prisma client
npm run prisma:generate

# 5. Push schema to DB and run migrations
npm run prisma:migrate:dev
#    (answer "init" when it asks for a migration name)

# 6. Seed the database
npm run db:seed

# 7. Start the server
npm run start:dev
```

---

## 1. Get All Users (find user IDs)

After seeding, call this to get every user's UUID, role, and department.
**Copy the `id` values — you will paste them into `x-user-id` headers below.**

```
GET /auth/users
```

**No headers needed.** Expected response (8 users):

```json
[
  { "id": "uuid-alice",   "email": "admin.eng@example.com",    "name": "Alice",   "role": "admin",  "department": "Engineering" },
  { "id": "uuid-bob",     "email": "author.eng@example.com",   "name": "Bob",     "role": "author", "department": "Engineering" },
  { "id": "uuid-charlie", "email": "editor.eng@example.com",   "name": "Charlie", "role": "editor", "department": "Engineering" },
  { "id": "uuid-diana",   "email": "viewer.eng@example.com",   "name": "Diana",   "role": "viewer", "department": "Engineering" },
  { "id": "uuid-eve",     "email": "admin.marketing@example.com",  "name": "Eve",   "role": "admin",  "department": "Marketing" },
  { "id": "uuid-frank",   "email": "author.marketing@example.com", "name": "Frank", "role": "author", "department": "Marketing" },
  { "id": "uuid-grace",   "email": "editor.marketing@example.com", "name": "Grace", "role": "editor", "department": "Marketing" },
  { "id": "uuid-henry",   "email": "viewer.marketing@example.com", "name": "Henry", "role": "viewer", "department": "Marketing" }
]
```

---

## 2. Login (simulates setSession)

```
POST /auth/login
Content-Type: application/json

{
  "email": "admin.eng@example.com"
}
```

Response returns `userId` — copy this UUID for all requests below.

```json
{
  "message": "Login successful",
  "userId": "abc-123-...",
  "name": "Alice",
  "role": "admin",
  "department": "Engineering",
  "instruction": "Pass userId as the \"x-user-id\" header in all subsequent requests."
}
```

> **All protected endpoints require:**
> ```
> Header:  x-user-id: <userId from login>
> ```

---

## 3. Projects — Permission Tests

# Branch 1 — API Testing Guide (Postman / Thunder Client)

> Base URL: `http://localhost:3000`

---

## 0. Setup Checklist (run these first)

```bash
# 1. Copy env file
cp .env.example .env

# 2. Start Postgres
docker compose up -d

# 3. Install dependencies
npm install

# 4. Generate Prisma client
npm run prisma:generate

# 5. Push schema to DB and run migrations
npm run prisma:migrate:dev
#    (answer "init" when it asks for a migration name)

# 6. Seed the database
npm run db:seed

# 7. Start the server
npm run start:dev
```

---

## 1. Get All Users (find user IDs)

After seeding, call this to get every user's UUID, role, and department.
**Copy the `id` values — you will paste them into `x-user-id` headers below.**

```
GET /auth/users
```

**No headers needed.** Expected response (8 users):

```json
[
  { "id": "uuid-alice",   "email": "admin.eng@example.com",    "name": "Alice",   "role": "admin",  "department": "Engineering" },
  { "id": "uuid-bob",     "email": "author.eng@example.com",   "name": "Bob",     "role": "author", "department": "Engineering" },
  { "id": "uuid-charlie", "email": "editor.eng@example.com",   "name": "Charlie", "role": "editor", "department": "Engineering" },
  { "id": "uuid-diana",   "email": "viewer.eng@example.com",   "name": "Diana",   "role": "viewer", "department": "Engineering" },
  { "id": "uuid-eve",     "email": "admin.marketing@example.com",  "name": "Eve",   "role": "admin",  "department": "Marketing" },
  { "id": "uuid-frank",   "email": "author.marketing@example.com", "name": "Frank", "role": "author", "department": "Marketing" },
  { "id": "uuid-grace",   "email": "editor.marketing@example.com", "name": "Grace", "role": "editor", "department": "Marketing" },
  { "id": "uuid-henry",   "email": "viewer.marketing@example.com", "name": "Henry", "role": "viewer", "department": "Marketing" }
]
```

---

## 2. Login (simulates setSession)

```
POST /auth/login
Content-Type: application/json

{
  "email": "admin.eng@example.com"
}
```

Response returns `userId` — copy this UUID for all requests below.

```json
{
  "message": "Login successful",
  "userId": "abc-123-...",
  "name": "Alice",
  "role": "admin",
  "department": "Engineering",
  "instruction": "Pass userId as the \"x-user-id\" header in all subsequent requests."
}
```

> **All protected endpoints require:**
> ```
> Header:  x-user-id: <userId from login>
> ```

---

## 3. Projects — Permission Tests

### 3a. GET all projects (role-based filtering)

```
GET /projects
x-user-id: <any-user-id>
```

| User (role / dept)          | Expected result                              |
|-----------------------------|----------------------------------------------|
| Alice (admin / Engineering) | All 5 projects                               |
| Eve (admin / Marketing)     | All 5 projects                               |
| Bob (author / Engineering)  | Engineering projects + Company Wiki (null dept) |
| Frank (author / Marketing)  | Marketing projects + Company Wiki (null dept)   |
| Diana (viewer / Engineering)| Engineering projects + Company Wiki          |
| Henry (viewer / Marketing)  | Marketing projects + Company Wiki            |

### 3b. GET single project — NO permission check (Branch 1 flaw)

```
GET /projects/<any-project-id>
x-user-id: <any-user-id>
```

Any authenticated user can fetch any project by ID — no department filtering.
This is an intentional gap the course will fix in a later branch.

---

### 3c. POST create project — admin only

```
POST /projects
x-user-id: <alice-id>          ← admin ✅ ALLOWED
Content-Type: application/json

{
  "name": "New Project",
  "description": "A test project",
  "department": "Engineering"
}
```

**Expected: 201** with the created project object.

---

Repeat with non-admin users to confirm the 403:

```
POST /projects
x-user-id: <bob-id>            ← author → 403 Forbidden
Content-Type: application/json

{
  "name": "Should Fail",
  "description": "Not allowed",
  "department": "Engineering"
}
```

**Expected:**
```json
{ "statusCode": 403, "error": "Forbidden", "message": "You do not have permission to perform this action" }
```

---

### 3d. PUT update project — admin only

```
PUT /projects/<project-id>
x-user-id: <alice-id>          ← admin ✅ ALLOWED
Content-Type: application/json

{
  "name": "Updated Name"
}
```

Try with `x-user-id: <charlie-id>` (editor) → **403 Forbidden**.

---

### 3e. DELETE project — admin only

```
DELETE /projects/<project-id>
x-user-id: <alice-id>          ← admin ✅ ALLOWED
```

Try with `x-user-id: <bob-id>` (author) → **403 Forbidden**.

---

## 4. Documents — Permission Tests

### 4a. GET project documents (no permission check)

```
GET /projects/<project-id>/documents
x-user-id: <any-user-id>
```

Any authenticated user can list documents. No filtering by role/dept in Branch 1.

---

### 4b. GET single document (no permission check)

```
GET /documents/<document-id>
x-user-id: <any-user-id>
```

---

### 4c. GET document with creator info

```
GET /documents/<document-id>/full
x-user-id: <any-user-id>
```

Returns the document plus nested `creator.name` and `lastEditedBy.name`.

---

### 4d. POST create document — THE INTENTIONAL FLAW ⚠️

**Permission check:** `if (user == null || user.role === 'editor') throw`

| User (role)                  | Expected result           |
|------------------------------|---------------------------|
| Alice / Eve (admin)          | ✅ 201 Created             |
| Bob / Frank (author)         | ✅ 201 Created             |
| **Diana / Henry (viewer)**   | **✅ 201 Created** ← FLAW! |
| Charlie / Grace (editor)     | ❌ 403 Forbidden            |

The viewer role is **not blocked** — this is the deliberate bug the instructor uses to demonstrate incomplete permission checks.

**Test with viewer (should succeed — this is the flaw):**
```
POST /projects/<eng-project-id>/documents
x-user-id: <diana-id>          ← viewer — should NOT be able to create but CAN
Content-Type: application/json

{
  "title": "Viewer Created This",
  "content": "Viewers should not be allowed to create documents.",
  "status": "draft",
  "isLocked": false
}
```

**Expected: 201** (intentional flaw — viewer creates successfully!)

**Test with editor (should fail):**
```
POST /projects/<eng-project-id>/documents
x-user-id: <charlie-id>        ← editor → 403 Forbidden
Content-Type: application/json

{
  "title": "Editor Attempt",
  "content": "This will be blocked.",
  "status": "draft",
  "isLocked": false
}
```

**Expected: 403 Forbidden**

---

### 4e. PUT update document

**Permission check:** `if (user == null || user.role === 'viewer') throw`

| User (role)              | Expected result   |
|--------------------------|-------------------|
| Alice / Eve (admin)      | ✅ 200 OK          |
| Bob / Frank (author)     | ✅ 200 OK          |
| Charlie / Grace (editor) | ✅ 200 OK          |
| Diana / Henry (viewer)   | ❌ 403 Forbidden   |

```
PUT /documents/<document-id>
x-user-id: <charlie-id>        ← editor ✅ ALLOWED
Content-Type: application/json

{
  "title": "Updated by Editor",
  "content": "New content here.",
  "status": "published",
  "isLocked": false
}
```

Try with `x-user-id: <diana-id>` (viewer) → **403 Forbidden**.

---

### 4f. DELETE document — admin only

```
DELETE /documents/<document-id>
x-user-id: <alice-id>          ← admin ✅ ALLOWED
```

| User (role)              | Expected result   |
|--------------------------|-------------------|
| Alice / Eve (admin)      | ✅ 200 OK          |
| Bob / Frank (author)     | ❌ 403 Forbidden   |
| Charlie / Grace (editor) | ❌ 403 Forbidden   |
| Diana / Henry (viewer)   | ❌ 403 Forbidden   |

---

## 5. Auth Error Tests

### Missing x-user-id header → 401

```
GET /projects
(no headers)
```

```json
{
  "statusCode": 401,
  "message": "Missing x-user-id header. Call POST /auth/login first to get your userId.",
  "error": "Unauthorized"
}
```

### Invalid userId → 401

```
GET /projects
x-user-id: not-a-real-uuid
```

```json
{
  "statusCode": 401,
  "message": "No user found with id \"not-a-real-uuid\".",
  "error": "Unauthorized"
}
```

---

## 6. Validation Error Tests

### Invalid email on login → 400

```
POST /auth/login
Content-Type: application/json

{ "email": "not-an-email" }
```

```json
{
  "statusCode": 400,
  "message": ["Please enter a valid email address"],
  "error": "Bad Request"
}
```

### Invalid document status → 400

```
POST /projects/<id>/documents
x-user-id: <admin-id>
Content-Type: application/json

{
  "title": "Test",
  "content": "Content",
  "status": "invalid-status",
  "isLocked": false
}
```

```json
{
  "statusCode": 400,
  "message": ["status must be one of: draft, publis# Branch 1 — API Testing Guide (Postman / Thunder Client)

> Base URL: `http://localhost:3000`

---

## 0. Setup Checklist (run these first)

```bash
# 1. Copy env file
cp .env.example .env

# 2. Start Postgres
docker compose up -d

# 3. Install dependencies
npm install

# 4. Generate Prisma client
npm run prisma:generate

# 5. Push schema to DB and run migrations
npm run prisma:migrate:dev
#    (answer "init" when it asks for a migration name)

# 6. Seed the database
npm run db:seed

# 7. Start the server
npm run start:dev
```

---

## 1. Get All Users (find user IDs)

After seeding, call this to get every user's UUID, role, and department.
**Copy the `id` values — you will paste them into `x-user-id` headers below.**

```
GET /auth/users
```

**No headers needed.** Expected response (8 users):

```json
[
  { "id": "uuid-alice",   "email": "admin.eng@example.com",    "name": "Alice",   "role": "admin",  "department": "Engineering" },
  { "id": "uuid-bob",     "email": "author.eng@example.com",   "name": "Bob",     "role": "author", "department": "Engineering" },
  { "id": "uuid-charlie", "email": "editor.eng@example.com",   "name": "Charlie", "role": "editor", "department": "Engineering" },
  { "id": "uuid-diana",   "email": "viewer.eng@example.com",   "name": "Diana",   "role": "viewer", "department": "Engineering" },
  { "id": "uuid-eve",     "email": "admin.marketing@example.com",  "name": "Eve",   "role": "admin",  "department": "Marketing" },
  { "id": "uuid-frank",   "email": "author.marketing@example.com", "name": "Frank", "role": "author", "department": "Marketing" },
  { "id": "uuid-grace",   "email": "editor.marketing@example.com", "name": "Grace", "role": "editor", "department": "Marketing" },
  { "id": "uuid-henry",   "email": "viewer.marketing@example.com", "name": "Henry", "role": "viewer", "department": "Marketing" }
]
```

---

## 2. Login (simulates setSession)

```
POST /auth/login
Content-Type: application/json

{
  "email": "admin.eng@example.com"
}
```

Response returns `userId` — copy this UUID for all requests below.

```json
{
  "message": "Login successful",
  "userId": "abc-123-...",
  "name": "Alice",
  "role": "admin",
  "department": "Engineering",
  "instruction": "Pass userId as the \"x-user-id\" header in all subsequent requests."
}
```

> **All protected endpoints require:**
> ```
> Header:  x-user-id: <userId from login>
> ```

---

## 3. Projects — Permission Tests

### 3a. GET all projects (role-based filtering)

```
GET /projects
x-user-id: <any-user-id>
```

| User (role / dept)          | Expected result                              |
|-----------------------------|----------------------------------------------|
| Alice (admin / Engineering) | All 5 projects                               |
| Eve (admin / Marketing)     | All 5 projects                               |
| Bob (author / Engineering)  | Engineering projects + Company Wiki (null dept) |
| Frank (author / Marketing)  | Marketing projects + Company Wiki (null dept)   |
| Diana (viewer / Engineering)| Engineering projects + Company Wiki          |
| Henry (viewer / Marketing)  | Marketing projects + Company Wiki            |

### 3b. GET single project — NO permission check (Branch 1 flaw)

```
GET /projects/<any-project-id>
x-user-id: <any-user-id>
```

Any authenticated user can fetch any project by ID — no department filtering.
This is an intentional gap the course will fix in a later branch.

---

### 3c. POST create project — admin only

```
POST /projects
x-user-id: <alice-id>          ← admin ✅ ALLOWED
Content-Type: application/json

{
  "name": "New Project",
  "description": "A test project",
  "department": "Engineering"
}
```

**Expected: 201** with the created project object.

---

Repeat with non-admin users to confirm the 403:

```
POST /projects
x-user-id: <bob-id>            ← author → 403 Forbidden
Content-Type: application/json

{
  "name": "Should Fail",
  "description": "Not allowed",
  "department": "Engineering"
}
```

**Expected:**
```json
{ "statusCode": 403, "error": "Forbidden", "message": "You do not have permission to perform this action" }
```

---

### 3d. PUT update project — admin only

```
PUT /projects/<project-id>
x-user-id: <alice-id>          ← admin ✅ ALLOWED
Content-Type: application/json

{
  "name": "Updated Name"
}
```

Try with `x-user-id: <charlie-id>` (editor) → **403 Forbidden**.

---

### 3e. DELETE project — admin only

```
DELETE /projects/<project-id>
x-user-id: <alice-id>          ← admin ✅ ALLOWED
```

Try with `x-user-id: <bob-id>` (author) → **403 Forbidden**.

---

## 4. Documents — Permission Tests

### 4a. GET project documents (no permission check)

```
GET /projects/<project-id>/documents
x-user-id: <any-user-id>
```

Any authenticated user can list documents. No filtering by role/dept in Branch 1.

---

### 4b. GET single document (no permission check)

```
GET /documents/<document-id>
x-user-id: <any-user-id>
```

---

### 4c. GET document with creator info

```
GET /documents/<document-id>/full
x-user-id: <any-user-id>
```

Returns the document plus nested `creator.name` and `lastEditedBy.name`.

---

### 4d. POST create document — THE INTENTIONAL FLAW ⚠️

**Permission check:** `if (user == null || user.role === 'editor') throw`

| User (role)                  | Expected result           |
|------------------------------|---------------------------|
| Alice / Eve (admin)          | ✅ 201 Created             |
| Bob / Frank (author)         | ✅ 201 Created             |
| **Diana / Henry (viewer)**   | **✅ 201 Created** ← FLAW! |
| Charlie / Grace (editor)     | ❌ 403 Forbidden            |

The viewer role is **not blocked** — this is the deliberate bug the instructor uses to demonstrate incomplete permission checks.

**Test with viewer (should succeed — this is the flaw):**
```
POST /projects/<eng-project-id>/documents
x-user-id: <diana-id>          ← viewer — should NOT be able to create but CAN
Content-Type: application/json

{
  "title": "Viewer Created This",
  "content": "Viewers should not be allowed to create documents.",
  "status": "draft",
  "isLocked": false
}
```

**Expected: 201** (intentional flaw — viewer creates successfully!)

**Test with editor (should fail):**
```
POST /projects/<eng-project-id>/documents
x-user-id: <charlie-id>        ← editor → 403 Forbidden
Content-Type: application/json

{
  "title": "Editor Attempt",
  "content": "This will be blocked.",
  "status": "draft",
  "isLocked": false
}
```

**Expected: 403 Forbidden**

---

### 4e. PUT update document

**Permission check:** `if (user == null || user.role === 'viewer') throw`

| User (role)              | Expected result   |
|--------------------------|-------------------|
| Alice / Eve (admin)      | ✅ 200 OK          |
| Bob / Frank (author)     | ✅ 200 OK          |
| Charlie / Grace (editor) | ✅ 200 OK          |
| Diana / Henry (viewer)   | ❌ 403 Forbidden   |

```
PUT /documents/<document-id>
x-user-id: <charlie-id>        ← editor ✅ ALLOWED
Content-Type: application/json

{
  "title": "Updated by Editor",
  "content": "New content here.",
  "status": "published",
  "isLocked": false
}
```

Try with `x-user-id: <diana-id>` (viewer) → **403 Forbidden**.

---

### 4f. DELETE document — admin only

```
DELETE /documents/<document-id>
x-user-id: <alice-id>          ← admin ✅ ALLOWED
```

| User (role)              | Expected result   |
|--------------------------|-------------------|
| Alice / Eve (admin)      | ✅ 200 OK          |
| Bob / Frank (author)     | ❌ 403 Forbidden   |
| Charlie / Grace (editor) | ❌ 403 Forbidden   |
| Diana / Henry (viewer)   | ❌ 403 Forbidden   |

---

## 5. Auth Error Tests

### Missing x-user-id header → 401

```
GET /projects
(no headers)
```

```json
{
  "statusCode": 401,
  "message": "Missing x-user-id header. Call POST /auth/login first to get your userId.",
  "error": "Unauthorized"
}
```

### Invalid userId → 401

```
GET /projects
x-user-id: not-a-real-uuid
```

```json
{
  "statusCode": 401,
  "message": "No user found with id \"not-a-real-uuid\".",
  "error": "Unauthorized"
}
```

---

## 6. Validation Error Tests

### Invalid email on login → 400

```
POST /auth/login
Content-Type: application/json

{ "email": "not-an-email" }
```

```json
{
  "statusCode": 400,
  "message": ["Please enter a valid email address"],
  "error": "Bad Request"
}
```

### Invalid document status → 400

```
POST /projects/<id>/documents
x-user-id: <admin-id>
Content-Type: application/json

{
  "title": "Test",
  "content": "Content",
  "status": "invalid-status",
  "isLocked": false
}
```

```json
{
  "statusCode": 400,
  "message": ["status must be one of: draft, published, archived"],
  "error": "Bad Request"
}
```

---

## 7. Quick Branch 1 Permission Summary

| Operation            | viewer | editor | author | admin |
|----------------------|--------|--------|--------|-------|
| List projects        | ✅ (dept-filtered) | ✅ | ✅ | ✅ (all) |
| Get project by ID    | ✅     | ✅     | ✅     | ✅    |
| Create project       | ❌     | ❌     | ❌     | ✅    |
| Update project       | ❌     | ❌     | ❌     | ✅    |
| Delete project       | ❌     | ❌     | ❌     | ✅    |
| List documents       | ✅     | ✅     | ✅     | ✅    |
| Get document         | ✅     | ✅     | ✅     | ✅    |
| Create document      | ✅ ⚠️ | ❌     | ✅     | ✅    |
| Update document      | ❌     | ✅     | ✅     | ✅    |
| Delete document      | ❌     | ❌     | ❌     | ✅    |

> ⚠️ = viewer CAN create documents — intentional Branch 1 flaw to discover in next branch.hed, archived"],
  "error": "Bad Request"
}
```

---

## 7. Quick Branch 1 Permission Summary

| Operation            | viewer | editor | author | admin |
|----------------------|--------|--------|--------|-------|
| List projects        | ✅ (dept-filtered) | ✅ | ✅ | ✅ (all) |
| Get project by ID    | ✅     | ✅     | ✅     | ✅    |
| Create project       | ❌     | ❌     | ❌     | ✅    |
| Update project       | ❌     | ❌     | ❌     | ✅    |
| Delete project       | ❌     | ❌     | ❌     | ✅    |
| List documents       | ✅     | ✅     | ✅     | ✅    |
| Get document         | ✅     | ✅     | ✅     | ✅    |
| Create document      | ✅ ⚠️ | ❌     | ✅     | ✅    |
| Update document      | ❌     | ✅     | ✅     | ✅    |
| Delete document      | ❌     | ❌     | ❌     | ✅    |

> ⚠️ = viewer CAN create documents — intentional Branch 1 flaw to discover in next branch.### 3a. GET all projects (role-based filtering)

```
GET /projects
x-user-id: <any-user-id>
```

| User (role / dept)          | Expected result                              |
|-----------------------------|----------------------------------------------|
| Alice (admin / Engineering) | All 5 projects                               |
| Eve (admin / Marketing)     | All 5 projects                               |
| Bob (author / Engineering)  | Engineering projects + Company Wiki (null dept) |
| Frank (author / Marketing)  | Marketing projects + Company Wiki (null dept)   |
| Diana (viewer / Engineering)| Engineering projects + Company Wiki          |
| Henry (viewer / Marketing)  | Marketing projects + Company Wiki            |

### 3b. GET single project — NO permission check (Branch 1 flaw)

```
GET /projects/<any-project-id>
x-user-id: <any-user-id>
```

Any authenticated user can fetch any project by ID — no department filtering.
This is an intentional gap the course will fix in a later branch.

---

### 3c. POST create project — admin only

```
POST /projects
x-user-id: <alice-id>          ← admin ✅ ALLOWED
Content-Type: application/json

{
  "name": "New Project",
  "description": "A test project",
  "department": "Engineering"
}
```

**Expected: 201** with the created project object.

---

Repeat with non-admin users to confirm the 403:

```
POST /projects
x-user-id: <bob-id>            ← author → 403 Forbidden
Content-Type: application/json

{
  "name": "Should Fail",
  "description": "Not allowed",
  "department": "Engineering"
}
```

**Expected:**
```json
{ "statusCode": 403, "error": "Forbidden", "message": "You do not have permission to perform this action" }
```

---

### 3d. PUT update project — admin only

```
PUT /projects/<project-id>
x-user-id: <alice-id>          ← admin ✅ ALLOWED
Content-Type: application/json

{
  "name": "Updated Name"
}
```

Try with `x-user-id: <charlie-id>` (editor) → **403 Forbidden**.

---

### 3e. DELETE project — admin only

```
DELETE /projects/<project-id>
x-user-id: <alice-id>          ← admin ✅ ALLOWED
```

Try with `x-user-id: <bob-id>` (author) → **403 Forbidden**.

---

## 4. Documents — Permission Tests

### 4a. GET project documents (no permission check)

```
GET /projects/<project-id>/documents
x-user-id: <any-user-id>
```

Any authenticated user can list documents. No filtering by role/dept in Branch 1.

---

### 4b. GET single document (no permission check)

```
GET /documents/<document-id>
x-user-id: <any-user-id>
```

---

### 4c. GET document with creator info

```
GET /documents/<document-id>/full
x-user-id: <any-user-id>
```

Returns the document plus nested `creator.name` and `lastEditedBy.name`.

---

### 4d. POST create document — THE INTENTIONAL FLAW ⚠️

**Permission check:** `if (user == null || user.role === 'editor') throw`

| User (role)                  | Expected result           |
|------------------------------|---------------------------|
| Alice / Eve (admin)          | ✅ 201 Created             |
| Bob / Frank (author)         | ✅ 201 Created             |
| **Diana / Henry (viewer)**   | **✅ 201 Created** ← FLAW! |
| Charlie / Grace (editor)     | ❌ 403 Forbidden            |

The viewer role is **not blocked** — this is the deliberate bug the instructor uses to demonstrate incomplete permission checks.

**Test with viewer (should succeed — this is the flaw):**
```
POST /projects/<eng-project-id>/documents
x-user-id: <diana-id>          ← viewer — should NOT be able to create but CAN
Content-Type: application/json

{
  "title": "Viewer Created This",
  "content": "Viewers should not be allowed to create documents.",
  "status": "draft",
  "isLocked": false
}
```

**Expected: 201** (intentional flaw — viewer creates successfully!)

**Test with editor (should fail):**
```
POST /projects/<eng-project-id>/documents
x-user-id: <charlie-id>        ← editor → 403 Forbidden
Content-Type: application/json

{
  "title": "Editor Attempt",
  "content": "This will be blocked.",
  "status": "draft",
  "isLocked": false
}
```

**Expected: 403 Forbidden**

---

### 4e. PUT update document

**Permission check:** `if (user == null || user.role === 'viewer') throw`

| User (role)              | Expected result   |
|--------------------------|-------------------|
| Alice / Eve (admin)      | ✅ 200 OK          |
| Bob / Frank (author)     | ✅ 200 OK          |
| Charlie / Grace (editor) | ✅ 200 OK          |
| Diana / Henry (viewer)   | ❌ 403 Forbidden   |

```
PUT /documents/<document-id>
x-user-id: <charlie-id>        ← editor ✅ ALLOWED
Content-Type: application/json

{
  "title": "Updated by Editor",
  "content": "New content here.",
  "status": "published",
  "isLocked": false
}
```

Try with `x-user-id: <diana-id>` (viewer) → **403 Forbidden**.

---

### 4f. DELETE document — admin only

```
DELETE /documents/<document-id>
x-user-id: <alice-id>          ← admin ✅ ALLOWED
```

| User (role)              | Expected result   |
|--------------------------|-------------------|
| Alice / Eve (admin)      | ✅ 200 OK          |
| Bob / Frank (author)     | ❌ 403 Forbidden   |
| Charlie / Grace (editor) | ❌ 403 Forbidden   |
| Diana / Henry (viewer)   | ❌ 403 Forbidden   |

---

## 5. Auth Error Tests

### Missing x-user-id header → 401

```
GET /projects
(no headers)
```

```json
{
  "statusCode": 401,
  "message": "Missing x-user-id header. Call POST /auth/login first to get your userId.",
  "error": "Unauthorized"
}
```

### Invalid userId → 401

```
GET /projects
x-user-id: not-a-real-uuid
```

```json
{
  "statusCode": 401,
  "message": "No user found with id \"not-a-real-uuid\".",
  "error": "Unauthorized"
}
```

---

## 6. Validation Error Tests

### Invalid email on login → 400

```
POST /auth/login
Content-Type: application/json

{ "email": "not-an-email" }
```

```json
{
  "statusCode": 400,
  "message": ["Please enter a valid email address"],
  "error": "Bad Request"
}
```

### Invalid document status → 400

```
POST /projects/<id>/documents
x-user-id: <admin-id>
Content-Type: application/json

{
  "title": "Test",
  "content": "Content",
  "status": "invalid-status",
  "isLocked": false
}
```

```json
{
  "statusCode": 400,
  "message": ["status must be one of: draft, published, archived"],
  "error": "Bad Request"
}
```

---

## 7. Quick Branch 1 Permission Summary

| Operation            | viewer | editor | author | admin |
|----------------------|--------|--------|--------|-------|
| List projects        | ✅ (dept-filtered) | ✅ | ✅ | ✅ (all) |
| Get project by ID    | ✅     | ✅     | ✅     | ✅    |
| Create project       | ❌     | ❌     | ❌     | ✅    |
| Update project       | ❌     | ❌     | ❌     | ✅    |
| Delete project       | ❌     | ❌     | ❌     | ✅    |
| List documents       | ✅     | ✅     | ✅     | ✅    |
| Get document         | ✅     | ✅     | ✅     | ✅    |
| Create document      | ✅ ⚠️ | ❌     | ✅     | ✅    |
| Update document      | ❌     | ✅     | ✅     | ✅    |
| Delete document      | ❌     | ❌     | ❌     | ✅    |

> ⚠️ = viewer CAN create documents — intentional Branch 1 flaw to discover in next branch.