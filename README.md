# LifeTrack

LifeTrack is a calm and intelligent personal finance + lifestyle assistant built on the MERN stack. Track your income, expenses, goals, and lifestyle activities, while an AI co-pilot keeps your budget organised with smart categorisation.

## Features

- **JWT authentication** with secure password hashing and localStorage session caching
- **Responsive dashboard** with realtime streaks, notifications, and animated UI
- **Income & expense tracker** with AI-powered category suggestions and CSV export
- **Goal management** with visual progress history and streak tracking
- **Activity tracker** to log daily rituals (gym, diet, study) and maintain streaks
- **Analytics suite** (Recharts) for category breakdowns, monthly trends, and goal comparisons
- **Smart reminders** generated server-side to nudge users about logging expenses and goals
- **Dark / light / system theme** toggle with persistence

## Project Structure

```
LifeTrack/
├── backend/            # Express API, MongoDB models, controllers, utils
├── frontend/           # React + Vite app (Tailwind CSS, Framer Motion, Recharts)
├── package.json        # Workspace scripts (dev, build, seed)
├── .env.example        # Environment variable template for both stacks
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or remote)

## Quick Start

1. **Clone & install**
   ```bash
   npm install                # workspace dev tools
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. **Configure environments**
   - Copy `.env.example` to `.env` and fill in MongoDB + JWT values.
   - Optionally set `HF_API_KEY` to enable Hugging Face categorisation (fallback keyword classifier is built-in).

3. **Seed demo data (optional)**
   ```bash
   npm run seed
   ```
   Seeds a demo user (`demo@lifetrack.app` / `password123`) with sample transactions, goal, and activity.

4. **Run the stack**
   ```bash
   npm run dev
   ```
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173

5. **Build frontend**
   ```bash
   npm run build
   ```

## Run with Docker

1. **Build and start everything**
   ```bash
   docker compose up --build
   ```
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - MongoDB: mongodb://localhost:27017/lifetrack

2. **Override environment values (optional)**
   - Copy `docker.env.example` to `docker.env`.
   - Update secrets (`JWT_SECRET`, `HF_API_KEY`, etc.).
   - Run with overrides:
     ```bash
     docker compose --env-file docker.env up --build
     ```

3. **Stop services**
   ```bash
   docker compose down
   ```

## Backend Notes

- Express server (`backend/server.js`) bootstraps all feature routes:
  - `/api/auth` – signup/login/logout, preferences update
  - `/api/transactions` – CRUD, monthly summary, CSV export
  - `/api/goals` – CRUD and progress logging
  - `/api/activities` – habits, streak updates
  - `/api/dashboard` – aggregated metrics for dashboard
  - `/api/notifications` – smart reminder feed
  - `/api/ai/categorize` – AI + keyword category detection
  - `/api/settings` – user preference sync
- Uses Mongoose models for Users, Transactions, Goals, Activities.
- AI categorisation cascade: Hugging Face (if key provided) → keyword-based fallback.

## Frontend Notes

- Built with Vite + React, styled via Tailwind CSS and animated with Framer Motion.
- Contexts manage authentication, theming, and dashboard state with persistent storage.
- Axios client (`src/api/apiClient.js`) automatically attaches JWT tokens and handles 401s.
- Pages:
  - `Dashboard` – KPI cards, charts, streaks, notifications
  - `Transactions` – CRUD, filters, AI suggestions, CSV export
  - `Goals` – creation, inline progress updates, completion insights
  - `Activities` – habit log, streak management
  - `Analytics` – multi-chart insights (income vs expense trends, goal completion, category stacks)
  - `Settings` – theme + reminder preferences persisting to backend
  - `Auth` – animated login/register with demo credentials helper

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run backend and frontend together (requires two terminals in some shells) |
| `npm run dev:backend` | Start Express API with Nodemon |
| `npm run dev:frontend` | Run Vite dev server |
| `npm run seed` | Seed MongoDB with demo user & data |
| `npm run build` | Build frontend for production |

## Testing / Verification Ideas

- `npm run seed` then log in with the demo credentials to explore sample data
- Add an expense with only a description (e.g. "Bought protein shake") to see AI auto-fill the category
- Toggle light/dark/system themes and refresh to confirm persistence
- Export transactions as CSV to validate the download flow

## Deployment Checklist

- Set environment variables from `.env.example`
- Provision MongoDB Atlas (or similar) and update `MONGO_URI`
- Provide Hugging Face API key if you want high-quality categorisation
- Serve frontend build (`frontend/dist`) via static hosting; keep backend running on Node server or serverless

Enjoy building a calmer, smarter financial routine with LifeTrack ✨
# LifeTrack
