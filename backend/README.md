# ForgeFlow Backend API 🚀

This is the Express & Node.js backend server for ForgeFlow, powering form building, folder organization, submissions tracking, AI generation, and administrative dashboard controls.

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend` directory with the following keys:

```env
PORT=3001
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
JWT_SECRET="your-super-secure-jwt-secret-key"
```

* **`DATABASE_URL`**: Connection string to your PostgreSQL instance (e.g. Neon, AWS RDS, or Local).
* **`JWT_SECRET`**: Signature secret for encoding and verifying auth sessions.
* **`ADMIN_EMAIL` / `ADMIN_PASSWORD`**: Core credentials matching the exclusive platform administrator account.

---

## 📦 Database Management

We use **Prisma ORM** for database mapping.

### Push Schema Changes:
Pushes your schema changes directly to the PostgreSQL database:
```bash
pnpm exec prisma db push
```

### Seeding:
Populates the database tables with mock creators, forms, and responses:
```bash
pnpm run db:seed
```

---

## 📡 REST API Reference

All requests must be prefixed with `/api`. Protected routes require the `Authorization: Bearer <JWT_TOKEN>` header.

### 🔐 Authentication (`/api/auth`)

* **`POST /register`**:
  - Registers a new user.
  - Body: `{ email, password, name }`
  - *Rate-limited to 10 requests per minute.*
* **`POST /login`**:
  - Authenticates credentials.
  - Intercepts if the user matches `.env` admin credentials and issues an admin session.
  - Body: `{ email, password }`
  - *Rate-limited to 10 requests per minute.*
* **`GET /me`**:
  - Returns authenticated user payload (includes role and `isAdmin` flag).
  - *Requires authentication.*
* **`PUT /update`**:
  - Modifies profile settings (email, password).
  - *Requires authentication.*

---

### 📝 Forms Management (`/api/forms`)

* **`POST /`**:
  - Creates a new form structure.
  - Body: `{ title, description, schema, settings, folderId }`
  - *Requires authentication.*
* **`GET /`**:
  - Lists forms owned by the creator.
  - Query params: `folderId`, `isArchived`, `search`.
  - *Requires authentication.*
* **`GET /:id`**:
  - Retrieves a specific form structure details.
  - *Requires authentication.*
* **`GET /public/:id`**:
  - Public viewport retrieval of live form structure for filling.
  - *Allows optional authentication.*
* **`PUT /:id`**:
  - Updates title, description, schema, settings, or archive status. Saves a version trace in the background.
  - *Requires authentication.*
* **`POST /:id/duplicate`**:
  - Clones the target form layout.
  - *Requires authentication.*
* **`DELETE /:id`**:
  - Deletes the form and its response history.
  - *Requires authentication.*
* **`GET /:id/versions`**:
  - Lists version logs and rollback checkpoints.
  - *Requires authentication.*
* **`POST /:id/versions/:versionId/rollback`**:
  - Rolls back the active schema structure to the target version state.
  - *Requires authentication.*
* **`GET /:formId/export-csv`**:
  - Directly downloads form submissions as a formatted CSV file.
  - Auth token is passable via query parameter `?token=...` or standard Bearer header.

---

### 📁 Folders Management (`/api/folders`)

* **`POST /`**:
  - Creates a folder for form grouping.
  - Body: `{ name }`
  - *Requires authentication.*
* **`GET /`**:
  - Lists folders owned by the creator.
  - *Requires authentication.*
* **`DELETE /:id`**:
  - Deletes the folder container (does not delete forms inside, sets folderId to null).
  - *Requires authentication.*

---

### 📥 Submissions & Analytics (`/api/submissions`)

* **`POST /submit/:formId`**:
  - Submits responses to a public form.
  - Body: `{ data }` (key-value dictionary mapping field IDs to values).
  - *No authentication required.*
* **`GET /:formId`**:
  - Retrieves submission records list for the form.
  - *Requires authentication.*
* **`GET /:formId/analytics`**:
  - Generates form analytics (views, conversion rates, response breakdown, question analysis).
  - *Requires authentication.*

---

### 🤖 AI Utilities (`/api/ai`)

* **`POST /generate-form`**:
  - Generates form fields using Gemini based on a text prompt.
  - Body: `{ prompt }`
  - *Requires authentication.*
* **`POST /generate-theme`**:
  - Generates styling colors/properties using Gemini based on a text prompt.
  - Body: `{ prompt }`
  - *Requires authentication.*
* **`POST /analyze-submissions`**:
  - Performs intelligent sentiment and feedback analysis on submissions using Gemini.
  - Body: `{ formId }`
  - *Requires authentication.*

---

### 🛡️ Admin Controls (`/api/admin`)

* **`GET /stats`**:
  - Fetches platform statistics (total users, forms, submissions, conversion rates, submission velocity chart data, database/gemini health checks, user list).
  - *Requires Admin role.*
* **`DELETE /users/:userId`**:
  - Deletes a user profile and all associated forms/submissions.
  - *Requires Admin role.*
