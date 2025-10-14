# Smart Care Assistant (Monorepo)

A full‑stack healthcare assistant with role‑based portals for Admin, Doctor, and Patient. It provides patient onboarding, appointments, prescriptions, vitals tracking, medication logs with scheduled generation, and downloadable PDF reports.

## Monorepo Structure

- `backend/`: Node.js + Express + MongoDB API
- `frontend/`: Next.js app (React)

## Tech Stack

- **Backend**: Node.js, Express, Mongoose, JWT, Cloudinary, Multer, node-cron, PDFKit
- **Frontend**: Next.js 15, React 19, Axios, React Hook Form, Tailwind CSS
- **Database**: MongoDB

## Key Features

- **Role-based auth**: Admin, Doctor, Patient
- **Appointments**: book/approve/start/complete/cancel workflows
- **Prescriptions**: create/update, latest prescription lookups
- **Vitals**: capture and fetch latest/all vitals
- **Medication logs**: automatic creation per schedule windows (cron), status updates, pending logs view
- **Reports**: server-generated PDFs available for doctor and patient

---

## Getting Started (Local)

### 1) Prerequisites

- Node.js 18+ and npm
- MongoDB running locally or a cloud URI

### 2) Clone and install

```bash
# from repo root
cd backend && npm install
cd ../frontend && npm install
```

### 3) Environment variables

Create `backend/.env` (the backend loads `../.env` from `src/index.js`, which resolves to `backend/.env`).

```env
# Backend
PORT=5002
MONGODB_URI=mongodb://localhost:27017/smart-care-assistant
CORS_ORIGIN=http://localhost:3001
JWT_SECRET=change_me

# Cloudinary (used for profile images, etc.)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `frontend/.env.local`:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5002/api
```

Notes:

- The backend CORS default is `http://localhost:3001`. You can either:
  - run Next dev on port 3001, or
  - change `CORS_ORIGIN` to `http://localhost:3000` if you prefer port 3000.

### 4) Run the apps

- Backend (from `backend/`):

```bash
npm run dev
# or: npm start
```

- Frontend (from `frontend/`):

```bash
# Option A: run on 3001 to match default CORS_ORIGIN
PORT=3001 npm run dev

# Option B: run on 3000 and change backend CORS_ORIGIN accordingly
npm run dev
```

Open the frontend at the chosen port: `http://localhost:3001` (or `3000`).

### 5) (Optional) Create an Admin user

From `backend/`:

```bash
npm run create-admin
```

This runs `src/scripts/createAdmin.js` to seed an initial admin.

### 6) (Optional) Start the medication log cron worker

The scheduled job creates pending medication logs for the current time window.

From `backend/`:

```bash
node src/cron/medicationLogs.js
```

Ensure the same env vars are available to this process (e.g., run from `backend/` so it can read `backend/.env`).

---

## Backend

### Scripts

- `npm run dev`: start API with nodemon at `PORT` (default 5002)
- `npm start`: start API with node
- `npm run create-admin`: seed an initial admin account

### API Base URL

- Local default: `http://localhost:5002/api`

### Notable Routes (high-level)

- `POST /api/auth/*`
- `GET/PUT /api/patients/*`
- `GET/PUT /api/doctors/*`
- `GET/PUT /api/appointments/*` and state endpoints
  - `PUT /api/appointments/:id/approve`
  - `PUT /api/appointments/:id/start`
  - `PUT /api/appointments/:id/complete`
  - `PUT /api/appointments/:id/cancel`
- `GET/POST/PUT /api/prescriptions/*`
- `GET/POST /api/vitals/*`
- `GET/POST/PUT /api/medicationLogs/*`

### PDF Endpoints (served to frontend helpers)

- `GET /api/doctors/reports/summary.pdf`
- `GET /api/doctors/patients/:patientId/report.pdf`
- `GET /api/patients/reports/my.pdf`

### Scheduled Medication Logs

- Time windows (from `src/services/medicationLogScheduler.js`):
  - morning: 06:00–10:00
  - afternoon: 12:00–15:00
  - evening: 17:00–20:00
  - night: 21:00–23:00
- Cron runner (`src/cron/medicationLogs.js`) executes hourly at minute 0.

### Database

- Configured in `src/db/index.js` via `MONGODB_URI`.

---

## Frontend

### Scripts

- `npm run dev`: start Next dev server (default 3000)
- `npm run build`: production build
- `npm start`: start production server

### Env

- `NEXT_PUBLIC_API_URL`: points to backend API base (e.g., `http://localhost:5002/api`)

### Auth & API Client

- Axios instance (`src/utils/api.js`) attaches `Authorization: Bearer <token>` if present and valid.
- On token expiry, it clears local state and redirects to `/`.

### UI Apps

- `src/app/patient/*`: patient portal
- `src/app/doctor/*`: doctor portal
- `src/app/admin/*`: admin portal

---

## Common Workflows

- **Appointments**: patients create requests → doctors approve/start/complete/cancel via dedicated endpoints.
- **Prescriptions**: doctors manage prescriptions; patients and doctors fetch by patient or latest.
- **Vitals**: patients add vitals; latest/all views available.
- **Medication logs**: generated automatically per schedule window; patients/doctors update statuses; pending views available.
- **Reports**: PDFs downloadable from the UI using prebuilt endpoints.

---

## Troubleshooting

- CORS errors: ensure frontend origin matches `CORS_ORIGIN` or adjust one of them.
- 401/403 issues: verify JWT issuance and `NEXT_PUBLIC_API_URL` pointing to the correct backend.
- Mongo connection failures: confirm `MONGODB_URI` and that MongoDB is reachable.
- Cron not creating logs: check that the worker process is running and its env matches the main API env.

## License

ISC
