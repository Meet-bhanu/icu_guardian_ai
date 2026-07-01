<p align="center">
  <h1 align="center">🏥 ICU Guardian AI</h1>
  <p align="center">
    <strong>An AI-Powered Real-Time ICU Patient Monitoring & Management System</strong>
  </p>
  <p align="center">
    <em>Built with React · Express · MariaDB · WebSockets · tRPC · Drizzle ORM</em>
  </p>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Real-Time Systems](#real-time-systems)
- [Authentication & Authorization](#authentication--authorization)
- [Report System](#report-system)
- [Cron Jobs & Heartbeat](#cron-jobs--heartbeat)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roles & Permissions](#roles--permissions)
- [License](#license)

---

## Overview

**ICU Guardian AI** is a full-stack, real-time Intensive Care Unit (ICU) monitoring platform designed to enhance patient safety and clinical workflows. It provides:

- **Real-time vital signs monitoring** — Heart rate, SpO2, blood pressure, temperature, and respiratory rate
- **Intelligent alert escalation** — Warning → Critical → Emergency with mandatory acknowledgment
- **Medication management** — Prescription tracking, automated reminders, and compliance analytics
- **Video call integration** — WebRTC-powered patient-to-admin/doctor communication
- **Live camera feeds** — WebRTC-based remote patient observation
- **AI-powered insights** — LLM integration for clinical analysis and report generation
- **PDF report generation** — Automated patient progress reports with PDFKit
- **Role-based access control** — Separate dashboards for Super Admins, Doctors, and Patients
- **Market validation** — Built-in feedback collection and analytics dashboard

The application uses a **teal/white/black** medical aesthetic with responsive design across desktop, tablet, and mobile.

---

## Key Features

### 🩺 For Doctors / Admins
- **Patient Management** — Register, edit, discharge, and transfer patients with auto-generated credentials
- **Doctor Management** — Add doctors with department and specialization profiles
- **Live Monitoring Dashboard** — Real-time vital signs cards with color-coded status indicators
- **ICU Monitor Waveforms** — Animated ECG-style waveform visualizations
- **Alert Panel** — View active, acknowledged, and resolved alerts with severity indicators
- **Medication Reminders Panel** — Track prescription schedules and patient compliance
- **Video Calls** — Initiate and receive calls with patients
- **Remote Camera Viewer** — Observe patient camera feeds via WebRTC
- **PDF Report Generation** — Generate and download patient progress reports
- **Report Upload** — Upload and store past medical reports (PDF)
- **Audit Logging** — Track all admin actions (create, update, delete, login, logout)
- **Feedback Analytics** — View aggregated user feedback with charts and statistics

### 🏥 For Patients
- **Personal Dashboard** — View vital signs, medications, alerts, and assigned doctor
- **Vital Sign History** — Charts showing heart rate, SpO2, BP, and temperature trends
- **Medication Schedule** — View upcoming medications with acknowledgment capability
- **Video Calls** — Call admin/doctor for consultations
- **Live Camera Feed** — Share camera stream with medical staff
- **Health Trends** — Recovery progress visualization
- **Reports** — Access and download personal medical reports
- **Settings** — Theme preferences, notification configuration

### 🤖 AI & Automation
- **LLM Integration** — Server-side AI completions via Forge API with exponential backoff retries
- **Automated Medication Reminders** — Heartbeat cron-based scheduling
- **Compliance Tracking** — Automated daily compliance record updates
- **Alert Escalation** — Periodic escalation checks for unacknowledged alerts

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework with functional components & hooks |
| **TypeScript 5.9** | Type-safe development |
| **Vite 5** | Build tool & dev server with HMR |
| **TailwindCSS 4** | Utility-first CSS framework |
| **Radix UI** | Accessible, unstyled headless UI primitives (53 components) |
| **Wouter** | Lightweight client-side routing |
| **TanStack React Query** | Server state management & caching |
| **tRPC React Query** | End-to-end type-safe API client |
| **Recharts** | Data visualization charts |
| **Framer Motion** | Animations & transitions |
| **GSAP** | Advanced scroll & timeline animations |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |
| **React Hook Form + Zod** | Form handling with schema validation |
| **date-fns** | Date utility functions |

### Backend
| Technology | Purpose |
|---|---|
| **Express 4** | HTTP server framework |
| **tRPC** | Type-safe RPC framework |
| **Drizzle ORM** | Type-safe SQL ORM for MariaDB/MySQL |
| **MariaDB / MySQL** | Relational database |
| **WebSocket (ws)** | Real-time bidirectional communication |
| **Jose** | JWT signing & verification |
| **bcryptjs** | Password hashing |
| **PDFKit** | PDF document generation |
| **QRCode** | QR code generation |
| **nanoid** | Unique ID generation |
| **Zod** | Runtime schema validation |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Vercel** | Frontend deployment |
| **esbuild** | Server-side bundling for production |
| **Vitest** | Unit & integration testing |
| **Prettier** | Code formatting |
| **Firebase** | Optional authentication & storage |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────────┐│
│  │ Public Pages │  │ Auth Context │  │ Dashboard Pages            ││
│  │  - Home      │  │  - Login     │  │  - Admin   (/dashboard/*) ││
│  │  - Feedback  │  │  - Register  │  │  - Patient (/patient/*)   ││
│  │  - 404       │  │  - Session   │  │  - Doctor  (/doctor/*)    ││
│  └─────────────┘  └──────────────┘  └────────────────────────────┘│
│                            │                                       │
│                    ┌───────┴────────┐                              │
│                    │ tRPC Client    │    WebSocket Client           │
│                    │ (React Query)  │    (ws://host/ws/calls)      │
│                    └───────┬────────┘            │                  │
└────────────────────────────┼────────────────────┼──────────────────┘
                             │ HTTP               │ WS
┌────────────────────────────┼────────────────────┼──────────────────┐
│                     SERVER (Express + Node.js)                     │
│  ┌─────────────────┐  ┌───┴────────┐  ┌────────┴───────────────┐ │
│  │ Auth Routes      │  │ tRPC Router│  │ WebSocket Server       │ │
│  │  POST /api/login │  │ /api/trpc  │  │  - Call Signaling      │ │
│  │  POST /api/logout│  │  - auth    │  │  - Camera Relay        │ │
│  │  GET  /api/me    │  │  - patients│  │  - WebRTC Negotiation  │ │
│  │  POST /api/admin │  │  - vitals  │  └────────────────────────┘ │
│  │       /create-*  │  │  - alerts  │                              │
│  └─────────────────┘  │  - meds    │  ┌────────────────────────┐ │
│                        │  - calls   │  │ Report Routes          │ │
│  ┌─────────────────┐  │  - feedback│  │  GET  /api/reports     │ │
│  │ Cron Jobs        │  └───────────┘  │  POST /api/reports/*   │ │
│  │  - Med Reminders │                  └────────────────────────┘ │
│  │  - Compliance    │  ┌────────────────────────┐                 │
│  │  - Escalation    │  │ LLM / AI Service       │                 │
│  └─────────────────┘  │  Forge API Integration  │                 │
│                        └────────────────────────┘                 │
│                                    │                               │
│                        ┌───────────┴───────────┐                  │
│                        │   Drizzle ORM          │                  │
│                        │   (MySQL2 Driver)      │                  │
│                        └───────────┬───────────┘                  │
└────────────────────────────────────┼──────────────────────────────┘
                                     │
                           ┌─────────┴──────────┐
                           │    MariaDB / MySQL  │
                           │    Database         │
                           └────────────────────┘
```

---

## Project Structure

```
Heathhalo4/
├── client/                          # Frontend React application
│   ├── index.html                   # HTML entry point
│   ├── public/                      # Static assets
│   └── src/
│       ├── App.tsx                   # Root component with routing & providers
│       ├── main.tsx                  # React DOM entry point
│       ├── index.css                # Global styles & Tailwind directives
│       ├── const.ts                 # Client-side constants
│       ├── _core/                   # Core client utilities
│       ├── components/
│       │   ├── ui/                  # 53 Radix-based UI primitives (shadcn/ui)
│       │   ├── auth/                # AuthRoute guard component
│       │   ├── patient-sections/    # Reusable patient content panels
│       │   │   ├── PatientOverviewContent.tsx
│       │   │   ├── ReportsContent.tsx
│       │   │   ├── HealthTrendsContent.tsx
│       │   │   ├── MedicationsContent.tsx
│       │   │   ├── DoctorsContent.tsx
│       │   │   └── FamilyContactsContent.tsx
│       │   ├── AlertPanel.tsx            # Alert management panel
│       │   ├── AIChatBox.tsx             # AI chat interface
│       │   ├── AppLayout.tsx             # Top-level app layout shell
│       │   ├── CriticalAlertOverlay.tsx  # Full-screen critical alert overlay
│       │   ├── DashboardLayout.tsx       # Admin dashboard sidebar layout
│       │   ├── Footer.tsx                # Landing page footer
│       │   ├── ICUMonitorWaveform.tsx     # Animated ECG waveform visualizer
│       │   ├── LiveCameraFeed.tsx        # Patient camera stream component
│       │   ├── LoginLayout.tsx           # Login page shared layout
│       │   ├── Map.tsx                   # Google Maps integration
│       │   ├── MedicationRemindersPanel.tsx
│       │   ├── MedicationsSchedule.tsx
│       │   ├── PatientDetailLayout.tsx   # Per-patient detail view wrapper
│       │   ├── RemoteCameraViewer.tsx    # Admin-side camera viewer
│       │   ├── VideoCallWidget.tsx       # Floating video call UI widget
│       │   └── VitalSignsCard.tsx        # Vital signs display card
│       ├── contexts/
│       │   ├── ThemeContext.tsx           # Light/dark theme provider
│       │   ├── CriticalAlertContext.tsx   # Critical alert state management
│       │   ├── VideoCallContext.tsx       # Video call state & WebSocket
│       │   └── CameraStreamContext.tsx   # Camera WebRTC stream management
│       ├── hooks/
│       │   ├── useIcuAuth.ts             # Authentication hook (login/logout/session)
│       │   ├── useCallSocket.ts          # WebSocket connection for calls
│       │   ├── useCriticalVitalMonitor.ts # Vital threshold monitoring
│       │   ├── useMedicationSchedule.ts  # Medication schedule management
│       │   ├── useAdminSelectedPatient.ts # Admin patient selection state
│       │   ├── usePatientAuth.ts         # Patient-specific auth hook
│       │   ├── useComposition.ts         # Component composition utility
│       │   ├── useMobile.tsx             # Responsive breakpoint detection
│       │   └── usePersistFn.ts           # Stable function reference hook
│       ├── pages/
│       │   ├── Home.tsx                  # Public landing page
│       │   ├── Login.tsx                 # Unified login page (all roles)
│       │   ├── RoleSelection.tsx         # Post-OAuth role selection
│       │   ├── Feedback.tsx              # Public feedback form
│       │   ├── VideoCallPage.tsx         # Full-screen video call
│       │   ├── DoctorDashboard.tsx       # Doctor-specific dashboard
│       │   ├── PatientDashboard.tsx       # Patient portal main dashboard
│       │   ├── ComponentShowcase.tsx      # UI component library demo
│       │   ├── NotFound.tsx              # 404 page
│       │   ├── dashboard/               # Admin dashboard pages (15 pages)
│       │   │   ├── Dashboard.tsx              # Admin main overview
│       │   │   ├── PatientsPage.tsx            # Patient list & cards view
│       │   │   ├── PatientManagementPage.tsx   # CRUD patient management
│       │   │   ├── DoctorManagementPage.tsx    # CRUD doctor management
│       │   │   ├── LiveMonitoringPage.tsx      # Real-time vital monitoring
│       │   │   ├── WaveformsPage.tsx           # ECG-style waveform page
│       │   │   ├── MedicationsPage.tsx         # Medication management
│       │   │   ├── AlertsPage.tsx              # Alert management
│       │   │   ├── ReportsPage.tsx             # Reports listing
│       │   │   ├── UploadPastReportsPage.tsx   # Report upload interface
│       │   │   ├── HealthTrendsPage.tsx        # Health analytics
│       │   │   ├── DoctorsPage.tsx             # Doctor list
│       │   │   ├── FamilyContactsPage.tsx      # Emergency contacts
│       │   │   ├── FeedbackAnalytics.tsx       # Feedback dashboard
│       │   │   └── SettingsPage.tsx            # Admin settings
│       │   ├── patient/                 # Patient portal pages (10 pages)
│       │   │   ├── PatientOverviewPage.tsx
│       │   │   ├── PatientMonitoringPage.tsx
│       │   │   ├── PatientWaveformsPage.tsx
│       │   │   ├── PatientMedicationsPage.tsx
│       │   │   ├── PatientAlertsPage.tsx
│       │   │   ├── PatientReportsPage.tsx
│       │   │   ├── PatientTrendsPage.tsx
│       │   │   ├── PatientDoctorsPage.tsx
│       │   │   ├── PatientFamilyPage.tsx
│       │   │   └── PatientSettingsPage.tsx
│       │   └── patient-detail/          # Per-patient detail pages (admin)
│       │       ├── PatientOverviewPage.tsx
│       │       ├── PatientReportsPage.tsx
│       │       ├── PatientTrendsPage.tsx
│       │       ├── PatientMedicationsDetailPage.tsx
│       │       ├── PatientDoctorsPage.tsx
│       │       └── PatientFamilyPage.tsx
│       ├── lib/                         # Utility functions
│       └── scripts/                     # Client build/helper scripts
│
├── server/                          # Backend Express application
│   ├── _core/                       # Core server infrastructure
│   │   ├── index.ts                 # Server entry point & bootstrap
│   │   ├── trpc.ts                  # tRPC router & procedure setup
│   │   ├── context.ts              # tRPC request context creation
│   │   ├── socket.ts               # WebSocket server for calls & camera
│   │   ├── llm.ts                  # LLM/AI integration (Forge API)
│   │   ├── heartbeat.ts            # Heartbeat cron job scheduler SDK
│   │   ├── notification.ts          # Owner notification service
│   │   ├── voiceTranscription.ts    # Voice-to-text transcription
│   │   ├── imageGeneration.ts       # AI image generation
│   │   ├── map.ts                  # Google Maps integration
│   │   ├── dataApi.ts              # External data API client
│   │   ├── sdk.ts                  # Manus platform SDK
│   │   ├── oauth.ts                # Manus OAuth flow
│   │   ├── cookies.ts              # Cookie configuration
│   │   ├── env.ts                  # Environment variable resolution
│   │   ├── vite.ts                 # Vite dev server middleware
│   │   ├── storageProxy.ts         # S3 storage proxy
│   │   ├── systemRouter.ts         # System health tRPC router
│   │   └── types/                  # Server type definitions
│   ├── auth/                        # Authentication system
│   │   ├── routes.ts               # Express auth REST routes (login, CRUD)
│   │   ├── middleware.ts            # Auth middleware & guards
│   │   ├── jwt.ts                  # JWT sign/verify (jose)
│   │   ├── password.ts             # Password hashing (bcryptjs)
│   │   ├── audit.ts                # Audit logging helper
│   │   ├── devUsers.ts             # In-memory dev fallback users
│   │   └── utils.ts                # ID generation utilities
│   ├── reports/                     # Report subsystem
│   │   ├── routes.ts               # Report REST endpoints
│   │   ├── generatePdf.ts          # PDFKit report generator
│   │   ├── store.ts                # Report metadata & file storage
│   │   └── seed.ts                 # Demo report seeding
│   ├── scripts/                     # Database management scripts
│   │   ├── setup-database.ts        # Create database & run migrations
│   │   ├── seed-super-admin.ts      # Seed super admin account
│   │   └── seed-demo-users.ts       # Seed demo user accounts
│   ├── routers.ts                   # Main tRPC app router (all procedures)
│   ├── db.ts                       # Database access layer (all queries)
│   ├── storage.ts                  # S3 file storage via Forge presigned URLs
│   ├── cron-jobs.ts                # Cron job handlers
│   ├── seed-demo-data.ts           # Demo data seeding
│   └── *.test.ts                   # Vitest test files
│
├── drizzle/                         # Database schema & migrations
│   ├── schema.ts                   # Complete Drizzle ORM schema (11 tables)
│   ├── relations.ts                # Table relation definitions
│   ├── migrations/                 # Auto-generated migration files
│   ├── meta/                       # Drizzle migration metadata
│   └── *.sql                       # SQL migration scripts
│
├── shared/                          # Code shared between client & server
│   ├── _core/
│   │   └── errors.ts               # Shared error definitions
│   ├── calls.ts                    # Call types, payload, socket event types
│   ├── const.ts                    # Shared constants (cookies, roles, etc.)
│   ├── reports.ts                  # Report type definitions
│   └── types.ts                    # Common type exports
│
├── data/                            # Local data storage
│   └── reports/                    # Generated/uploaded PDF report files
│
├── scripts/
│   └── start-mariadb.js            # MariaDB startup helper script
│
├── patches/
│   └── wouter@3.7.1.patch          # Wouter routing patch
│
├── references/                      # Integration documentation
│   ├── llm-integration.md          # LLM API usage guide
│   ├── file-storage.md             # S3 storage documentation
│   ├── maps-integration.md         # Google Maps integration guide
│   ├── manus-oauth.md              # OAuth flow documentation
│   ├── periodic-updates.md         # Heartbeat cron system docs
│   ├── voice-transcription.md      # Voice transcription API
│   ├── image-generation.md         # Image generation API
│   ├── data-api.md                 # Data API reference
│   └── owner-notifications.md     # Notification system docs
│
├── package.json                     # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration + custom plugins
├── vitest.config.ts                # Vitest test configuration
├── drizzle.config.ts               # Drizzle Kit migration config
├── vercel.json                     # Vercel deployment config
├── components.json                 # shadcn/ui component config
├── .env.example                    # Environment variable template
├── .prettierrc                     # Prettier formatting config
├── .prettierignore                 # Prettier ignore patterns
├── .gitignore                      # Git ignore patterns
├── firestore.rules                 # Firebase security rules
├── template.json                   # Project template metadata
└── todo.md                         # Project roadmap & checklist
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **pnpm** (package manager — `npm i -g pnpm`)
- **MariaDB** or **MySQL** (v8+ recommended)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd Heathhalo4

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and secrets

# 4. Start MariaDB (if using the included helper)
npm run db:start

# 5. Set up the database (create DB + run migrations)
npm run db:setup

# 6. Push latest schema to DB
npm run db:push

# 7. Seed the super admin account
npm run seed:admin

# 8. (Optional) Seed demo users for testing
npm run seed:demo

# 9. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000** (or the next available port).

### Demo Credentials

| Role | Username | Password |
|---|---|---|
| Super Admin | `superadmin` | `SuperAdmin@2026` |

Additional demo users are created via `npm run seed:demo`.

### NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot-reload (tsx watch) |
| `npm run build` | Production build (Vite client + esbuild server) |
| `npm run start` | Run production build |
| `npm run check` | TypeScript type checking (no emit) |
| `npm run format` | Format all files with Prettier |
| `npm run test` | Run Vitest test suite |
| `npm run db:push` | Generate & apply database migrations |
| `npm run db:setup` | Create database and run initial setup |
| `npm run db:start` | Start MariaDB via helper script |
| `npm run seed:admin` | Seed the super admin user |
| `npm run seed:demo` | Seed demo patient/doctor accounts |

---

## Environment Variables

Create a `.env` file from `.env.example`:

```env
# JWT secret for session tokens (CHANGE in production!)
JWT_SECRET=icu-guardian-dev-secret-change-in-production

# MariaDB connection string
DATABASE_URL=mysql://root@127.0.0.1:3306/icu_guardian

# Super Admin seed credentials
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=SuperAdmin@2026
SUPER_ADMIN_EMAIL=admin@healthhalo.com
SUPER_ADMIN_NAME=Super Admin

# Optional: Manus OAuth (for production deployment)
# OAUTH_SERVER_URL=
# VITE_APP_ID=
# VITE_OAUTH_PORTAL_URL=
# OWNER_OPEN_ID=

# Optional: Firebase Configuration
# VITE_FIREBASE_API_KEY=
# VITE_FIREBASE_AUTH_DOMAIN=
# VITE_FIREBASE_PROJECT_ID=
# VITE_FIREBASE_STORAGE_BUCKET=
# VITE_FIREBASE_MESSAGING_SENDER_ID=
# VITE_FIREBASE_APP_ID=
```

---

## Database Schema

The database consists of **11 tables** defined using Drizzle ORM in `drizzle/schema.ts`:

```
┌──────────────────────────────────────────────────────────┐
│                       users                               │
│  id · openId · username · passwordHash · name · email     │
│  phone · loginMethod · role · isActive · timestamps       │
├──────────────────────────────────────────────────────────┤
│  Roles: user | admin | super_admin | doctor | patient     │
│         | operator                                        │
└──────────┬─────────────────────────┬─────────────────────┘
           │                         │
     ┌─────┴─────┐            ┌─────┴─────┐
     │  doctors   │            │  patients  │
     │ userId(FK) │            │ userId(FK) │
     │ publicId   │◀───────────│ doctorId   │
     │ department │  assigned  │ publicId   │
     │ specializ. │            │ bedNumber  │
     └────────────┘            │ age/gender │
                               │ bloodGroup │
                               │ status     │
                               └─────┬──────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
        ┌─────┴─────┐        ┌──────┴──────┐       ┌──────┴──────────┐
        │   vitals   │        │   alerts    │       │  medications    │
        │ heartRate  │        │ alertType   │       │ medicationName  │
        │ spO2       │        │ severity    │       │ dosage          │
        │ BP values  │        │ status      │       │ frequency       │
        │ temperature│        │ ack/resolve │       │ prescribedBy    │
        │ respRate   │        │ notes       │       │ status          │
        └────────────┘        └──────┬──────┘       └──────┬──────────┘
                                     │                      │
                              ┌──────┴──────┐       ┌──────┴──────────────┐
                              │  alertLogs  │       │ medicationReminders │
                              │ action      │       │ scheduledTime       │
                              │ performedBy │       │ reminderDate        │
                              │ responseTime│       │ status              │
                              └─────────────┘       └──────┬──────────────┘
                                                           │
                                                    ┌──────┴──────────────┐
                                                    │ complianceRecords   │
                                                    │ totalReminders      │
                                                    │ acknowledgedReminders│
                                                    │ missedReminders     │
                                                    │ compliancePercentage│
                                                    └─────────────────────┘

  ┌────────────────────────┐     ┌────────────────────────┐
  │  notificationPreferences│     │      auditLogs         │
  │  pushEnabled           │     │  performedBy           │
  │  emailEnabled          │     │  action                │
  │  criticalOnly          │     │  entityType/Id         │
  │  quietHours            │     │  ipAddress             │
  └────────────────────────┘     └────────────────────────┘

  ┌────────────────────────┐
  │       feedback          │
  │  fullName · email       │
  │  userRole · ratings     │
  │  recommend · useInHosp. │
  │  suggestions            │
  └────────────────────────┘
```

### Patient Status Values
`admitted` · `monitoring` · `critical` · `discharged` · `transferred`

### Alert Types
`critical_heart_rate` · `critical_spo2` · `critical_bp` · `critical_temperature` · `fall_detection` · `bed_exit` · `medication_missed`

### Alert Severity Levels
`warning` → `critical` → `emergency`

### Medication Frequencies
`once_daily` · `twice_daily` · `three_times_daily` · `four_times_daily` · `every_6_hours` · `every_8_hours` · `every_12_hours` · `as_needed`

---

## API Reference

### REST Auth Routes (`/api/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Health check (API + DB status) |
| `POST` | `/api/login` | No | Credential-based login |
| `POST` | `/api/logout` | No | Clear session cookie |
| `GET` | `/api/me` | Yes | Get current user profile |
| `POST` | `/api/admin/create-patient` | Admin | Create patient + auto-generate credentials |
| `POST` | `/api/admin/create-doctor` | Admin | Create doctor + auto-generate credentials |
| `GET` | `/api/admin/patients` | Admin | List all patients |
| `GET` | `/api/admin/doctors` | Admin | List all doctors |
| `GET` | `/api/patients/:id` | Auth | Get patient by ID |
| `PUT` | `/api/patients/:id` | Admin | Update patient record |
| `DELETE` | `/api/patients/:id` | Admin | Delete patient (deactivate user) |
| `POST` | `/api/admin/reset-password/:userId` | Admin | Reset user password |
| `PATCH` | `/api/admin/users/:userId/status` | Admin | Activate/deactivate user |
| `DELETE` | `/api/admin/users/:userId` | Admin | Delete user account |
| `GET` | `/api/admin/audit-logs` | Admin | Get audit log history |

### REST Report Routes (`/api/reports/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports/patients` | List demo patients for reports |
| `GET` | `/api/reports` | List reports (filter by patientId, type) |
| `GET` | `/api/reports/:id` | Get report metadata by ID |
| `GET` | `/api/reports/:id/download` | Download report PDF |
| `POST` | `/api/reports/generate` | Generate patient progress PDF |
| `POST` | `/api/reports/upload` | Upload past report (base64 PDF) |

### tRPC Procedures (`/api/trpc/`)

#### Auth
- `auth.me` — Get current session user
- `auth.logout` — Clear session
- `auth.setRole` — Update user role (protected)

#### Patients
- `patients.getByUserId` — Get patient record for logged-in user
- `patients.getAssignedPatients` — Get doctor's assigned patients
- `patients.create` — Create patient record
- `patients.update` — Update patient (doctors only)

#### Vitals
- `vitals.getLatest` — Latest vital signs for a patient
- `vitals.getHistory` — Vital signs history (configurable limit)
- `vitals.create` — Record new vital signs (doctors/operators)

#### Alerts
- `alerts.getActive` — Active alerts for a patient
- `alerts.getHistory` — Alert history
- `alerts.create` — Create new alert
- `alerts.acknowledge` — Acknowledge alert
- `alerts.resolve` — Resolve alert with notes

#### Medications
- `medications.getByPatient` — Active medications for a patient
- `medications.create` — Prescribe medication (doctors only)

#### Medication Reminders
- `medicationReminders.getPending` — Get pending reminders
- `medicationReminders.getByPatient` — Reminders for a patient
- `medicationReminders.acknowledge` — Acknowledge reminder
- `medicationReminders.markMissed` — Mark as missed

#### Compliance
- `compliance.getByPatientAndMedication` — Compliance record lookup

#### Video Calls
- `calls.initiate` — Start a call (patient or admin)
- `calls.accept` — Accept incoming call
- `calls.decline` — Decline incoming call
- `calls.end` — End active call

#### Feedback
- `feedback.submit` — Submit product feedback
- `feedback.getAll` — Get all feedback entries
- `feedback.getStats` — Aggregated feedback statistics

---

## Real-Time Systems

### WebSocket Server (`/ws/calls`)

The WebSocket server powers two real-time features:

#### 1. Video Call Signaling
- **Admin ↔ Patient** bidirectional call initiation
- Call lifecycle: `idle` → `calling` → `connected` → `ended`
- Events: `call-request`, `call-accepted`, `call-declined`, `call-ended`, `call-updated`, `pending-calls`
- Auto-cleanup of ended calls after 2 seconds

#### 2. Camera Stream Relay (WebRTC)
- Patient camera → Admin viewer via WebRTC negotiation
- SDP offer/answer relay through WebSocket signaling
- ICE candidate forwarding between peers
- Events: `camera-offer`, `camera-answer`, `camera-ice-candidate`, `camera-stream-started`, `camera-stream-stopped`

#### Authentication
WebSocket connections authenticate via query parameter tokens:
- Admin: `demo-admin`
- Patient: `demo-patient-{PATIENT_ID}`

---

## Authentication & Authorization

### Authentication Flow

1. **Login**: POST to `/api/login` with `username`, `password`, `role`
2. **JWT Token**: Server signs a JWT with `jose` (HS256, 24hr/30day expiry)
3. **Cookie**: Token stored in `icu_auth_session` HTTP-only cookie
4. **Session Check**: `GET /api/me` validates cookie on each page load
5. **Logout**: `POST /api/logout` clears the cookie

### Role-Based Access

| Role | Dashboard | Capabilities |
|---|---|---|
| `super_admin` | `/dashboard` | Full CRUD on patients, doctors, users. Audit logs. |
| `admin` | `/dashboard` | Same as super_admin |
| `doctor` | `/doctor/dashboard` | View assigned patients, record vitals, prescribe meds |
| `patient` | `/patient/dashboard` | View own vitals, medications, alerts. Acknowledge reminders. |
| `operator` | — | Record vitals, manage reminders |

### Route Protection
- **`AuthRoute`** component wraps protected pages
- **`requireAuth()`** Express middleware validates JWT on REST endpoints
- **`protectedProcedure`** tRPC middleware for authenticated procedures

### Dev Mode Fallback
When the database is unavailable, the system falls back to in-memory dev users defined in `server/auth/devUsers.ts`, allowing development without a running database.

---

## Report System

### Types of Reports
| Type | Description |
|---|---|
| `current` | Auto-generated patient progress reports |
| `past` | Uploaded historical medical reports |
| `lab` | Uploaded laboratory test results |
| `scan` | Uploaded imaging/scan reports |

### PDF Generation
Patient progress reports are generated using **PDFKit** with:
- ICU Guardian AI branding (teal color scheme)
- Patient demographics and bed assignment
- Current vital signs snapshot
- Clinical summary, observations, and recommendations
- Active medications list
- Recovery progress timeline
- Disclaimer footer

### Storage
Reports are stored locally in `data/reports/files/` as PDF files, with metadata tracked in the report store. Each report gets a UUID-based filename.

---

## Cron Jobs & Heartbeat

The server integrates with the **Heartbeat API** for scheduled task execution:

### Medication Reminders (Hourly)
- Checks for pending medication reminders within the current hour
- Updates reminder status to "sent"
- Sends owner notifications with medication details

### Daily Compliance Updates (Daily at midnight UTC)
- Aggregates reminder statuses per patient/medication
- Calculates compliance percentages
- Creates or updates compliance records

### Alert Escalation (Every 5 minutes)
- Checks for unacknowledged critical alerts
- Escalates alerts that haven't been addressed (placeholder for full implementation)

---

## Testing

The project uses **Vitest** for testing. Test files are co-located with source:

```bash
# Run all tests
npm run test
```

### Test Files
| File | Coverage |
|---|---|
| `server/auth.test.ts` | Login, authentication, and session management |
| `server/auth.logout.test.ts` | Logout flow |
| `server/procedures.test.ts` | tRPC procedure validation |
| `server/feedback.test.ts` | Feedback submission and statistics |
| `client/src/components/VitalSignsCard.test.tsx` | Vital signs UI rendering |

---

## Deployment

### Vercel (Frontend)

The `vercel.json` is configured for SPA deployment:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Production Build

```bash
# Build both client (Vite) and server (esbuild)
npm run build

# Start production server
npm run start
```

The production build:
1. Vite compiles the React SPA to `dist/public/`
2. esbuild bundles the Express server to `dist/index.js`
3. The server serves the static SPA and handles API requests

---

## Roles & Permissions

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN / ADMIN                       │
│  ✅ Manage patients (create, update, delete)                │
│  ✅ Manage doctors (create, update, delete)                 │
│  ✅ Reset passwords                                         │
│  ✅ Activate/deactivate user accounts                       │
│  ✅ View audit logs                                         │
│  ✅ View all patient vitals, alerts, medications             │
│  ✅ Generate and download reports                           │
│  ✅ Upload past reports                                      │
│  ✅ View feedback analytics                                  │
│  ✅ Initiate video calls with patients                      │
│  ✅ View patient camera feeds                                │
├─────────────────────────────────────────────────────────────┤
│                        DOCTOR                                │
│  ✅ View assigned patients                                   │
│  ✅ Record vital signs                                       │
│  ✅ Prescribe medications                                    │
│  ✅ Update patient status                                    │
│  ✅ Acknowledge and resolve alerts                           │
│  ❌ Cannot manage other doctors or admins                    │
├─────────────────────────────────────────────────────────────┤
│                        PATIENT                               │
│  ✅ View own vitals and history                              │
│  ✅ View own medications and schedule                        │
│  ✅ Acknowledge medication reminders                         │
│  ✅ View assigned doctor information                         │
│  ✅ Initiate video calls                                     │
│  ✅ Share camera feed                                        │
│  ✅ View and download own reports                            │
│  ❌ Cannot access other patients' data                       │
│  ❌ Cannot modify medical records                            │
└─────────────────────────────────────────────────────────────┘
```

---

## License

This project is licensed under the **MIT License**. See the `package.json` for details.

---

<p align="center">
  <strong>ICU Guardian AI</strong> — Enhancing Patient Safety Through Intelligent Monitoring
</p>
