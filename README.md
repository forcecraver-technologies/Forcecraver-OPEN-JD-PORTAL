# Open JD Portal

A modern, production-ready, full-stack web application for discovering and managing job descriptions (JDs). Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **PostgreSQL**.

> **Strict Rule**: Built with **100% deterministic, rule-based search and SQL queries**. Zero AI, LLM, OpenAI, Gemini, embeddings, or vector databases.

---

## 🌟 Key Features

### 1. Public User Portal
- **Hero & Search Bar**: Large interactive search bar with query suggestions and real-time rule detection badge.
- **Strict Rule-Based Search Engine**:
  - **Rule 1 (`[Company Name] JDs`)**: e.g., `Novigo JDs` extracts company keyword and queries `company_name ILIKE '%Novigo%' AND status = 'ACTIVE'`.
  - **Rule 2 (Job Title Search)**: e.g., `Java Developer` matches across `job_title`, `skills`, and `job_description`.
  - **Rule 3 (`Active JDs`)**: Filters all active opportunities.
  - **Rule 4 (`Today JDs`)**: Filters opportunities posted today where `status = 'ACTIVE'`.
  - **Rule 5 (`Jobs in [Location]`)**: e.g., `Jobs in Ahmedabad` queries `location ILIKE '%Ahmedabad%' AND status = 'ACTIVE'`.
  - **Rule 6 (General Keywords)**: Matches terms across company, title, skills, location, and description.
- **Dynamic Multi-Filters**: Combine Company, Job Title, Skills, Experience, Location, Status, and Posted Date.
- **Responsive Job Cards**: Badges for Active/Closed status, salary pills, skill chips, and posted dates.
- **Dedicated Job Details Page (`/jobs/[id]`)**: Full job description, requirements, company profile links, and closed position alerts.
- **Companies Directory (`/companies`)**: Real-time aggregation of companies with active job counts.
- **Company Details (`/companies/[companyName]`)**: Displays all active positions for a specific organization.

### 2. Secure Admin Management Portal
- **Protected Routes & Edge Middleware**: Guarded under `/admin/*` via HTTP-only JWT sessions.
- **Admin Dashboard (`/admin`)**: Real-time KPI summary cards (Total JDs, Active JDs, Closed JDs, Total Companies) and recent postings.
- **Manage JDs (`/admin/jobs`)**: Responsive table with column sorting, quick status toggle (ACTIVE ⇄ CLOSED), and delete confirmation modal dialogs.
- **Add New JD (`/admin/jobs/new`)**: Rich form with client & server-side validation and immediate database synchronization.
- **Edit JD (`/admin/jobs/[id]/edit`)**: Pre-filled update form with validation.

---

## 🔑 Default Admin Credentials

- **Login URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@forcecraver.com`
- **Password**: `Fcadmin@123`

---

## 🛠️ Tech Stack & Database Architecture

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL 17
- **Authentication**: Native Web Crypto HMAC-SHA256 JWT, HTTP-only secure cookie session, bcryptjs password hashing

### Database Tables (`schema.prisma`)

- **`jobs`**:
  - `id` (UUID PK)
  - `company_name` (Indexed)
  - `job_title` (Indexed)
  - `skills` (Text)
  - `experience` (String)
  - `location` (Indexed)
  - `salary_budget` (String)
  - `job_description` (Text)
  - `posted_date` (Date, Indexed)
  - `status` (`ACTIVE` | `CLOSED`, Indexed)
  - `created_at`, `updated_at` (Timestamps)
- **`admins`**:
  - `id` (UUID PK)
  - `email` (Unique)
  - `password_hash`
  - `name`

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Synchronize database schema with PostgreSQL
npx prisma db push

# 3. Seed realistic jobs & default admin account
npm run seed

# 4. Start production server
npm run build
npm run start
```
