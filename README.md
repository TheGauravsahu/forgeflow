# ForgeFlow 🚀

ForgeFlow is a modern, developer-friendly, and open-source **Form Builder & Real-time Analytics Dashboard**. It allows users to build dynamic forms, organize them into folders, save schema versions, submit responses securely, and analyze responses in real-time.

---

## ✨ Features

- 🛠️ **Dynamic Form Builder**: Drag-and-drop or select form fields including Text, Number, Email, Password, Textarea, Select, Checkbox, Date, and more.
- 📁 **Folder Management**: Group and organize forms into custom folders.
- 📜 **Schema Versioning**: Automatically tracks version history for form changes.
- 📊 **Real-time Analytics**: Interactive dashboard displaying total submissions, average responses per day, completion rate, and timeline trends.
- 📥 **CSV Export**: Direct, authenticated download of submission data in clean CSV format.
- 🔐 **Secure Auth**: Built-in authentication (Register, Login, JWT verification).
- 🔌 **Fully Typed API (tRPC)**: Type-safe client-server communication using tRPC.
- 📄 **OpenAPI Spec & Interactive Docs**: Fully interactive API documentation powered by `trpc-openapi` and Scalar API reference.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: TailwindCSS & shadcn/ui components
- **Routing**: React Router DOM
- **State Management & Fetching**: tRPC React Client & TanStack Query (React Query)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express & TypeScript
- **Database ORM**: Prisma Client
- **Database**: PostgreSQL (compatible with Neon PostgreSQL, AWS RDS, Local, etc.)
- **API Protocol**: tRPC & OpenAPI REST wrapper via `trpc-openapi`
- **Security**: JWT & bcryptjs for password hashing
- **Interactive Documentation**: Scalar API Reference (available at `/docs`)

---

## 📁 Project Structure

```text
forgeflow/
├── backend/          # Express + Node + tRPC API & Prisma DB config
│   ├── src/          # Source files (routers, auth, database, etc.)
│   ├── prisma/       # Database Schema & Migrations
│   └── package.json  # Backend dependencies and scripts
└── frontend/         # React + Vite + Tailwind CSS Application
    ├── src/          # React components, pages, hooks, state, etc.
    └── package.json  # Frontend dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- `pnpm` (preferred) or `npm` or `yarn`
- A PostgreSQL database instance (local or hosted e.g. on [Neon](https://neon.tech))

---

### 1. Backend Setup

Navigate to the `backend` folder:
```bash
cd backend
```

#### Install dependencies:
```bash
pnpm install
# or
npm install
```

#### Environment Variables:
Create a `.env` file in the `backend` directory and configure the following variables:
```env
PORT=3001
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
JWT_SECRET="your-super-secure-jwt-secret-key"
```

#### Setup Database Schemas and Push:
Apply the database schema directly to your PostgreSQL instance using Prisma:
```bash
pnpm run db:push
# or
npx prisma db push
```

#### (Optional) Seed the Database:
To populate the database with mock test data (e.g., users, forms, submissions):
```bash
pnpm run db:seed
# or
npx ts-node src/seed.ts
```

#### Start Backend Dev Server:
```bash
pnpm run dev
# or
npm run dev
```
The backend server will run on `http://localhost:3001`.

---

### 2. Frontend Setup

Navigate to the `frontend` folder:
```bash
cd ../frontend
```

#### Install dependencies:
```bash
pnpm install
# or
npm install
```

#### (Optional) Environment Variables:
If you need to configure the backend API endpoint (defaults to `http://localhost:3001` if not provided):
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL="http://localhost:3001/trpc"
```

#### Start Frontend Dev Server:
```bash
pnpm run dev
# or
npm run dev
```
The frontend client will run on `http://localhost:5173`. Open it in your browser to start using ForgeFlow!

---

## 📘 API Reference Documentation

ForgeFlow automatically generates and serves interactive Scalar API documentation.
1. Make sure the backend server is running.
2. Visit `http://localhost:3001/docs` in your browser.
3. You can review all endpoints, types, parameters, schemas, and test queries directly from the dashboard!
4. The raw OpenAPI 3.0 specification JSON is served at `http://localhost:3001/openapi.json`.

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.
